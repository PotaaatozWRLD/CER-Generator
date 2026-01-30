const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');
const fetch = require('node-fetch');

// Configure fetch globally for Node.js environment
global.fetch = fetch;

// Initialize secure store for API key
const store = new Store({
    encryptionKey: 'cer-generator-secure-key-v1'
});

let mainWindow;

// Enable hot reload in development
if (process.env.NODE_ENV === 'development') {
    try {
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
        });
    } catch (err) {
        console.log('Hot reload not available');
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        backgroundColor: '#0f0f23',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        },
        autoHideMenuBar: true
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Handlers

// Get API Key from secure storage
ipcMain.handle('get-api-key', async () => {
    return store.get('geminiApiKey', '');
});

// Save API Key to secure storage
ipcMain.handle('save-api-key', async (event, apiKey) => {
    store.set('geminiApiKey', apiKey);
    return { success: true };
});

// Get User Info from secure storage
ipcMain.handle('get-user-info', async () => {
    return {
        name: store.get('userName', ''),
        promo: store.get('userPromo', ''),
        bloc: store.get('userBloc', ''),
        title: store.get('prositTitle', ''),
        date: store.get('cerDate', '')
    };
});

// Save User Info to secure storage
ipcMain.handle('save-user-info', async (event, userInfo) => {
    if (userInfo.name !== undefined) store.set('userName', userInfo.name);
    if (userInfo.promo !== undefined) store.set('userPromo', userInfo.promo);
    if (userInfo.bloc !== undefined) store.set('userBloc', userInfo.bloc);
    if (userInfo.title !== undefined) store.set('prositTitle', userInfo.title);
    if (userInfo.date !== undefined) store.set('cerDate', userInfo.date);
    return { success: true };
});

// Call Gemini API
ipcMain.handle('call-gemini-api', async (event, { apiKey, prompt }) => {
    const maxRetries = 2;
    const retryDelay = 10000;
    const modelDelay = 3000;
    
    // Modèles selon la documentation officielle Google
    // https://ai.google.dev/gemini-api/docs/quickstart
    const modelsToTry = [
        'gemini-3-flash-preview',  // Gemini 3 (dernière version)
        'gemini-2.5-flash',
        'gemini-2.5-pro'
    ];
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        for (let i = 0; i < modelsToTry.length; i++) {
            const modelName = modelsToTry[i];
            try {
                const { GoogleGenerativeAI } = require('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(apiKey);

                console.log(`Attempting generation with ${modelName} (attempt ${attempt}/${maxRetries})...`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig: {
                        maxOutputTokens: 65536,  // Maximum pour Gemini 3 Flash
                        temperature: 0.7,
                    }
                });

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                console.log(`✅ Success with model: ${modelName}`);
                return { success: true, data: text, model: modelName };

            } catch (error) {
                console.warn(`Model ${modelName} failed:`, error.message);
                
                // Si c'est une erreur de quota (429), on arrête tout de suite ce modèle
                if (error.message.includes('429') || error.message.includes('quota')) {
                    console.log(`⚠️ Quota exceeded for ${modelName}, trying next model immediately...`);
                    continue; // Pas d'attente, on passe direct au suivant
                }
                
                // Pour les autres erreurs, attendre avant le prochain modèle
                if (i < modelsToTry.length - 1) {
                    console.log(`Waiting ${modelDelay}ms before trying next model...`);
                    await new Promise(resolve => setTimeout(resolve, modelDelay));
                }
            }
        }
        
        // All models failed for this attempt
        console.error(`Attempt ${attempt}/${maxRetries} failed - all models tried`);
        
        // Wait before next retry
        if (attempt < maxRetries) {
            console.log(`Waiting ${retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    
    // All attempts exhausted
    console.error('❌ All models and retries exhausted');
    return {
        success: false,
        error: 'Quota API dépassé ou problème de connexion. Si le quota est dépassé, réessayez dans quelques heures. Sinon, vérifiez votre connexion internet et attendez 2-3 minutes avant de réessayer.'
    };
});

// Generate and save PDF document
ipcMain.handle('generate-pdf-document', async (event, { cerMarkdown, defaultName }) => {
    try {
        const { generatePDFFromHTML } = require('./html-pdf-generator.js');
        const buffer = await generatePDFFromHTML(cerMarkdown, mainWindow);

        const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
            title: 'Enregistrer le CER',
            defaultPath: defaultName || 'CER_Prosit_Retour.pdf',
            filters: [{ name: 'Documents PDF', extensions: ['pdf'] }]
        });

        if (canceled || !filePath) {
            return { success: false, canceled: true };
        }

        await fs.writeFile(filePath, buffer);
        return { success: true, filePath };
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return { success: false, error: error.message };
    }
});

// Get app version
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

