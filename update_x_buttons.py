import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update title button
old_title_btn = """            {data.title && (
              <button onClick={() => setData({...data, title: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}"""
new_title_btn = """            {data.title && (
              <button onClick={() => setData({...data, title: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}"""
content = content.replace(old_title_btn, new_title_btn)

# Update bodyKr button
old_body_btn = """            {data.bodyKr && (
              <button onClick={() => setData({...data, bodyKr: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}"""
new_body_btn = """            {data.bodyKr && (
              <button onClick={() => setData({...data, bodyKr: ''})} className="absolute right-3 top-2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}"""
content = content.replace(old_body_btn, new_body_btn)

# Update meta button
old_meta_btn = """            {data.meta && (
              <button onClick={() => setData({...data, meta: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}"""
new_meta_btn = """            {data.meta && (
              <button onClick={() => setData({...data, meta: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}"""
content = content.replace(old_meta_btn, new_meta_btn)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("X buttons updated.")
