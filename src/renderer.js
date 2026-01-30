// renderer.js - UI Logic and Event Handling

let generatedCER = '';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    setupEventListeners();
});

async function initApp() {
    // Load saved API key
    const savedApiKey = await window.electronAPI.getApiKey();
    if (savedApiKey) {
        document.getElementById('apiKeyInput').value = savedApiKey;
        showApiStatus('Clé API chargée', 'success');
    }

    // Load saved user info
    const savedUserInfo = await window.electronAPI.getUserInfo();
    if (savedUserInfo.name) {
        document.getElementById('studentName').value = savedUserInfo.name;
    }
    if (savedUserInfo.promo) {
        document.getElementById('studentPromo').value = savedUserInfo.promo;
    }
    if (savedUserInfo.bloc) {
        document.getElementById('bloc').value = savedUserInfo.bloc;
    }
    if (savedUserInfo.title) {
        document.getElementById('prositTitle').value = savedUserInfo.title;
    }
    if (savedUserInfo.date) {
        document.getElementById('dateInput').value = savedUserInfo.date;
    }

    // Get app version
    const version = await window.electronAPI.getAppVersion();
    console.log('CER Generator v' + version);
}

function setupEventListeners() {
    const prositInput = document.getElementById('prositInput');
    const resourcesInput = document.getElementById('resourcesInput');
    const charCount = document.getElementById('charCount');
    const resourcesCount = document.getElementById('resourcesCount');
    const clearBtn = document.getElementById('clearBtn');
    const clearResourcesBtn = document.getElementById('clearResourcesBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const toggleApiKey = document.getElementById('toggleApiKey');
    const generateBtn = document.getElementById('generateBtn');
    const exportBtn = document.getElementById('exportBtn');

    // Character counter for Prosit
    prositInput.addEventListener('input', () => {
        const count = prositInput.value.length;
        charCount.textContent = `${count} caractères`;
    });

    // Character counter for Resources
    resourcesInput.addEventListener('input', () => {
        const count = resourcesInput.value.length;
        resourcesCount.textContent = `${count} caractères`;
    });

    // Clear button for Prosit
    clearBtn.addEventListener('click', () => {
        prositInput.value = '';
        charCount.textContent = '0 caractères';
        showToast('Prosit effacé', 'info');
    });

    // Clear button for Resources
    clearResourcesBtn.addEventListener('click', () => {
        resourcesInput.value = '';
        resourcesCount.textContent = '0 caractères';
        showToast('Ressources effacées', 'info');
    });

    // Toggle API key visibility
    toggleApiKey.addEventListener('click', () => {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
    });

    // Save API key when changed
    apiKeyInput.addEventListener('blur', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            await window.electronAPI.saveApiKey(apiKey);
            showApiStatus('Clé API sauvegardée', 'success');
        }
    });

    // Save user info when changed
    const studentName = document.getElementById('studentName');
    const studentPromo = document.getElementById('studentPromo');
    const bloc = document.getElementById('bloc');
    const prositTitle = document.getElementById('prositTitle');
    const dateInput = document.getElementById('dateInput');

    studentName.addEventListener('blur', async () => {
        await window.electronAPI.saveUserInfo({ name: studentName.value.trim() });
    });

    studentPromo.addEventListener('blur', async () => {
        await window.electronAPI.saveUserInfo({ promo: studentPromo.value.trim() });
    });

    bloc.addEventListener('blur', async () => {
        await window.electronAPI.saveUserInfo({ bloc: bloc.value.trim() });
    });

    prositTitle.addEventListener('blur', async () => {
        await window.electronAPI.saveUserInfo({ title: prositTitle.value.trim() });
    });

    dateInput.addEventListener('change', async () => {
        await window.electronAPI.saveUserInfo({ date: dateInput.value });
    });

    // Generate CER
    generateBtn.addEventListener('click', handleGenerate);

    // Export to Word
    exportBtn.addEventListener('click', handleExport);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Enter to generate
        if (e.ctrlKey && e.key === 'Enter') {
            handleGenerate();
        }
        // Ctrl+S to export
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            if (!exportBtn.disabled) {
                handleExport();
            }
        }
    });
}

