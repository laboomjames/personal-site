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

// Function to build pages from a directory
async function buildPagesFromDir(sourceDir, outputDir) {
    const files = await fs.readdir(sourceDir);
    
    for (const file of files) {
        if (file.endsWith('.md')) {
            const content = await fs.readFile(path.join(sourceDir, file), 'utf-8');
            const html = marked(content);
            const title = file.replace('.md', '');
            
            const finalHtml = pageTemplate
                .replace('{{title}}', title)
                .replace('{{content}}', html);
            
            const outputPath = path.join(outputDir, file.replace('.md', '.html'));
            await fs.writeFile(outputPath, finalHtml);
        }
    }
}

// Function to convert markdown to HTML
async function buildPages() {
    // Build main pages
    const indexContent = await fs.readFile(path.join(__dirname, 'src/content/index.md'), 'utf-8');
    const indexHtml = marked(indexContent);
    await fs.writeFile(
        path.join(__dirname, 'docs/index.html'),
        pageTemplate.replace('{{title}}', 'Home').replace('{{content}}', indexHtml)
    );

    // Build blog posts
    await buildPagesFromDir(
        path.join(__dirname, 'src/content/blog'),
        path.join(__dirname, 'docs/blog')
    );

    // Build other pages
    await buildPagesFromDir(
        path.join(__dirname, 'src/content/pages'),
        path.join(__dirname, 'docs/pages')
    );
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