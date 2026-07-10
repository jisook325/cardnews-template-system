const fs = require('fs');

let content = fs.readFileSync('components/CardRenderer.tsx', 'utf-8');

// Replace line-clamp with line-clamp and whitespace-pre-wrap
content = content.replace(/className="([^"]*line-clamp-\d+[^"]*)"/g, (match, p1) => {
    if (!p1.includes('whitespace-pre-wrap')) {
        return `className="${p1} whitespace-pre-wrap"`;
    }
    return match;
});

fs.writeFileSync('components/CardRenderer.tsx', content);
console.log("Success");