async function handleGenerate() {
    const prositInput = document.getElementById('prositInput');
    const resourcesInput = document.getElementById('resourcesInput');
    const studentName = document.getElementById('studentName');
    const studentPromo = document.getElementById('studentPromo');
    const bloc = document.getElementById('bloc');
    const prositTitle = document.getElementById('prositTitle');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const generateBtn = document.getElementById('generateBtn');
    const outputContent = document.getElementById('outputContent');
    const emptyState = document.getElementById('emptyState');

    const prositAller = prositInput.value.trim();
    const resources = resourcesInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    // Validation
    if (!prositAller) {
        showToast('Veuillez saisir un Prosit Aller', 'error');
        return;
    }

    if (!apiKey) {
        showToast('Veuillez configurer votre clé API Gemini', 'error');
        showApiStatus('Clé API manquante', 'error');
        return;
    }

    // Collect user info
    const userInfo = {
        name: studentName.value.trim() || 'NOM Prénom',
        promo: studentPromo.value.trim() || 'A3 FISA Info',
        bloc: bloc.value.trim() || 'Bloc X',
        title: prositTitle.value.trim() || 'Prosit X',
        date: formatDate(document.getElementById('dateInput').value) || new Date().toLocaleDateString('fr-FR')
    };

    // Show loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    document.getElementById('exportBtn').disabled = true;
    outputContent.classList.remove('visible');
    emptyState.style.display = 'flex';

    try {
        showToast('Génération en cours...', 'info');

        // Build the prompt
        console.log('🏗️ [DEBUG] Building Gemini prompt...');
        const prompt = buildGeminiPrompt(prositAller, resources, userInfo);
        console.log('✅ [DEBUG] Prompt built, length:', prompt.length);

        // Call Gemini API via main process
        console.log('🌐 [DEBUG] Calling Gemini API...');
        const response = await window.electronAPI.callGeminiAPI(apiKey, prompt);
        console.log('📡 [DEBUG] API Response received:', response.success);

        if (!response.success) {
            console.error('❌ [DEBUG] API call failed:', response.error);
            throw new Error(response.error || 'Erreur API');
        }

        console.log('✅ [DEBUG] API call successful, data length:', response.data?.length);
        generatedCER = response.data;

        // Render Mermaid diagrams to SVG
        console.log('🎨 [DEBUG] Converting Mermaid diagrams...');
        showToast('Génération des diagrammes...', 'info');
        
        try {
            generatedCER = await convertMermaidToSVG(generatedCER);
            console.log('✅ [DEBUG] Mermaid diagrams converted successfully');
        } catch (mermaidError) {
            console.error('⚠️ [DEBUG] Mermaid conversion failed (non-fatal):', mermaidError);
            // Continue anyway
        }

        // Generate diagrams from Nomnoml code (if any)
        console.log('🎨 [DEBUG] Starting diagram generation...');
        showToast('Génération des schémas...', 'info');

        try {
            generatedCER = await generateDiagrams(generatedCER);
            console.log('✅ [DEBUG] Diagrams generated successfully');
        } catch (diagramError) {
            console.error('⚠️ [DEBUG] Diagram generation failed (non-fatal):', diagramError);
            // Continue anyway - diagrams are not critical
        }

        // Display the result
        displayCER(generatedCER);

        showToast('CER généré avec succès !', 'success');
        showApiStatus('API connectée', 'success');

        // Téléchargement automatique du PDF
        showToast('Téléchargement du PDF en cours...', 'info');
        
        try {
            await handleExport();
        } catch (exportError) {
            console.error('Auto-export Error:', exportError);
            showToast('Erreur lors du téléchargement automatique', 'error');
        }

    } catch (error) {
        console.error('Generation Error:', error);
        showToast('Erreur: ' + error.message, 'error');
        showApiStatus('Erreur de connexion API', 'error');

        emptyState.style.display = 'flex';
        outputContent.classList.remove('visible');

    } finally {
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
    }
}

