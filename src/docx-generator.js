// docx-generator.js - Word Document Generation

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx';

export async function generateWordDocument(cerMarkdown, codeImages = {}) {
    // Parse the markdown CER into structured sections
    const sections = parseCER(cerMarkdown);

    // Create document with proper styling
    const doc = new Document({
        sections: [{
            properties: {},
            children: createDocumentElements(sections)
        }],
        styles: {
            default: {
                document: {
                    run: {
                        font: 'Calibri',
                        size: 22 // 11pt
                    },
                    paragraph: {
                        spacing: {
                            after: 200,
                            line: 276
                        }
                    }
                }
            },
            paragraphStyles: [
                {
                    id: 'Heading1',
                    name: 'Heading 1',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        size: 32,
                        bold: true,
                        color: '2E3192'
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 }
                    }
                },
                {
                    id: 'Heading2',
                    name: 'Heading 2',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        size: 28,
                        bold: true,
                        color: '2E3192'
                    },
                    paragraph: {
                        spacing: { before: 300, after: 150 }
                    }
                },
                {
                    id: 'Heading3',
                    name: 'Heading 3',
                    basedOn: 'Normal',
                    next: 'Normal',
                    run: {
                        size: 24,
                        bold: true,
                        color: '404040'
                    },
                    paragraph: {
                        spacing: { before: 200, after: 100 }
                    }
                }
            ]
        }
    });

    // Convert to buffer
    const buffer = await Packer.toBuffer(doc);
    return Array.from(new Uint8Array(buffer));
}

function parseCER(markdown) {
    const lines = markdown.split('\n');
    const sections = {
        header: [],
        toc: [],
        introduction: [],
        research: [],
        conclusion: []
    };

    let currentSection = 'header';
    let inIntroduction = false;
    let inResearch = false;

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect sections
        if (trimmed.startsWith('## Table des matières')) {
            currentSection = 'toc';
            continue;
        } else if (trimmed.startsWith('## Introduction')) {
            currentSection = 'introduction';
            inIntroduction = true;
            continue;
        } else if (trimmed.startsWith('## Recherches')) {
            currentSection = 'research';
            inResearch = true;
            inIntroduction = false;
            continue;
        } else if (trimmed.startsWith('## Bilan')) {
            currentSection = 'conclusion';
            inResearch = false;
            continue;
        }

        sections[currentSection].push(line);
    }

    return sections;
}

function createDocumentElements(sections) {
    const elements = [];

    // Header section
    if (sections.header.length > 0) {
        sections.header.forEach(line => {
            const trimmed = line.trim();
            if (trimmed) {
                elements.push(
                    new Paragraph({
                        children: [new TextRun({ text: trimmed, size: 24 })],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 }
                    })
                );
            }
        });
        elements.push(createSectionBreak());
    }

    // Table of Contents
    elements.push(
        new Paragraph({
            text: 'Table des matières',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
        })
    );
    elements.push(createTOC());
    elements.push(createSectionBreak());

    // Introduction
    elements.push(
        new Paragraph({
            text: 'Introduction',
            heading: HeadingLevel.HEADING_1
        })
    );
    elements.push(...parseContentToElements(sections.introduction.join('\n')));
    elements.push(createSectionBreak());

    // Research
    elements.push(
        new Paragraph({
            text: 'Recherches & Expérimentations',
            heading: HeadingLevel.HEADING_1
        })
    );
    elements.push(...parseContentToElements(sections.research.join('\n')));
    elements.push(createSectionBreak());

    // Conclusion
    elements.push(
        new Paragraph({
            text: 'Bilan',
            heading: HeadingLevel.HEADING_1
        })
    );
    elements.push(...parseContentToElements(sections.conclusion.join('\n')));

    return elements;
}

function parseContentToElements(content) {
    const elements = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        // Headings
        if (trimmed.startsWith('### ')) {
            elements.push(
                new Paragraph({
                    text: trimmed.replace('### ', ''),
                    heading: HeadingLevel.HEADING_3
                })
            );
        } else if (trimmed.startsWith('## ')) {
            elements.push(
                new Paragraph({
                    text: trimmed.replace('## ', ''),
                    heading: HeadingLevel.HEADING_2
                })
            );
        } else if (trimmed.startsWith('# ')) {
            elements.push(
                new Paragraph({
                    text: trimmed.replace('# ', ''),
                    heading: HeadingLevel.HEADING_1
                })
            );
        }
        // Bullet points
        else if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const text = trimmed.substring(2);
            elements.push(
                new Paragraph({
                    children: [new TextRun(text)],
                    bullet: {
                        level: 0
                    },
                    spacing: { after: 100 }
                })
            );
        }
        // Regular paragraphs
        else {
            // Handle bold and italic
            const children = parseInlineFormatting(trimmed);
            elements.push(
                new Paragraph({
                    children: children,
                    spacing: { after: 150 }
                })
            );
        }
    }

    return elements;
}

function parseInlineFormatting(text) {
    const children = [];
    let remaining = text;

    // Simple regex for bold (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
        // Add text before bold
        if (match.index > lastIndex) {
            children.push(new TextRun(text.substring(lastIndex, match.index)));
        }
        // Add bold text
        children.push(new TextRun({ text: match[1], bold: true }));
        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        children.push(new TextRun(text.substring(lastIndex)));
    }

    return children.length > 0 ? children : [new TextRun(text)];
}

function createTOC() {
    return new Paragraph({
        children: [
            new TextRun('Introduction'),
            new TextRun('\t.....................................................'),
            new TextRun('\t2')
        ],
        spacing: { after: 100 }
    });
}

function createSectionBreak() {
    return new Paragraph({
        text: '',
        spacing: { after: 400 }
    });
}
