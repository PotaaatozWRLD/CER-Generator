// Nomnoml Diagram Generator for CER
// Converts Nomnoml code blocks to PNG images

const nomnoml = require('nomnoml');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');

const nomnomlRegex = /```nomnoml\n([\s\S]*?)```/g;

/**
 * Detects Nomnoml diagrams in markdown and converts them to images
 * @param {string} markdown - The CER markdown content
 * @param {string} outputDir - Directory to save generated images
 * @returns {Promise<string>} - Markdown with images replacing nomnoml blocks
 */
async function generateDiagrams(markdown, outputDir = path.join(__dirname, 'diagrams')) {
    const matches = [...markdown.matchAll(nomnomlRegex)];

    if (matches.length === 0) {
        console.log('No Nomnoml blocks detected in markdown');
        return markdown;
    }

    console.log(`Found ${matches.length} Nomnoml diagram(s) to process`);

    // Ensure output directory exists
    try {
        await fs.mkdir(outputDir, { recursive: true });
    } catch (err) {
        // Directory already exists
    }

    let processedMarkdown = markdown;

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const [fullMatch, nomnomlCode] = match;

        console.log(`Processing diagram ${i + 1}/${matches.length}`);

        try {
            const imagePath = await createDiagramImage(nomnomlCode, i, outputDir);
            const relativePath = `diagrams/${path.basename(imagePath)}`;

            // Replace the Nomnoml block with markdown image
            processedMarkdown = processedMarkdown.replace(
                fullMatch,
                `\n![Schéma](${relativePath})\n`
            );

            console.log(`✓ Generated diagram: ${relativePath}`);
        } catch (error) {
            console.error(`✗ Failed to generate diagram ${i + 1}:`, error.message);

            // Fallback: keep the text with a warning
            processedMarkdown = processedMarkdown.replace(
                fullMatch,
                `> [!WARNING]\n> **Schéma non-généré**\n> Erreur de génération: ${error.message}\n\n\`\`\`\n${nomnomlCode}\n\`\`\``
            );
        }
    }

    return processedMarkdown;
}

/**
 * Creates a PNG image from Nomnoml code
 * @param {string} nomnomlCode - Nomnoml diagram code
 * @param {number} index - Sequential index for unique naming
 * @param {string} outputDir - Output directory
 * @returns {Promise<string>} - Path to generated image
 */
async function createDiagramImage(nomnomlCode, index, outputDir) {
    const timestamp = Date.now();
    const filename = `diagram_${index}_${timestamp}.png`;
    const filepath = path.join(outputDir, filename);

    try {
        // Parse Nomnoml and get rendering info
        const { width, height } = getSuggestedCanvasSize(nomnomlCode);

        // Create canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Render Nomnoml to canvas
        nomnoml.draw(canvas, nomnomlCode);

        // Save as PNG
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(filepath, buffer);

        console.log(`Saved diagram to: ${filepath}`);
        return filepath;

    } catch (error) {
        throw new Error(`Nomnoml rendering failed: ${error.message}`);
    }
}

/**
 * Calculates suggested canvas size based on diagram complexity
 * @param {string} code - Nomnoml code
 * @returns {{width: number, height: number}}
 */
function getSuggestedCanvasSize(code) {
    // Default size
    let width = 800;
    let height = 600;

    // Adjust based on content
    const lines = code.split('\n').length;
    const arrows = (code.match(/->/g) || []).length;

    if (lines > 15 || arrows > 10) {
        width = 1000;
        height = 800;
    }

    if (lines > 25 || arrows > 20) {
        width = 1200;
        height = 1000;
    }

    return { width, height };
}

module.exports = { generateDiagrams, createDiagramImage };