function formatDate(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function buildGeminiPrompt(prositAller, resources, userInfo) {
    const today = userInfo.date;

    return `Tu es un assistant expert en rédaction de CER (Comptes-rendus) pour des Prosits académiques.

# OBJECTIF
Rédiger un Compte-Rendu (CER) TRÈS DÉTAILLÉ et COMPLET de 20 à 25 pages minimum, technique et professionnel à partir des notes fournies.

# DONNÉES D'ENTRÉE
Voici le contenu du "Prosit Aller" (Notes brutes) :
<PROSIT_ALLER>
${prositAller}
</PROSIT_ALLER>

Voici les ressources documentaires (Notes/Liens) :
<RESSOURCES>
${resources || 'Aucune ressource fournie, utilise tes connaissances.'}
</RESSOURCES>

# INSTRUCTIONS DE RÉDACTION (CRITIQUES)

**LONGUEUR REQUISE - RÈGLE ABSOLUE** :
- Le document final doit faire MINIMUM 20 pages et IDÉALEMENT 25 pages.
- Si tu génères moins de 20 pages, c'est un ÉCHEC. Continue à écrire jusqu'à atteindre 20 pages minimum.
- Chaque section doit être développée en profondeur avec des explications détaillées.
- N'hésite JAMAIS à être exhaustif : ajoute des sous-sections, des exemples multiples, des cas d'usage variés.
- Développe TOUS les aspects techniques sans te limiter.
- Si tu hésites entre être concis ou détaillé, CHOISIS TOUJOURS d'être détaillé.

**OBLIGATION DE DIAGRAMMES MERMAID** :
- Tu DOIS inclure AU MINIMUM 5 à 8 diagrammes Mermaid dans le document.
- JAMAIS moins de 5 diagrammes. C'est OBLIGATOIRE.
- Types de diagrammes à utiliser : classDiagram, sequenceDiagram, flowchart, stateDiagram-v2, erDiagram, gantt.
- Chaque concept technique majeur DOIT avoir son diagramme.
- N'aie JAMAIS peur d'ajouter un diagramme. Plus il y en a, mieux c'est.

**OBLIGATION DE TABLEAUX** :
- Tu DOIS inclure AU MINIMUM 8 à 12 tableaux dans le document.
- JAMAIS moins de 8 tableaux. C'est OBLIGATOIRE.
- Tableaux comparatifs, tableaux de spécifications, tableaux d'avantages/inconvénients, tableaux de cas d'usage.
- Chaque tableau doit avoir minimum 5 lignes de données (sans compter l'en-tête).
- N'aie JAMAIS peur d'ajouter un tableau. Plus il y en a, mieux c'est.

1. **SECTION CONTEXTE** :
   - Tu dois COPIER-COLLER le texte du contexte présent dans <PROSIT_ALLER>.
   - Tu dois UNIQUEMENT corriger les fautes d'orthographe et de grammaire.
   - INTERDICTION de résumer ou de reformuler.

2. **SECTION MOTS-CLÉS** :
   - Extrais les mots-clés du <PROSIT_ALLER>.
   - Pour chaque mot, donne une définition technique DÉTAILLÉE (2-3 phrases minimum).
   - Ajoute des exemples concrets d'utilisation pour chaque mot-clé.

3. **SECTION ÉTUDE DES RESSOURCES** :
   - Analyse technique APPROFONDIE des <RESSOURCES>.
   - Explique le FONCTIONNEMENT technique en détail avec des sous-sections.
   - Développe chaque concept technique avec des paragraphes complets.
   - **OBLIGATION** : Inclut MINIMUM 4 tableaux comparatifs détaillés (avec 5-10 lignes de données chacun).
   - **OBLIGATION** : Inclut MINIMUM 3 diagrammes Mermaid (architecture, séquence, flowchart).
   - JAMAIS de diagrammes ASCII art (avec +, -, |, etc.).
   - Inclut de MULTIPLES exemples concrets (au moins 3-5 exemples par concept).
   - Ajoute des sections sur les avantages, inconvénients, cas d'usage, bonnes pratiques.
   - Pour CHAQUE technologie/concept mentionné, crée un tableau de spécifications.

4. **SECTION RESOLUTIONS** :
   - C'est la partie la plus importante. Elle doit être une "Bible Technique" EXHAUSTIVE de 10+ pages.
   - **OBLIGATION** : Inclut MINIMUM 4 tableaux (comparaisons, spécifications, cas d'usage).
   - **OBLIGATION** : Inclut MINIMUM 2 diagrammes Mermaid (flowchart, sequence, state).
   - Identifie TOUTES les problématiques et propose des solutions détaillées basées sur le plan d'actions du <PROSIT_ALLER>.
   - INSTRUCTION CRITIQUE : Si le <PROSIT_ALLER> demande une réalisation ou une procédure, tu DOIS fournir un tutoriel PAS-À-PAS TRÈS DÉTAILLÉ avec explications à chaque étape.
   - Développe PLUSIEURS scénarios d'implémentation alternatifs (minimum 3 approches différentes).
   - Ajoute des sections sur les erreurs courantes (tableau), le débogage (flowchart), l'optimisation (tableau de benchmarks), la sécurité (tableau de vulnérabilités).
   - Ton : Expert, Précis, Académique, Exhaustif. Développe en profondeur.

5. **FORMATAGE DU CODE** :
   - Limite les lignes de code à 80 caractères maximum pour éviter les débordements horizontaux.
   - Fournis des exemples de code COMPLETS et fonctionnels (pas de "// ... reste du code").
   - Ajoute des commentaires détaillés dans le code pour expliquer chaque section importante.
   - TOUJOURS spécifier le langage après les triple backticks (ex: csharp, python, javascript, etc).
   - Fournis plusieurs variantes de code pour illustrer différentes approches.

6. **DIAGRAMMES MERMAID** :
   - Pour TOUS les diagrammes (graphes, séquences, flowcharts, états, gantt, etc.), utilise UNIQUEMENT Mermaid.
   - SYNTAXE OBLIGATOIRE : triple backticks suivi de "mermaid" + saut de ligne + code du diagramme + saut de ligne + triple backticks
   - Les diagrammes seront automatiquement rendus en SVG de haute qualité.
   
   **EXEMPLES DE SYNTAXE MERMAID VALIDE** :
   
   Pour un diagramme de classes UML:
   triple backticks mermaid
   classDiagram
       class Animal {
           +String name
           +int age
           +makeSound()
       }
       class Dog {
           +String breed
           +bark()
       }
       Animal <|-- Dog
   triple backticks
   
   Pour un diagramme de séquence:
   triple backticks mermaid
   sequenceDiagram
       participant Client
       participant Serveur
       participant BDD
       Client->>Serveur: Requête HTTP
       Serveur->>BDD: SELECT * FROM users
       BDD-->>Serveur: Résultats
       Serveur-->>Client: Réponse JSON
   triple backticks
   
   Pour un flowchart:
   triple backticks mermaid
   flowchart TD
       A[Début] --> B{Condition?}
       B -->|Oui| C[Action 1]
       B -->|Non| D[Action 2]
       C --> E[Fin]
       D --> E
   triple backticks
   
   Pour un diagramme d'état:
   triple backticks mermaid
   stateDiagram-v2
       [*] --> Idle
       Idle --> Processing: start()
       Processing --> Success: complete()
       Processing --> Error: fail()
       Success --> [*]
       Error --> Idle: retry()
   triple backticks
   
   **RÈGLES CRITIQUES**:
   - TOUJOURS utiliser "mermaid" après les triple backticks (jamais "uml", "diagram", ou autre)
   - Respecter la syntaxe exacte de Mermaid (classDiagram, sequenceDiagram, flowchart, etc.)
   - Utiliser les flèches correctes: --> pour flowchart, ->> pour sequence, <|-- pour héritage
   - Ne JAMAIS utiliser de diagrammes ASCII art
   - Les diagrammes complexes doivent rester lisibles (éviter trop d'éléments)

# STRUCTURE DE SORTIE ATTENDUE
Tu dois générer le document en suivant EXACTEMENT cette structure Markdown.Ne mets rien d'autre avant ou après.

${userInfo.name}
${userInfo.promo}
${userInfo.bloc}
${userInfo.title}
${today}

    ---

## Introduction

### Mots clés & Mots inconnus
    [Liste des mots clés avec définitions]

### Contexte
    [Le texte du contexte copié - collé et corrigé]

### Problématique
    [La problématique sous forme de liste à puces]

### Contraintes
    [Les contraintes sous forme de liste à puces]

### Hypothèses
    [Les hypothèses sous forme de liste à puces]

### Livrables
    [Les livrables sous forme de liste à puces]

### Généralisation
    [La généralisation sous forme de liste à puces]

### Plan d'actions
    [Le plan d'actions corrigé]

    ---

## Recherches & Expérimentations

### Etude des ressources
    [Ton analyse technique TRÈS détaillée des ressources - MINIMUM 5 pages]
    [OBLIGATION : MINIMUM 4 tableaux comparatifs détaillés]
    [OBLIGATION : MINIMUM 3 diagrammes Mermaid (architecture, séquence, flowchart)]
    [Développe CHAQUE technologie/concept avec exemples, avantages/inconvénients, cas d'usage]

### Résolutions
    [Tes recherches EXHAUSTIVES pour la résolution de/des problématiques - MINIMUM 10 pages]
    [OBLIGATION : MINIMUM 4 tableaux (comparaisons, erreurs courantes, benchmarks, vulnérabilités)]
    [OBLIGATION : MINIMUM 2 diagrammes Mermaid (flowchart de processus, stateDiagram)]
    [Tutoriels PAS-À-PAS très détaillés, comparatifs techniques, PLUSIEURS scénarios d'implémentation]
    [Sections obligatoires : Erreurs courantes, Débogage, Optimisation, Sécurité, Bonnes pratiques]

### Choix techniques & Décisions
    [Justification DÉTAILLÉE de la solution retenue - MINIMUM 2 pages]
    [OBLIGATION : 1 tableau de comparaison des alternatives]
    [OBLIGATION : 1 diagramme de l'architecture finale]

### Validation des hypothèses
    [Validation technique COMPLÈTE de chaque hypothèse - MINIMUM 2 pages]
    [OBLIGATION : 1 tableau récapitulatif des validations]

    ---

## Bilan

### Conclusion
    [Synthèse globale]

### Bibliographie
    [Sources utilisées]

    ---

        RAPPEL FINAL AVANT GÉNÉRATION :
        - MINIMUM 20 pages (si moins, CONTINUE à écrire)
        - MINIMUM 5 à 8 diagrammes Mermaid OBLIGATOIRES
        - MINIMUM 8 à 12 tableaux OBLIGATOIRES
        - Chaque section DOIT être exhaustive et détaillée
        - N'aie JAMAIS peur d'être trop long ou trop détaillé
        - Plus tu ajoutes de diagrammes et tableaux, mieux c'est
        
        Génère le CER maintenant.`;
}

function displayCER(cerText) {
    const outputContent = document.getElementById('outputContent');
    const emptyState = document.getElementById('emptyState');

    // Convert markdown to HTML (basic conversion)
    const htmlContent = markdownToHTML(cerText);

    outputContent.innerHTML = htmlContent;
    
    // Apply syntax highlighting to all code blocks
    applyCodeHighlighting();
    
    emptyState.style.display = 'none';
    outputContent.classList.add('visible');
    outputContent.scrollTop = 0;
}

async function applyCodeHighlighting() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((block, index) => {
        // Detect language from class or content
        const language = detectLanguage(block);
        
        // Wrap code block with enhanced UI
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        wrapper.dataset.codeIndex = index;
        
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `
            <span class="code-language">${language}</span>
            <div class="code-actions">
                <button class="code-action-btn copy-code-btn" onclick="copyCode(${index})" title="Copier le code">
                    📋 Copier
                </button>
                <button class="code-action-btn convert-to-image-btn" onclick="convertCodeToImage(${index})" title="Convertir en image pour le CER">
                    🖼️ En image
                </button>
            </div>
        `;
        
        const pre = block.parentElement;
        pre.parentElement.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
        
        // Apply syntax highlighting
        if (language !== 'text' && language !== 'plaintext') {
            block.className = `language-${language}`;
            hljs.highlightElement(block);
        }
    });
}

