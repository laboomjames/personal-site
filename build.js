const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Ensure build directories exist
fs.ensureDirSync(path.join(__dirname, 'docs'));
fs.ensureDirSync(path.join(__dirname, 'src/content'));
fs.ensureDirSync(path.join(__dirname, 'src/templates'));
fs.ensureDirSync(path.join(__dirname, 'src/styles'));
fs.ensureDirSync(path.join(__dirname, 'src/scripts'));

// Basic template for pages
const pageTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/about">About</a>
        <a href="/faq">FAQ</a>
    </nav>
    <main>
        {{content}}
    </main>
    <script src="/scripts/main.js"></script>
</body>
</html>
`;

// Function to convert markdown to HTML
async function buildPages() {
    const contentDir = path.join(__dirname, 'src/content');
    const files = await fs.readdir(contentDir);
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
            const html = marked(content);
            const title = file.replace('.md', '');
            
            const finalHtml = pageTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html);
            
            const outputPath = path.join(__dirname, 'docs', file.replace('.md', '.html'));
            await fs.writeFile(outputPath, finalHtml);
        }
    }
}

// Copy static assets
async function copyStatic() {
    await fs.copy(path.join(__dirname, 'src/styles'), path.join(__dirname, 'docs/styles'));
    await fs.copy(path.join(__dirname, 'src/scripts'), path.join(__dirname, 'docs/scripts'));
}

// Main build process
async function build() {
    try {
        await buildPages();
        await copyStatic();
        console.log('Site built successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 