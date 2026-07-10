import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update placeholder
content = content.replace('placeholder="제목을 입력하세요."', 'placeholder="제목을 입력해보세요"')

# 2. Extract advanced settings block
toggle_start = '<div className="pt-4 border-t border-gray-100">'
advanced_end = '</div>\n        )}\n'

advanced_regex = re.compile(re.escape(toggle_start) + r'(.*?)' + re.escape('</div>\n        )}\n'), re.DOTALL)
advanced_match = advanced_regex.search(content)

if advanced_match:
    advanced_block = advanced_match.group(0)
    
    # Remove it from its current position
    content = content.replace(advanced_block, '')
    
    # Insert it right after the <h2>...</h2>
    h2_tag = '<h2 className="text-xl font-bold text-gray-800 pb-4 border-b">카드뉴스 에디터</h2>\n        '
    # we might need to adjust margins so it looks good at the top. Let's remove pt-4 border-t border-gray-100 from the toggle and add pb-4 border-b border-gray-100 maybe? Or just keep it as is.
    # Actually, removing border-t is better.
    new_advanced_block = advanced_block.replace('<div className="pt-4 border-t border-gray-100">', '<div className="pb-2">')
    
    content = content.replace(h2_tag, h2_tag + new_advanced_block + '\n')

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Settings moved.")
