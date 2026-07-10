import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handleReset function
old_export_fn = """  const handleExport = async () => {"""
new_export_fn = """  const handleReset = () => {
    if (window.confirm('작성 중인 내용과 사진이 모두 초기화됩니다. 새로 만드시겠습니까?')) {
      localStorage.removeItem('cardnews_editor_data');
      setData({
        title: '',
        bodyKr: '',
        meta: '',
        photos: [],
        templateId: 'P1_V1',
        fontFamily: 'Pretendard',
        themeId: 'white',
      });
      setOriginalPhotos([]);
    }
  };

  const handleExport = async () => {"""
content = content.replace(old_export_fn, new_export_fn)

# Replace the bottom button area
old_buttons = """        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-auto z-20 border-t md:border-t-0">
          <button 
            onClick={handleExport}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition"
          >
            <Download size={18} /> PNG로 저장하기
          </button>
        </div>"""

new_buttons = """        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-auto z-20 border-t md:border-t-0 flex gap-2">
          <button 
            onClick={handleReset}
            className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md flex justify-center items-center transition text-sm"
          >
            새로 만들기
          </button>
          <button 
            onClick={handleExport}
            className="w-2/3 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition"
          >
            <Download size={18} /> PNG로 저장하기
          </button>
        </div>"""

content = content.replace(old_buttons, new_buttons)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Reset button added.")
