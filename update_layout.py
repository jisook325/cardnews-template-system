import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add new state and effect for scale & advanced settings
state_injection = """  const imgRef = useRef<HTMLImageElement>(null);

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const scaleX = (width - 32) / 1080; 
        const scaleY = (height - 32) / 1350;
        setPreviewScale(Math.min(scaleX, scaleY, 1));
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);"""
content = content.replace("  const imgRef = useRef<HTMLImageElement>(null);", state_injection)

# 2. Change main flex layout to flex-col-reverse
content = content.replace(
    '<div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-gray-100 md:overflow-hidden text-sm">',
    '<div className="flex flex-col-reverse md:flex-row min-h-screen md:h-screen bg-gray-100 md:overflow-hidden text-sm">'
)

# 3. Reorder sidebar sections
sidebar_start = '<div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-lg h-auto md:h-full">'
sidebar_end = '      {/* Preview Area */}'

# Extract the whole sidebar
sidebar_regex = re.compile(re.escape(sidebar_start) + r'(.*?)' + re.escape('</div>\n\n      {/* Preview Area */}'), re.DOTALL)
sidebar_match = sidebar_regex.search(content)

if not sidebar_match:
    print("Could not find sidebar")
    exit(1)

inner_sidebar = sidebar_match.group(1)

# We need to extract the specific div blocks. 
# It's easier to just rebuild the sidebar.

templates_block = """        <div className="flex flex-col gap-3">
          <label className="font-semibold text-gray-700">템플릿 선택</label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => setData({ ...data, templateId: tpl.id })}
                className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                  data.templateId === tpl.id 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                }`}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>"""

font_block = """        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">글꼴 설정</label>
          <select
            name="fontFamily"
            value={data.fontFamily || 'Pretendard'}
            onChange={(e) => setData({ ...data, fontFamily: e.target.value })}
            className="p-2 border rounded-md focus:outline-blue-500 bg-white"
          >
            {fontFamilies.map((font) => (
              <option key={font.value} value={font.value}>
                {font.label}
              </option>
            ))}
          </select>
        </div>"""

theme_block = """        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">배경 테마 설정</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setData({ ...data, themeId: theme.id })}
                className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                  (data.themeId || 'white') === theme.id 
                    ? 'border-blue-600 scale-110 shadow-md ring-2 ring-blue-300' 
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: theme.bgColor }}
                title={theme.label}
              />
            ))}
          </div>
        </div>"""

text_input_block = """        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">텍스트 입력</label>
          <input 
            type="text" 
            name="title" 
            value={data.title} 
            onChange={handleTextChange} 
            placeholder="제목을 입력하세요." 
            className="p-2 border rounded-md focus:outline-blue-500"
          />
          <textarea 
            name="bodyKr" 
            value={data.bodyKr} 
            onChange={handleTextChange} 
            placeholder="사진에 어울리는 본문을 입력해보세요." 
            rows={4}
            className="p-2 border rounded-md resize-none focus:outline-blue-500"
          />
          <input 
            type="text" 
            name="meta" 
            value={data.meta} 
            onChange={handleTextChange} 
            placeholder="닉네임 또는 날짜를 입력해보세요." 
            className="p-2 border rounded-md focus:outline-blue-500"
          />
        </div>"""

photo_upload_block = """        {getPhotoSlots() > 0 && (
          <div className="flex flex-col gap-3">
            <label className="font-semibold text-gray-700">사진 업로드</label>
            {Array.from({ length: getPhotoSlots() }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-600 transition">
                  <ImageIcon size={16} className="mr-2"/> 사진 {i + 1} 첨부
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handlePhotoUpload(e, i)} 
                    className="hidden" 
                  />
                </label>
                {data.photos[i] && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded overflow-hidden border">
                      <img src={data.photos[i]} className="w-full h-full object-cover" alt="preview" />
                    </div>
                    {originalPhotos[i] && (
                      <button 
                        onClick={() => { setCurrentCropIndex(i); setIsCropModalOpen(true); setCrop(undefined); }}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                      >
                        크롭 수정
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}"""

export_button_block = """        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-auto z-20 border-t md:border-t-0">
          <button 
            onClick={handleExport}
            className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition"
          >
            <Download size={18} /> PNG로 저장하기
          </button>
        </div>"""

advanced_toggle_block = """        <div className="pt-4 border-t border-gray-100">
          <button 
            onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
            className="w-full py-2 bg-gray-50 text-gray-700 font-semibold rounded-md border border-gray-200 hover:bg-gray-100 transition flex justify-between items-center px-4"
          >
            <span>디자인 고급 설정 (템플릿, 글꼴, 테마)</span>
            <span>{isAdvancedSettingsOpen ? '▲' : '▼'}</span>
          </button>
        </div>
        
        {isAdvancedSettingsOpen && (
          <div className="flex flex-col gap-6 bg-gray-50 p-4 rounded-md border border-gray-100">
""" + templates_block + "\n\n" + font_block + "\n\n" + theme_block + """
          </div>
        )}"""

new_sidebar = f"""
        <h2 className="text-xl font-bold text-gray-800 pb-4 border-b">카드뉴스 에디터</h2>
        
{text_input_block}

{photo_upload_block}

{advanced_toggle_block}

{export_button_block}
"""

content = content.replace(inner_sidebar, new_sidebar)

# 4. Modify preview area for dynamic scaling
old_preview_area = """      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative min-h-[400px] md:min-h-0 overflow-auto">
        <div className="bg-gray-200 p-4 shadow-inner border border-gray-300 max-w-full overflow-auto">
          <div className="relative" style={{ width: 1080 * 0.5, height: 1350 * 0.5 }}>
            <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: 1080, height: 1350 }}>
              <CardRenderer data={data} rendererRef={rendererRef} />
            </div>
          </div>
        </div>
      </div>"""

new_preview_area = """      {/* Preview Area */}
      <div 
        ref={previewContainerRef}
        className="flex-1 flex items-center justify-center p-4 relative min-h-[500px] md:min-h-0 bg-gray-200 overflow-hidden"
      >
        <div style={{ width: 1080 * previewScale, height: 1350 * previewScale }} className="relative shadow-2xl bg-white border border-gray-300">
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 1080, height: 1350 }}>
            <CardRenderer data={data} rendererRef={rendererRef} />
          </div>
        </div>
      </div>"""

content = content.replace(old_preview_area, new_preview_area)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI modifications applied.")
