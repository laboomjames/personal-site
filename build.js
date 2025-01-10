const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Ensure build directories exist
fs.ensureDirSync(path.join(__dirname, 'docs'));
fs.ensureDirSync(path.join(__dirname, 'docs/blog'));
fs.ensureDirSync(path.join(__dirname, 'docs/projects'));
fs.ensureDirSync(path.join(__dirname, 'docs/css'));

// Basic template for pages
const pageTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - SSK's Coding Journey</title>
    <link rel="stylesheet" href="/css/main.css">
</head>
<body>
    <nav>
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/projects">Projects</a>
    </nav>
    <main>
        {{content}}
    </main>
    <script src="/js/main.js"></script>
</body>
</html>
`;

// Function to convert markdown to HTML and save
async function buildPage(sourcePath, outputPath, title) {
    const content = await fs.readFile(sourcePath, 'utf-8');
    const html = marked(content);
    const finalHtml = pageTemplate
        .replace('{{title}}', title)
        .replace('{{content}}', html);
    await fs.writeFile(outputPath, finalHtml);
}

// Main build process
async function build() {
    try {
        // Build main pages
        await buildPage(
            path.join(__dirname, 'src/content/index.md'),
            path.join(__dirname, 'docs/index.html'),
            'Home'
        );

        // Build blog index
        await buildPage(
            path.join(__dirname, 'src/content/blog/index.md'),
            path.join(__dirname, 'docs/blog/index.html'),
            'Blog'
        );

        // Build projects page
        await buildPage(
            path.join(__dirname, 'src/content/projects/index.md'),
            path.join(__dirname, 'docs/projects/index.html'),
            'Projects'
        );

        // Copy static assets
        await fs.copy(path.join(__dirname, 'src/styles/main.css'), path.join(__dirname, 'docs/css/main.css'));
        await fs.copy(path.join(__dirname, 'src/scripts/main.js'), path.join(__dirname, 'docs/js/main.js'));

        console.log('Site built successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 