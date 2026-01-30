const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Serve generated images statically
app.use('/diagrams', express.static(path.join(__dirname, 'generated')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'diagram-service' });
});

/**
 * POST /generate-diagram
 * Body: { prompt: string, imageName: string }
 * Returns: { success: boolean, filename: string, url: string }
 */
app.post('/generate-diagram', async (req, res) => {
    try {
        const { prompt, imageName } = req.body;

        if (!prompt || !imageName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: prompt, imageName'
            });
        }

        console.log(`Generating diagram: ${imageName}`);
        console.log(`Prompt length: ${prompt.length} characters`);

        // TODO: This is where we'll call the actual image generation API
        // For now, this is a placeholder that will be implemented
        const result = await generateDiagramImage(prompt, imageName);

        if (!result.success) {
            throw new Error(result.error || 'Image generation failed');
        }

        res.json({
            success: true,
            filename: result.filename,
            url: `http://localhost:${PORT}/diagrams/${result.filename}`
        });

    } catch (error) {
        console.error('Error generating diagram:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Generates a diagram image from a text prompt
 * This function will be implemented to call the actual image generation API
 */
async function generateDiagramImage(prompt, imageName) {
    // Ensure generated directory exists
    const genDir = path.join(__dirname, 'generated');
    try {
        await fs.mkdir(genDir, { recursive: true });
    } catch (err) {
        // Directory already exists
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${imageName}_${timestamp}.png`;
    const filepath = path.join(genDir, filename);

    // TODO: Replace this placeholder with actual image generation logic
    // For now, we'll create a placeholder file
    console.log('Image generation logic will be implemented here');
    console.log(`Would save to: ${filepath}`);

    // Placeholder: Create empty file for now
    await fs.writeFile(filepath, Buffer.from('PNG_PLACEHOLDER'));

    return {
        success: true,
        filename: filename,
        filepath: filepath
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`✓ Diagram Service running on http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ Ready to generate diagrams`);
});

module.exports = app;
