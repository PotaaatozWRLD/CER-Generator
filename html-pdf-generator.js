// html-pdf-generator.js - Beautiful HTML/CSS to PDF Generation

async function generatePDFFromHTML(cerMarkdown, mainWindow) {
    // Modern color palette
    const colors = {
        primary: '#2C3E50',
        secondary: '#3498DB',
        accent: '#E74C3C',
        success: '#27AE60',
        dark: '#34495E',
        light: '#ECF0F1',
        border: '#BDC3C7'
    };

    // Convert markdown to HTML with beautiful styling
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CER - Compte Rendu</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

        @page {
            size: A4;
            margin: 1.5cm 2cm;
        }

        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #334155;
            background: white;
        }

        /* Cover Page */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            text-align: center;
            page-break-after: always;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            margin: -1.5cm -2cm;
            position: relative;
            overflow: hidden;
        }

        .cover-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 10px;
            background: linear-gradient(90deg, ${colors.secondary}, ${colors.accent});
        }

        .cover-title {
            font-size: 36pt;
            font-weight: 800;
            color: ${colors.primary};
            margin-bottom: 20px;
            letter-spacing: -1px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .cover-subtitle {
            font-size: 18pt;
            color: ${colors.secondary};
            font-weight: 500;
            margin-bottom: 15px;
        }

        .cover-divider {
            width: 80px;
            height: 6px;
            background: ${colors.accent};
            margin: 40px auto;
            border-radius: 3px;
        }

        /* Headers */
        h1 {
            font-size: 24pt;
            font-weight: 700;
            color: ${colors.primary};
            border-left: 5px solid ${colors.secondary};
            padding-left: 15px;
            margin-top: 35px;
            margin-bottom: 20px;
            page-break-after: avoid;
            background: linear-gradient(to right, #f1f5f9, transparent);
            padding-top: 5px;
            padding-bottom: 5px;
            border-radius: 0 4px 4px 0;
        }

        h2 {
            font-size: 18pt;
            font-weight: 600;
            color: ${colors.secondary};
            margin-top: 25px;
            margin-bottom: 15px;
            page-break-after: avoid;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
        }

        h3 {
            font-size: 14pt;
            font-weight: 600;
            color: ${colors.dark};
            margin-top: 20px;
            margin-bottom: 10px;
            page-break-after: avoid;
        }

        h4 {
            font-size: 12pt;
            font-weight: 600;
            color: #64748b;
            margin-top: 15px;
            margin-bottom: 8px;
            page-break-after: avoid;
        }

        /* Paragraphs */
        p {
            text-align: justify;
            margin-bottom: 12px;
            orphans: 3;
            widows: 3;
        }

        /* Lists */
        ul, ol {
            margin-left: 20px;
            margin-bottom: 15px;
        }

        li {
            margin-bottom: 6px;
            padding-left: 5px;
        }

        ul li::marker {
            color: ${colors.secondary};
        }

        /* Tables */
        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin: 20px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
            font-size: 10pt;
            page-break-inside: avoid;
        }

        thead {
            background: ${colors.primary};
            color: white;
        }

        th {
            padding: 12px 15px;
            text-align: left;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            font-size: 9pt;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
            background: white;
        }

        tbody tr:last-child td {
            border-bottom: none;
        }

        tbody tr:nth-child(even) td {
            background-color: #f8fafc;
        }

        /* Strong text */
        strong {
            color: ${colors.primary};
            font-weight: 700;
        }

        /* Horizontal rules */
        hr {
            border: none;
            height: 1px;
            background: #cbd5e1;
            margin: 25px 0;
        }

        /* Definition Box */
        .definition {
            background: #f0f9ff;
            border-left: 4px solid ${colors.secondary};
            padding: 15px;
            border-radius: 0 4px 4px 0;
            margin-bottom: 15px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .definition strong {
            color: ${colors.secondary};
            display: block;
            margin-bottom: 5px;
            font-size: 1.1em;
        }

        /* Code Blocks */
        pre {
            background: #282c34;
            border: 1px solid #3a4151;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            overflow-x: hidden;
            overflow-wrap: break-word;
            page-break-inside: avoid;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 100%;
        }

        pre code {
            font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 8.5pt;
            line-height: 1.4;
            color: #abb2bf;
            display: block;
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-word;
            overflow-wrap: break-word;
        }

        code {
            font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 9pt;
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            color: #e74c3c;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        /* Code images (when converted) */
        .code-image {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin: 20px 0;
            page-break-inside: avoid;
        }

        /* Mermaid diagram SVG */
        .mermaid-diagram {
            display: block;
            text-align: center;
            margin: 30px auto;
            padding: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
            max-width: 95%;
        }
        
        .mermaid-diagram svg {
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
        }

        /* Images */
        img {
            max-width: 90%;
            height: auto;
            display: block;
            margin: 20px auto;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 10px;
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }

        /* Page breaks */
        .page-break {
            page-break-before: always;
        }

        .avoid-break {
            page-break-inside: avoid;
        }

        /* Header and Footer */
        @media print {
            header {
                position: fixed;
                top: 0;
                right: 0;
                font-size: 8pt;
                color: ${colors.dark};
                opacity: 0.7;
            }

            footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 8pt;
                color: ${colors.dark};
                opacity: 0.7;
            }
        }

        /* Content container */
        .content {
            padding: 10px 0;
        }

        /* TOC Styling */
        .toc-container {
            padding: 20px;
            background: #fff;
        }

        .toc-container h1 {
            text-align: center;
            margin-bottom: 40px;
            border-left: none;
            background: none;
        }

        .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .toc-list li {
            margin-bottom: 12px;
        }

        .toc-list a {
            text-decoration: none;
            color: ${colors.primary};
            display: flex;
            align-items: baseline;
            font-weight: 500;
            transition: color 0.2s;
        }

        .toc-list a:hover {
            color: ${colors.secondary};
        }

        .toc-title {
            flex-shrink: 0;
        }

        .toc-dots {
            flex-grow: 1;
            border-bottom: 2px dotted #cbd5e1;
            margin: 0 10px;
        }

        .toc-page {
            flex-shrink: 0;
            color: ${colors.secondary};
            font-weight: 600;
        }

        /* Mermaid diagram styling */
        .mermaid-container {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            page-break-inside: avoid;
            break-inside: avoid;
        }

        .mermaid {
            font-family: 'Inter', sans-serif !important;
            display: block;
            text-align: center;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
    <script>
        // Advanced Mermaid configuration for version 10
        mermaid.initialize({
            startOnLoad: false,  // We'll manually trigger rendering
            theme: 'default',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            sequence: {
                useMaxWidth: true,
                wrap: true
            },
            gantt: {
                useMaxWidth: true
            },
            themeVariables: {
                primaryColor: '#3498DB',
                primaryTextColor: '#fff',
                primaryBorderColor: '#2980B9',
                lineColor: '#34495E',
                secondaryColor: '#27AE60',
                tertiaryColor: '#E74C3C',
                background: '#ffffff',
                mainBkg: '#3498DB',
                secondBkg: '#27AE60',
                tertiaryBkg: '#E74C3C'
            }
        });

        // Wait for DOM to load, then render Mermaid diagrams
        document.addEventListener('DOMContentLoaded', async () => {
            console.log('DOM loaded, initializing Mermaid...');
            try {
                // Mermaid 10 requires explicit run() call
                await mermaid.run({
                    querySelector: '.mermaid',
                });
                console.log('All Mermaid diagrams rendered successfully');
            } catch (error) {
                console.error('Mermaid rendering error:', error);
                // Try fallback initialization
                try {
                    await mermaid.init(undefined, document.querySelectorAll('.mermaid'));
                    console.log('Mermaid diagrams rendered with fallback method');
                } catch (fallbackError) {
                    console.error('Fallback rendering also failed:', fallbackError);
                }
            }
        });
    </script>
</head>
<body>
    ${parseMarkdownToHTML(cerMarkdown, colors)}
</body>
</html>
    `;

    // Use Electron's built-in PDF generation
    const { BrowserWindow } = require('electron');

    // Create hidden window for PDF generation
    const pdfWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            javascript: true  // Enable JavaScript for Mermaid rendering
        }
    });

    // Load HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

    // Wait longer for Mermaid diagrams to fully render
    // Increased to 7 seconds to ensure all diagrams are processed
    console.log('Waiting for Mermaid diagrams to render...');
    await new Promise(resolve => setTimeout(resolve, 7000));
    console.log('Generating PDF...');

    // Generate PDF
    const pdfBuffer = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 8px; text-align: right; width: 100%; padding-right: 20px; color: #7f8c8d; margin-top: 5px;">CER - Compte-Rendu</div>',
        footerTemplate: '<div style="font-size: 8px; text-align: center; width: 100%; color: #7f8c8d; margin-bottom: 5px;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        margin: {
            top: '1cm',
            bottom: '1cm',
            left: '1.5cm',
            right: '1.5cm'
        }
    });

    pdfWindow.close();

    return pdfBuffer;
}

// Helper function to parse markdown to HTML
function parseMarkdownToHTML(markdown, colors) {
    const lines = markdown.split('\n');
    let html = '';
    let isHeader = true;
    let headerLines = [];
    let inTable = false;
    let tableRows = [];
    let inMermaidBlock = false;
    let mermaidContent = '';

    // TOC Data
    let toc = [];
    let contentHtml = '';

    for (let i = 0; i < lines.length; i++) {
        // Don't trim lines when inside Mermaid block to preserve formatting
        const line = inMermaidBlock ? lines[i] : lines[i].trim();

        // Skip empty lines to prevent extra spacing (unless in Mermaid block)
        if (!line && !inMermaidBlock) {
            continue;
        }

        // Mermaid Block Handling
        if (lines[i].trim().startsWith('```mermaid')) {
            inMermaidBlock = true;
            mermaidContent = '';
            continue;
        }

        if (inMermaidBlock) {
            if (lines[i].trim().startsWith('```')) {
                inMermaidBlock = false;
                // Preserve line breaks for Mermaid by replacing newlines with <br> isn't needed
                // Just keep the content clean with proper line breaks preserved
                const cleanContent = mermaidContent.trim();
                
                contentHtml += `<div class="mermaid-container" style="display: flex; justify-content: center; margin: 30px 0; page-break-inside: avoid;">
                    <div class="mermaid">
${cleanContent}
                    </div>
                </div>`;
                mermaidContent = '';
            } else {
                // Keep original line without trimming to preserve Mermaid syntax
                mermaidContent += lines[i] + '\n';
            }
            continue;
        }

        // Cover page header
        if (isHeader && !line.startsWith('##')) {
            headerLines.push(line);
            if (headerLines.length >= 4) {
                isHeader = false;
                html += '<div class="cover-page">';
                html += `<div class="cover-title">${headerLines[0]}</div>`;
                headerLines.slice(1).forEach(h => {
                    html += `<div class="cover-subtitle">${h}</div>`;
                });
                html += '<div class="cover-divider"></div>';
                html += '</div>';

                // Placeholder for TOC
                html += '<div class="toc-container page-break">';
                html += '<h1>Table des matières</h1>';
                html += '<ul class="toc-list">__TOC_PLACEHOLDER__</ul>';
                html += '</div>';

                html += '<div class="content page-break">';
            }
            continue;
        }

        // Headers
        if (line.startsWith('##### ')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += `<h4>${line.replace('##### ', '')}</h4>`;
        } else if (line.startsWith('#### ')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += `<h3>${line.replace('#### ', '')}</h3>`;
        } else if (line.startsWith('### ')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            const title = line.replace('### ', '');
            const id = 'subsection-' + toc.length;
            toc.push({ level: 2, title: title, id: id });
            contentHtml += `<h2 id="${id}">${title}</h2>`;
        } else if (line.startsWith('## ')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            const title = line.replace('## ', '');
            const id = 'section-' + toc.length;
            toc.push({ level: 1, title: title, id: id });
            contentHtml += `<h1 id="${id}" class="page-break">${title}</h1>`;
        }
        // Horizontal rule
        else if (line.startsWith('---')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += '<hr>';
        }
        // Table
        else if (line.startsWith('|')) {
            const cells = line.split('|').filter(c => c.trim()).map(c => c.trim());

            if (!inTable) {
                inTable = true;
                tableRows = [cells];
            } else if (line.includes('---')) {
                // Skip separator line
            } else {
                tableRows.push(cells);
            }

            // Check if this is the last table line
            if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
                contentHtml += '<table class="avoid-break"><thead><tr>';
                tableRows[0].forEach(cell => {
                    contentHtml += `<th>${cell.replace(/\*\*/g, '')}</th>`;
                });
                contentHtml += '</tr></thead><tbody>';

                for (let j = 1; j < tableRows.length; j++) {
                    contentHtml += '<tr>';
                    tableRows[j].forEach(cell => {
                        contentHtml += `<td>${formatInlineMarkdown(cell)}</td>`;
                    });
                    contentHtml += '</tr>';
                }

                contentHtml += '</tbody></table>';
                inTable = false;
                tableRows = [];
            }
        }
        // Bullet list
        else if (line.match(/^[-•\*]\s/)) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += `<ul><li>${formatInlineMarkdown(line.substring(2))}</li></ul>`;
        }
        // Markdown images: ![alt](url)
        else if (line.match(/!\[([^\]]*)\]\(([^)]+)\)/)) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            const imgMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
            const alt = imgMatch[1] || 'Diagramme';
            const src = imgMatch[2];
            contentHtml += `<img src="${src}" alt="${alt}" />`;
        }
        // HTML tags (like images)
        else if (line.startsWith('<img') || line.startsWith('<div') || line.startsWith('<')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += line; // Pass through HTML directly
        }
        // Code blocks
        else if (line.startsWith('```')) {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            // Handle code blocks
            let codeContent = '';
            let codeLang = line.replace('```', '').trim();
            
            // Skip mermaid blocks - they should already be converted to SVG
            if (codeLang === 'mermaid') {
                console.log('⚠️ Found mermaid block in HTML generator - skipping (should be SVG)');
                i++; // Move to next line
                while (i < lines.length && !lines[i].trim().startsWith('```')) {
                    i++;
                }
                continue;
            }
            
            i++; // Move to next line
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeContent += lines[i] + '\n';
                i++;
            }
            contentHtml += `<pre><code class="language-${codeLang}">${escapeHtml(codeContent.trim())}</code></pre>`;
        }
        // Regular paragraph
        else {
            if (inTable) { contentHtml += '</tbody></table>'; inTable = false; }
            contentHtml += `<p>${formatInlineMarkdown(line)}</p>`;
        }
    }

    // Generate TOC HTML
    let tocHtml = '';
    toc.forEach(item => {
        const indent = item.level === 1 ? '0' : '20px';
        const weight = item.level === 1 ? '600' : '400';
        const fontSize = item.level === 1 ? '12pt' : '11pt';

        tocHtml += `<li style="margin-left: ${indent}; font-weight: ${weight}; font-size: ${fontSize}">
            <a href="#${item.id}">
                <span class="toc-title">${item.title}</span>
                <span class="toc-dots"></span>
                <span class="toc-page">➤</span>
            </a>
        </li>`;
    });

    html = html.replace('__TOC_PLACEHOLDER__', tocHtml);
    html += contentHtml;
    html += '</div>'; // Close content div
    return html;
}

// Format inline markdown (bold, images, etc.)
function formatInlineMarkdown(text) {
    // Images: ![alt](url)
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;height:auto;display:block;margin:10px auto;" />');
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return text;
}

// Escape HTML for code blocks
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = { generatePDFFromHTML };
