import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add new state variables
state_injection = """  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);"""
content = content.replace("""  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);""", state_injection)


# 2. Replace handleExport entirely
old_export_regex = re.compile(r'  const handleExport = async \(\) => \{.*?\n    \}\n  \};', re.DOTALL)

new_export = """  const handleExport = async () => {
    if (rendererRef.current) {
      try {
        setIsExporting(true);
        // React가 UI를 업데이트(생성 중...)할 수 있도록 아주 약간 대기
        await new Promise(r => setTimeout(r, 100));
        
        const dataUrl = await toPng(rendererRef.current, { cacheBust: true, pixelRatio: 1 });
        setResultImage(dataUrl);
      } catch (err) {
        console.error('Export failed:', err);
        alert('이미지 생성에 실패했습니다.');
      } finally {
        setIsExporting(false);
      }
    }
  };

  const handleNativeShare = async () => {
    if (!resultImage) return;
    try {
      const fetchRes = await fetch(resultImage);
      const blob = await fetchRes.blob();
      const file = new File([blob], `cardnews_${data.templateId}_${Date.now()}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
            files: [file],
            title: '카드뉴스 이미지 저장'
        });
      } else {
        // Fallback for PC Chrome or unsupported browsers
        const link = document.createElement('a');
        link.download = file.name;
        link.href = resultImage;
        link.click();
      }
    } catch (err) {
      console.log('Share cancelled or failed', err);
    }
  };"""

content = old_export_regex.sub(new_export, content)

# 3. Update export button
old_button = """          <button 
            onClick={handleExport}
            className="w-2/3 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition"
          >
            <Download size={18} /> PNG로 저장하기
          </button>"""

new_button = """          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`w-2/3 ${isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition`}
          >
            <Download size={18} /> {isExporting ? '생성 중...' : 'PNG로 저장하기'}
          </button>"""
content = content.replace(old_button, new_button)

# 4. Insert Result Modal JSX right before the Crop Modal
crop_modal_start = "{/* Crop Modal */}"

result_modal_jsx = """      {/* Result Export Modal */}
      {resultImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 flex-col">
          <div className="bg-white rounded-xl p-6 w-full max-w-[420px] flex flex-col items-center shadow-2xl">
            <h3 className="font-extrabold text-2xl mb-2 text-gray-900">✨ 완성되었습니다!</h3>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm text-center font-medium mb-5 w-full">
              모바일의 경우 이미지를 <b>길게 눌러서</b><br/>'사진 앱에 저장'을 선택해 주세요.
            </div>
            
            <div className="w-full bg-gray-100 border-2 border-gray-200 rounded-lg overflow-hidden max-h-[50vh] flex justify-center items-center shadow-inner">
              <img src={resultImage} alt="완성된 카드뉴스" className="max-w-full max-h-[50vh] object-contain pointer-events-auto select-auto" style={{ WebkitTouchCallout: 'default' }} />
            </div>
            
            <div className="flex gap-3 w-full mt-6">
              <button 
                onClick={() => setResultImage(null)}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                닫기
              </button>
              <button 
                onClick={handleNativeShare}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Download size={18} /> 기기에 저장
              </button>
            </div>
          </div>
        </div>
      )}

      """

content = content.replace(crop_modal_start, result_modal_jsx + crop_modal_start)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal implementation applied.")
