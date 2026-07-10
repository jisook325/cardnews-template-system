import re

# 1. Update CardRenderer.tsx
with open('components/CardRenderer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove 'shadow-sm border' and borderColor style
content = content.replace(
    'className="absolute left-[50px] top-[45px] w-[980px] h-[1260px] flex flex-col justify-between p-[40px] shadow-sm border"\n          style={{ backgroundColor: \'transparent\', borderColor: theme.borderThemeColor }}',
    'className="absolute left-[50px] top-[45px] w-[980px] h-[1260px] flex flex-col justify-between p-[40px]"\n          style={{ backgroundColor: \'transparent\' }}'
)

with open('components/CardRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# 2. Update lib/canvasExport.ts
with open('lib/canvasExport.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove strokeRect
content = content.replace(
    '    ctx.strokeStyle = theme.borderThemeColor;\n    ctx.lineWidth = 1;\n    ctx.strokeRect(50, 45, 980, 1260);\n',
    ''
)

with open('lib/canvasExport.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Outline removed.")
