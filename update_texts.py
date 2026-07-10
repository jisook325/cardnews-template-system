import os

# Update CardRenderer.tsx
renderer_path = 'components/CardRenderer.tsx'
with open(renderer_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Photo X -> 사진 X
content = content.replace('Photo 1', '사진 1')
content = content.replace('Photo 2', '사진 2')
content = content.replace('Photo 3', '사진 3')
content = content.replace('Photo 4', '사진 4')

# Remove fallback texts
content = content.replace("data.title || '제목을 입력하세요'", "data.title")
content = content.replace("data.bodyKr || '본문을 입력하세요'", "data.bodyKr")
content = content.replace("data.meta || '메타 정보'", "data.meta")

with open(renderer_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Update page.tsx
page_path = 'app/page.tsx'
with open(page_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change title initial state and placeholder
content = content.replace("title: 'title',", "title: '',")
content = content.replace('placeholder="title"', 'placeholder="제목을 입력하세요."')

with open(page_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Text updates applied successfully.")
