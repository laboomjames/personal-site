const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Ensure build directories exist
fs.ensureDirSync(path.join(__dirname, 'docs'));
fs.ensureDirSync(path.join(__dirname, 'docs/blog'));
fs.ensureDirSync(path.join(__dirname, 'docs/css'));
fs.ensureDirSync(path.join(__dirname, 'docs/pages'));

// Basic template for pages
const pageTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/pages/about">About</a>
        <a href="/pages/faq">FAQ</a>
    </nav>
    <main>
        {{content}}
    </main>
    <script src="/js/main.js"></script>
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
            
            let outputPath;
            if (file === 'index.md') {
                outputPath = path.join(__dirname, 'docs', 'index.html');
            } else if (file.startsWith('blog-')) {
                outputPath = path.join(__dirname, 'docs/blog', file.replace('blog-', '').replace('.md', '.html'));
            } else {
                outputPath = path.join(__dirname, 'docs/pages', file.replace('.md', '.html'));
            }
            
            const finalHtml = pageTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html);
            
            await fs.writeFile(outputPath, finalHtml);
        }
    }
}

// Copy static assets
async function copyStatic() {
    await fs.copy(path.join(__dirname, 'src/styles/main.css'), path.join(__dirname, 'docs/css/main.css'));
    await fs.copy(path.join(__dirname, 'src/scripts/main.js'), path.join(__dirname, 'docs/js/main.js'));
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