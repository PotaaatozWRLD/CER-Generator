# 📄 CER Generator - Générateur de Comptes-Rendus

Application Electron pour générer automatiquement des CER (Comptes-Rendus) professionnels à partir de notes de Prosit en utilisant l'API Google Gemini.

## ✨ Fonctionnalités

- 🤖 **Génération IA** : Utilise Google Gemini (modèles 3 Flash, 2.5 Flash, 2.5 Pro)
- 📊 **Diagrammes Mermaid** : Génération automatique de diagrammes UML, séquences, flowcharts
- 📋 **Tableaux techniques** : Comparatifs, spécifications, avantages/inconvénients
- 📑 **Export PDF** : Conversion automatique en PDF stylisé
- 💾 **Sauvegarde automatique** : Clé API et informations utilisateur persistantes
- ⌨️ **Raccourcis clavier** : Ctrl+Enter pour générer, Ctrl+S pour exporter

## 🚀 Installation

### Prérequis

- Node.js v18 ou supérieur
- Clé API Google Gemini ([Obtenir une clé](https://ai.google.dev/))

### Étapes d'installation

```bash
# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/App_CER.git
cd App_CER

# Installer les dépendances
npm install

# Lancer l'application
npm start
```

## 📦 Dépendances principales

- **Electron** 28.0.0 - Framework desktop
- **@google/generative-ai** 0.21.0 - API Gemini
- **Mermaid.js** 10.9.0 - Rendu des diagrammes
- **marked** 12.0.0 - Parsing Markdown
- **highlight.js** 11.9.0 - Coloration syntaxique
- **node-fetch** 2.7.0 - Requêtes HTTP

## 🛠️ Structure du projet

```
App_CER/
├── main.js                  # Process principal Electron
├── preload.js              # Script de préchargement
├── html-pdf-generator.js   # Conversion HTML → PDF
├── src/
│   ├── index.html          # Interface utilisateur
│   ├── renderer.js         # Logique UI et API
│   ├── styles.css          # Styles de l'application
│   ├── docx-generator.js   # Export Word (legacy)
│   └── diagram-generator.js # Génération diagrammes
├── diagram-service/        # Service Node.js pour diagrammes
│   ├── server.js
│   └── package.json
└── package.json
```

## 🎯 Utilisation

1. **Configurer la clé API**
   - Obtenez une clé sur [Google AI Studio](https://ai.google.dev/)
   - Collez-la dans le champ "Clé API Gemini"
   - Elle sera sauvegardée automatiquement

2. **Remplir les informations**
   - Nom de l'étudiant
   - Promotion (ex: BACH3-CDA-25)
   - Bloc (ex: 3)
   - Titre du Prosit
   - Date

3. **Saisir le contenu**
   - **Prosit Aller** : Notes brutes du prosit
   - **Ressources** : Liens, documentations, notes complémentaires

4. **Générer le CER**
   - Cliquer sur "Générer CER" ou `Ctrl+Enter`
   - Attendre la génération (20-60 secondes)
   - Le CER s'affiche dans l'aperçu

5. **Exporter en PDF**
   - Cliquer sur "Exporter en PDF" ou `Ctrl+S`
   - Choisir l'emplacement de sauvegarde

## 🎨 Caractéristiques du CER généré

- **Document de 20-25 pages** avec structure académique
- **5-8 diagrammes Mermaid** : UML, séquences, flowcharts, états
- **8-12 tableaux techniques** : comparatifs, spécifications, cas d'usage
- **Code commenté** : Exemples fonctionnels avec syntaxe colorée
- **Sections détaillées** :
  - Introduction (contexte, mots-clés, problématique)
  - Recherches & Expérimentations (ressources, résolutions)
  - Bilan (conclusion, bibliographie)

## ⚙️ Configuration avancée

### Modèles IA disponibles

L'application essaie les modèles dans cet ordre :
1. `gemini-3-flash-preview` (prioritaire)
2. `gemini-2.5-flash`
3. `gemini-2.5-pro`

Quota gratuit : 20 requêtes/jour par modèle

### Personnalisation du prompt

Modifier `buildGeminiPrompt()` dans `src/renderer.js` pour adapter :
- Le ton du document
- La longueur des sections
- Les types de diagrammes
- Le niveau de détail technique

## 🐛 Dépannage

### Erreur "Quota API dépassé"
- Attendez 24h (reset à minuit UTC)
- Ou utilisez une autre clé API

### Erreur "EADDRINUSE"
- Trop de connexions rapides
- Attendez 3 minutes avant de réessayer

### Diagrammes non rendus
- Vérifiez que Mermaid.js est chargé (F12 → Console)
- Vérifiez la syntaxe dans le markdown généré

### PDF vide ou incomplet
- Relancez l'export après quelques secondes
- Vérifiez la console (F12) pour les erreurs

## 📝 Développement

### Scripts disponibles

```bash
npm start           # Lancer en mode développement
npm run build       # Build pour production
npm test           # Lancer les tests (si configurés)
```

### Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 🙏 Remerciements

- [Google Gemini API](https://ai.google.dev/) - Génération de contenu IA
- [Mermaid.js](https://mermaid.js.org/) - Diagrammes SVG
- [Electron](https://www.electronjs.org/) - Framework desktop multiplateforme
- [Marked](https://marked.js.org/) - Parser Markdown

## 📧 Contact

Pour toute question ou suggestion, ouvrez une issue sur GitHub.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2026
