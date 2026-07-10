import re

with open('components/CardRenderer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add onPhotoClick to Props
props_regex = re.compile(r'(interface Props \{.*?rendererRef\?: React\.RefObject<HTMLDivElement \| null>;\n)\}', re.DOTALL)
content = props_regex.sub(r'\1  onPhotoClick?: (index: number) => void;\n}', content)

# 2. Add onPhotoClick to CardRenderer arguments
content = content.replace("export default function CardRenderer({ data, rendererRef }: Props) {", "export default function CardRenderer({ data, rendererRef, onPhotoClick }: Props) {")

# 3. Fix P1_V2 background color (remove the static boxBgColor so it inherits or uses bgColor)
# Wait, let's just make it transparent or use bgColor. The user said: "설정한 컬러세트를 따라갈 수 있도록 해주세요."
# If I change it to `backgroundColor: theme.boxBgColor`, it was already `theme.boxBgColor`. Wait! `boxBgColor` IS white for most themes!
# If I change it to `backgroundColor: 'transparent'`, it will inherit the card's `theme.bgColor` which is the theme's background color.
content = content.replace('className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[40px]"\n            style={{ backgroundColor: theme.boxBgColor }}', 'className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[40px]"\n            style={{ backgroundColor: "transparent" }}')

# 4. Make all image slots clickable. We can replace all `<div className="absolute ... flex items-center justify-center overflow-hidden">` with a clickable div.
# But instead of regexing all divs, let's just replace the exact tags for photos.
# We have 10 occurrences of photo divs.
# I'll just use a python function to replace them.

def replace_photo_slot(match):
    idx = match.group(1)
    # find the div before it
    # actually, it's easier to replace the <div ...> with <div ... onClick={() => onPhotoClick?.(idx)} className="... cursor-pointer">
    return match.group(0)

# Actually, I can just replace `bg-[#E5E7EB]` and `bg-[#D1D5DB]` with `bg-[#E5E7EB] cursor-pointer` and add onClick.
# A simpler way is to replace `{data.photos[0] ?` with `onClick={() => onPhotoClick?.(0)} ...`
# Let's do it manually using Python string replaces.

for i in range(4):
    content = content.replace(f"{{data.photos[{i}] ?", f"onClick={{() => onPhotoClick?.({i})}}\n            className=\"cursor-pointer w-full h-full flex items-center justify-center\"\n          >\n            {{data.photos[{i}] ?")
    
    # Wait, the div around it looks like:
    # <div className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
    # {data.photos[0] ? (

# Let's use a regex to inject onClick into the wrapping div.
# The wrapping div is the line right before `{data.photos[X] ?`
import re

def replacer(m):
    # m.group(1) is the div line
    # m.group(2) is the index
    div_line = m.group(1)
    idx = m.group(2)
    # insert onClick and cursor-pointer
    div_line = div_line.replace('className="', f'onClick={{() => onPhotoClick?.({idx})}} className="cursor-pointer transition hover:opacity-90 ')
    return f"{div_line}\n            {{data.photos[{idx}] ?"

content = re.sub(r'(<div[^>]*?>)\n\s*\{data\.photos\[(\d+)\] \?', replacer, content)

with open('components/CardRenderer.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("CardRenderer updated.")
