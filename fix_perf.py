import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace import
content = content.replace("import { toPng } from 'html-to-image';", "import { toJpeg } from 'html-to-image';")

# Replace toPng with toJpeg and change options
old_generate = "const dataUrl = await toPng(rendererRef.current, { cacheBust: true, pixelRatio: 1 });"
new_generate = "const dataUrl = await toJpeg(rendererRef.current, { quality: 0.95, pixelRatio: 1 });"
content = content.replace(old_generate, new_generate)

# Update the file extension in download logic
content = content.replace("`cardnews_${data.templateId}_${Date.now()}.png`", "`cardnews_${data.templateId}_${Date.now()}.jpg`")
content = content.replace("{ type: 'image/png' }", "{ type: 'image/jpeg' }")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Performance optimization applied.")
