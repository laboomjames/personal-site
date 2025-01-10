const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Ensure build directories exist
fs.ensureDirSync(path.join(__dirname, 'docs'));
fs.ensureDirSync(path.join(__dirname, 'docs/blog'));
fs.ensureDirSync(path.join(__dirname, 'docs/projects'));
fs.ensureDirSync(path.join(__dirname, 'docs/pages'));
fs.ensureDirSync(path.join(__dirname, 'docs/css'));

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
    <header>
        <nav>
            <a href="/">Home</a>
            <a href="/blog">Blog</a>
            <a href="/projects">Projects</a>
        </nav>
    </header>
    <main>
        {{content}}
    </main>
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

// Function to build all pages in a directory
async function buildPagesInDirectory(sourceDir, outputDir) {
    try {
        const files = await fs.readdir(sourceDir);
        for (const file of files) {
            if (file.endsWith('.md')) {
                const title = file.replace('.md', '');
                await buildPage(
                    path.join(sourceDir, file),
                    path.join(outputDir, file.replace('.md', '.html')),
                    title
                );
            }
        }
    } catch (error) {
        console.error(`Error building pages in ${sourceDir}:`, error);
    }
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

        // Build blog index and posts
        await buildPage(
            path.join(__dirname, 'src/content/blog/index.md'),
            path.join(__dirname, 'docs/blog/index.html'),
            'Blog'
        );
        await buildPagesInDirectory(
            path.join(__dirname, 'src/content/blog'),
            path.join(__dirname, 'docs/blog')
        );

        // Build projects page
        await buildPage(
            path.join(__dirname, 'src/content/projects/index.md'),
            path.join(__dirname, 'docs/projects/index.html'),
            'Projects'
        );

        // Build other pages
        await buildPagesInDirectory(
            path.join(__dirname, 'src/content/pages'),
            path.join(__dirname, 'docs/pages')
        );

        // Copy static assets
        await fs.copy(path.join(__dirname, 'src/styles/main.css'), path.join(__dirname, 'docs/css/main.css'));
        await fs.copy(path.join(__dirname, 'src/scripts/main.js'), path.join(__dirname, 'docs/js/main.js'));
        await fs.copy(path.join(__dirname, 'src/images'), path.join(__dirname, 'docs/images'));

        console.log('Site built successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 