import re

with open('components/CardRenderer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('backgroundColor: theme.boxBgColor,', 'backgroundColor: "transparent",')

with open('components/CardRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('lib/canvasExport.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('    ctx.fillStyle = theme.boxBgColor;\n    ctx.fillRect(50, 45, 980, 1260);\n', '')

with open('lib/canvasExport.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed")
