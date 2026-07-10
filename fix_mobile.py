import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleExport
old_export = """  const handleExport = async () => {
    if (rendererRef.current) {
      try {
        const dataUrl = await toPng(rendererRef.current, { cacheBust: true, pixelRatio: 1 });
        const link = document.createElement('a');
        link.download = `cardnews_${data.templateId}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Export failed:', err);
        alert('이미지 저장에 실패했습니다.');
      }
    }
  };"""

new_export = """  const handleExport = async () => {
    if (rendererRef.current) {
      try {
        // iOS Safari 등 모바일 환경 렌더링 안정성을 위해 약간의 지연 또는 두 번 캡처가 도움될 수 있음
        const dataUrl = await toPng(rendererRef.current, { cacheBust: true, pixelRatio: 1 });
        
        const fetchRes = await fetch(dataUrl);
        const blob = await fetchRes.blob();
        const file = new File([blob], `cardnews_${data.templateId}_${Date.now()}.png`, { type: 'image/png' });
        
        // 모바일 네이티브 공유/저장 기능 (iOS Safari 완벽 호환)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: '카드뉴스 이미지 저장'
                });
                return;
            } catch (err) {
                console.log('Share cancelled', err);
            }
        }

        // 일반 다운로드 폴백
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = file.name;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Export failed:', err);
        alert('이미지 저장에 실패했습니다.');
      }
    }
  };"""

content = content.replace(old_export, new_export)

# 2. Update Text Inputs
old_inputs = """        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">텍스트 입력</label>
          <input 
            type="text" 
            name="title" 
            value={data.title} 
            onChange={handleTextChange} 
            placeholder="제목을 입력해보세요" 
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

new_inputs = """        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">텍스트 입력</label>
          <div className="relative">
            <input 
              type="text" 
              name="title" 
              value={data.title} 
              onChange={handleTextChange} 
              placeholder="제목을 입력해보세요" 
              className="p-2 w-full pr-8 border rounded-md focus:outline-blue-500"
            />
            {data.title && (
              <button onClick={() => setData({...data, title: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <div className="relative">
            <textarea 
              name="bodyKr" 
              value={data.bodyKr} 
              onChange={handleTextChange} 
              placeholder="사진에 어울리는 본문을 입력해보세요." 
              rows={4}
              className="p-2 w-full pr-8 border rounded-md resize-none focus:outline-blue-500"
            />
            {data.bodyKr && (
              <button onClick={() => setData({...data, bodyKr: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <div className="relative">
            <input 
              type="text" 
              name="meta" 
              value={data.meta} 
              onChange={handleTextChange} 
              placeholder="닉네임 또는 날짜를 입력해보세요." 
              className="p-2 w-full pr-8 border rounded-md focus:outline-blue-500"
            />
            {data.meta && (
              <button onClick={() => setData({...data, meta: ''})} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
        </div>"""

content = content.replace(old_inputs, new_inputs)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications applied successfully.")
