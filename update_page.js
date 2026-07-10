const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');

// Replace html-to-image import with canvasExport import
content = content.replace("import { toJpeg } from 'html-to-image';", "import { generateCardImage } from '@/lib/canvasExport';");

// Replace the generation logic
content = content.replace(
  "const dataUrl = await toJpeg(rendererRef.current, { quality: 0.95, pixelRatio: 1 });",
  "// Native Canvas rendering avoids all HTML parsing delays\n        const dataUrl = await generateCardImage(data);"
);

fs.writeFileSync('app/page.tsx', content);
console.log("Success");
