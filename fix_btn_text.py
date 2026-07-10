import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace PNG로 저장하기 with 이미지로 저장하기
content = content.replace("'PNG로 저장하기'", "'이미지로 저장하기'")

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Button text updated.")