function detectLanguage(codeBlock) {
    // Check if language is specified in class
    const classList = codeBlock.className.split(' ');
    for (const cls of classList) {
        if (cls.startsWith('language-')) {
            return cls.replace('language-', '');
        }
    }
    
    // Try to detect language from content
    const code = codeBlock.textContent;
    
    if (code.includes('function') || code.includes('const') || code.includes('let')) {
        return 'javascript';
    } else if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
        return 'python';
    } else if (code.includes('<?php')) {
        return 'php';
    } else if (code.includes('public class') || code.includes('import java')) {
        return 'java';
    } else if (code.includes('SELECT') || code.includes('INSERT') || code.includes('FROM')) {
        return 'sql';
    } else if (code.includes('<html') || code.includes('<!DOCTYPE')) {
        return 'html';
    } else if (code.includes('{') && code.includes('}') && (code.includes('color:') || code.includes('margin:'))) {
        return 'css';
    } else if (code.includes('$ ') || code.includes('cd ') || code.includes('ls ')) {
        return 'bash';
    }
    
    return 'plaintext';
}

window.copyCode = function(index) {
    const wrapper = document.querySelector(`[data-code-index="${index}"]`);
    const codeBlock = wrapper.querySelector('code');
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        const btn = wrapper.querySelector('.copy-code-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copié !';
        btn.classList.add('active');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('active');
        }, 2000);
    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        showToast('Erreur lors de la copie', 'error');
    });
};

