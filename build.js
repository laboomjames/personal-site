const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');

// Check if we're in development mode
const isDev = process.argv.includes('--dev');

// Base path for GitHub Pages (empty in dev mode)
const BASE_PATH = isDev ? '' : '/personal-site';

// Ensure build directories exist
fs.ensureDirSync(path.join(__dirname, 'docs'));
fs.ensureDirSync(path.join(__dirname, 'docs/blog'));
fs.ensureDirSync(path.join(__dirname, 'docs/projects'));
fs.ensureDirSync(path.join(__dirname, 'docs/pages'));
fs.ensureDirSync(path.join(__dirname, 'docs/css'));
fs.ensureDirSync(path.join(__dirname, 'docs/js'));
fs.ensureDirSync(path.join(__dirname, 'docs/images'));

// Basic template for pages
const pageTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Personal website and project portfolio">
    <meta name="theme-color" content="#111111" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
    <title>{{title}}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${BASE_PATH}/css/main.css">
</head>
<body>
    <header>
        <nav>
            <a href="${BASE_PATH}/">HOME</a>
            <a href="${BASE_PATH}/blog">BLOG</a>
            <a href="${BASE_PATH}/projects">PROJECTS</a>
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
    // Add base path to markdown links
    const htmlContent = marked(content)
        .replace(/href="\//g, `href="${BASE_PATH}/`);
    
    const finalHtml = pageTemplate
        .replace('{{title}}', title)
        .replace('{{content}}', htmlContent);
    
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
        if (await fs.pathExists(path.join(__dirname, 'src/images'))) {
            await fs.copy(path.join(__dirname, 'src/images'), path.join(__dirname, 'docs/images'));
        }

        // Copy index.html if it exists
        if (await fs.pathExists(path.join(__dirname, 'src/index.html'))) {
            await fs.copy(path.join(__dirname, 'src/index.html'), path.join(__dirname, 'docs/index.html'));
        }

        console.log('Site built successfully!');
    } catch (error) {
        console.error('Build failed:', error);
    }
}

build(); 