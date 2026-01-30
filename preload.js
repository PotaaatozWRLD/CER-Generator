const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // API Key management
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),

    // User Info management
    getUserInfo: () => ipcRenderer.invoke('get-user-info'),
    saveUserInfo: (userInfo) => ipcRenderer.invoke('save-user-info', userInfo),

    // Gemini API
    callGeminiAPI: (apiKey, prompt) =>
        ipcRenderer.invoke('call-gemini-api', { apiKey, prompt }),

    // File operations - PDF export
    generatePDFDocument: (cerMarkdown, defaultName) =>
        ipcRenderer.invoke('generate-pdf-document', { cerMarkdown, defaultName }),

    // Diagram generation
    generateDiagram: (prompt, imageName) =>
        ipcRenderer.invoke('generate-diagram', { prompt, imageName }),

    // App info
    getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