window.convertCodeToImage = async function(index) {
    const wrapper = document.querySelector(`[data-code-index="${index}"]`);
    const btn = wrapper.querySelector('.convert-to-image-btn');
    const originalText = btn.innerHTML;
    
    try {
        btn.innerHTML = '⏳ Conversion...';
        btn.disabled = true;
        
        // Import html2canvas dynamically
        const html2canvas = require('html2canvas');
        
        // Get the entire code block including header
        const codeBlock = wrapper.querySelector('pre');
        
        // Create a temporary container with better styling for image
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            background: #282c34;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        const clonedBlock = codeBlock.cloneNode(true);
        tempContainer.appendChild(clonedBlock);
        document.body.appendChild(tempContainer);
        
        // Generate image with high quality
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: '#282c34',
            scale: 2, // High DPI
            logging: false,
            useCORS: true
        });
        
        // Convert to blob
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const dataUrl = canvas.toDataURL('image/png');
        
        // Store the image for later use in Word export
        if (!window.codeImages) {
            window.codeImages = {};
        }
        window.codeImages[index] = {
            dataUrl: dataUrl,
            width: canvas.width,
            height: canvas.height
        };
        
        // Replace code block with image in display
        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = `
            max-width: 100%;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            margin: var(--spacing-lg) 0;
        `;
        img.dataset.originalCodeIndex = index;
        
        // Add a button to restore code
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'code-action-btn';
        restoreBtn.innerHTML = '🔄 Restaurer le code';
        restoreBtn.style.marginTop = '8px';
        restoreBtn.onclick = () => restoreCode(index, wrapper, img);
        
        const imageContainer = document.createElement('div');
        imageContainer.appendChild(img);
        imageContainer.appendChild(restoreBtn);
        imageContainer.dataset.imageContainer = index;
        
        wrapper.parentElement.replaceChild(imageContainer, wrapper);
        
        // Cleanup
        document.body.removeChild(tempContainer);
        
        showToast('Code converti en image !', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la conversion:', error);
        showToast('Erreur lors de la conversion: ' + error.message, 'error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

window.restoreCode = function(index, originalWrapper, imageElement) {
    const imageContainer = document.querySelector(`[data-image-container="${index}"]`);
    if (imageContainer && originalWrapper) {
        imageContainer.parentElement.replaceChild(originalWrapper, imageContainer);
    }
};

function markdownToHTML(markdown) {
    let html = markdown;

    // Code blocks (must be processed before other replacements)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'plaintext';
        return `<pre><code class="language-${language}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Lists
    html = html.replace(/^\* (.+)/gim, '<li>$1</li>');
    html = html.replace(/^\- (.+)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (!para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<li') && 
            !para.startsWith('<pre') && !para.startsWith('<hr') && para.trim()) {
            return `<p>${para}</p>`;
        }
        return para;
    }).join('\n');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

// Convert PlantUML diagrams to PNG images using Kroki service
// Convert Mermaid diagrams to inline SVG
async function convertMermaidToSVG(markdown) {
    console.log('🔍 [DEBUG] convertMermaidToSVG called');
    
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let newMarkdown = markdown;
    const matches = [];
    let match;

    // Extract all Mermaid blocks
    while ((match = mermaidRegex.exec(markdown)) !== null) {
        matches.push({
            fullMatch: match[0],
            code: match[1].trim()
        });
    }

    console.log(`🔍 [DEBUG] Found ${matches.length} Mermaid block(s)`);
    
    if (matches.length === 0) {
        console.log('⚠️ [DEBUG] No Mermaid blocks found in markdown');
        return markdown;
    }

    console.log(`📊 Converting ${matches.length} Mermaid diagram(s) to SVG...`);

    // Initialize Mermaid with safe config
    const mermaid = window.mermaid;
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Arial, sans-serif',
        logLevel: 'error'
    });

    for (let i = 0; i < matches.length; i++) {
        const { fullMatch, code } = matches[i];
        
        try {
            console.log(`📊 Rendering Mermaid diagram ${i + 1}...`);
            
            // Create unique ID for this diagram
            const diagramId = `mermaid-diagram-${Date.now()}-${i}`;
            
            // Render the diagram
            const { svg } = await mermaid.render(diagramId, code);
            
            if (svg) {
                // Embed the SVG directly in the markdown
                const svgMarkdown = `\n\n<div class="mermaid-diagram">${svg}</div>\n\n`;
                newMarkdown = newMarkdown.replace(fullMatch, svgMarkdown);
                
                console.log(`✅ Mermaid diagram ${i + 1} rendered successfully`);
            } else {
                throw new Error('SVG rendering returned empty result');
            }
            
        } catch (error) {
            console.error(`❌ Failed to render Mermaid diagram ${i + 1}:`, error);
            console.error(`  └─ Code was:`, code.substring(0, 100));
            // Keep the original code block on error
        }
    }

    console.log('✅ [DEBUG] Mermaid conversion complete');
    return newMarkdown;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleExport() {
    if (!generatedCER) {
        showToast('Aucun CER à exporter', 'error');
        return;
    }

    try {
        showToast('Création du document PDF...', 'info');

        // Prepare CER content with code images embedded
        let cerContentForExport = generatedCER;
        
        // If code images exist, replace code blocks with image tags in markdown
        if (window.codeImages && Object.keys(window.codeImages).length > 0) {
            showToast('Préparation des images de code...', 'info');
            
            // Process markdown to replace code blocks with images where applicable
            cerContentForExport = await embedCodeImagesInMarkdown(generatedCER);
        }

        // Call main process to generate and save PDF document
        const result = await window.electronAPI.generatePDFDocument(
            cerContentForExport,
            'CER_Prosit_Retour.pdf'
        );

        if (result.success) {
            showToast('Document PDF exporté avec succès !', 'success');
        } else if (result.canceled) {
            showToast('Export annulé', 'info');
        } else {
            throw new Error(result.error || 'Erreur d\'export');
        }

    } catch (error) {
        console.error('Export Error:', error);
        showToast('Erreur lors de l\'export: ' + error.message, 'error');
    }
}

async function embedCodeImagesInMarkdown(markdown) {
    // Get all code blocks that have been converted to images
    const imageContainers = document.querySelectorAll('[data-image-container]');
    
    if (imageContainers.length === 0) {
        return markdown;
    }
    
    let modifiedMarkdown = markdown;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let blockIndex = 0;
    
    modifiedMarkdown = modifiedMarkdown.replace(codeBlockRegex, (match, lang, code) => {
        // Check if this code block was converted to an image
        const imageData = window.codeImages[blockIndex];
        
        if (imageData) {
            // Replace with HTML image tag that will be rendered in PDF
            return `<img src="${imageData.dataUrl}" class="code-image" alt="Code ${lang || 'snippet'}" />`;
        }
        
        blockIndex++;
        return match; // Keep original if not converted
    });
    
    return modifiedMarkdown;
}

// Helper Functions

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type} `;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

async function validateAndFixMermaid(markdown) {
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
    let newMarkdown = markdown;
    const replacements = [];
    let diagrams = [];

    // Extract all mermaid diagrams
    let match;
    while ((match = mermaidRegex.exec(markdown)) !== null) {
        diagrams.push({
            fullMatch: match[0],
            code: match[1],
            index: match.index
        });
    }

    if (diagrams.length === 0) {
        return markdown;
    }

    console.log(`Validating ${diagrams.length} Mermaid diagram(s)...`);

    for (let i = 0; i < diagrams.length; i++) {
        const { fullMatch, code, index } = diagrams[i];
        
        try {
            const id = 'mermaid-validation-' + Math.random().toString(36).substr(2, 9);
            const tempDiv = document.createElement('div');
            tempDiv.id = id + '-container';
            tempDiv.style.position = 'absolute';
            tempDiv.style.visibility = 'hidden';
            tempDiv.style.pointerEvents = 'none';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = '800px'; // Give it a width for proper rendering
            document.body.appendChild(tempDiv);

            let finalCode = code;
            let renderSuccess = false;

            try {
                // First attempt with original code
                const { svg } = await mermaid.render(id, code);
                renderSuccess = true;
                console.log(`✓ Diagram ${i + 1} rendered successfully`);
            } catch (firstError) {
                console.warn(`⚠ Diagram ${i + 1} failed, attempting auto-fix...`, firstError.message);
                
                // Try to fix the code
                const fixedCode = attemptMermaidFix(code);
                
                try {
                    const { svg } = await mermaid.render(id + '-fixed', fixedCode);
                    finalCode = fixedCode;
                    renderSuccess = true;
                    console.log(`✓ Diagram ${i + 1} fixed and rendered successfully`);
                    
                    // Replace in markdown
                    newMarkdown = newMarkdown.replace(code, fixedCode);
                } catch (secondError) {
                    console.error(`✗ Diagram ${i + 1} still failed after fix:`, secondError.message);
                    throw secondError;
                }
            }

            // Cleanup
            document.body.removeChild(tempDiv);
            const svgElement = document.getElementById(id);
            if (svgElement) svgElement.remove();
            const fixedSvgElement = document.getElementById(id + '-fixed');
            if (fixedSvgElement) fixedSvgElement.remove();

        } catch (error) {
            console.error(`✗ Invalid Mermaid diagram ${i + 1}:`, error.message);

            // Create a more informative error message
            const errorMsg = error.message || 'Erreur de syntaxe';
            const replacement = `> [!WARNING]
> **Schéma ${i + 1} non-généré**
> Erreur: ${errorMsg}
>
> **Code original:**
\`\`\`text
${code.trim()}
\`\`\`

> **Suggestion:** Vérifiez la syntaxe Mermaid. Exemples courants:
> - \`graph TD\` ou \`flowchart TD\` pour commencer
> - \`A["Label"] --> B["Label 2"]\` pour les connexions
> - Les labels avec espaces doivent être entre guillemets
`;
            replacements.push({ index, length: fullMatch.length, replacement });
        }
    }

    // Apply replacements in reverse order
    for (let i = replacements.length - 1; i >= 0; i--) {
        const { index, length, replacement } = replacements[i];
        newMarkdown = newMarkdown.substring(0, index) + replacement + newMarkdown.substring(index + length);
    }

    return newMarkdown;
}


function attemptMermaidFix(code) {
    let fixed = code.trim();

    // Fix 1: Remove BOM and invisible characters
    fixed = fixed.replace(/^\uFEFF/, '');
    fixed = fixed.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Fix 2: Normalize line endings
    fixed = fixed.replace(/\r\n/g, '\n');

    // Fix 3: Fix common graph type typos
    fixed = fixed.replace(/^graph\s+(TD|TB|BT|RL|LR)$/gm, (match, dir) => `graph ${dir}`);
    fixed = fixed.replace(/^flowchart\s+(TD|TB|BT|RL|LR)$/gm, (match, dir) => `flowchart ${dir}`);

    // Fix 4: Ensure proper spacing around arrows
    fixed = fixed.replace(/([A-Za-z0-9_]+)(-->|---|-\.->|===>|==>)([A-Za-z0-9_]+)/g, '$1 $2 $3');

    // Fix 5: Fix node labels - ensure they're properly quoted
    // Match patterns like: A[Text] -> A["Text"]
    fixed = fixed.replace(/([A-Za-z0-9_]+)\[([^\]"]+)\]/g, (match, id, label) => {
        // Don't quote if already quoted
        if (label.startsWith('"') && label.endsWith('"')) return match;
        return `${id}["${label.trim()}"]`;
    });

    // Fix 6: Fix round brackets (parentheses) for stadium shapes
    fixed = fixed.replace(/([A-Za-z0-9_]+)\(([^\)"]+)\)/g, (match, id, label) => {
        if (label.startsWith('"') && label.endsWith('"')) return match;
        return `${id}("${label.trim()}")`;
    });

    // Fix 7: Fix curly brackets for rhombus/decision
    fixed = fixed.replace(/([A-Za-z0-9_]+)\{([^\}"]+)\}/g, (match, id, label) => {
        if (label.startsWith('"') && label.endsWith('"')) return match;
        return `${id}{"${label.trim()}"}`;
    });

    // Fix 8: Remove duplicate empty lines
    fixed = fixed.replace(/\n{3,}/g, '\n\n');

    // Fix 9: Escape special characters in labels
    fixed = fixed.replace(/\["([^"]+)"\]/g, (match, label) => {
        const escaped = label.replace(/"/g, '\\"');
        return `["${escaped}"]`;
    });

    // Fix 10: Add missing semicolons at line ends if needed
    fixed = fixed.split('\n').map(line => {
        const trimmed = line.trim();
        // Skip empty lines, comments, and graph declarations
        if (!trimmed || trimmed.startsWith('%%') || 
            /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey)/.test(trimmed)) {
            return line;
        }
        // Don't add semicolon if already present or if line ends with certain characters
        if (trimmed.endsWith(';') || trimmed.endsWith('{') || trimmed.endsWith('}')) {
            return line;
        }
        return line;
    }).join('\n');

    return fixed;
}

function showApiStatus(message, type) {
    const apiStatus = document.getElementById('apiStatus');
    apiStatus.textContent = message;
    apiStatus.className = `api - status ${type} `;
}
