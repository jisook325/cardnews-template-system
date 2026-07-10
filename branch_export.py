import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_export_regex = re.compile(r'  const handleExport = async \(\) => \{.*?\n    \}\n  \};', re.DOTALL)

new_export = """  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  };

  const handleExport = async () => {
    if (rendererRef.current) {
      try {
        setIsExporting(true);
        // React가 UI를 업데이트(생성 중...)할 수 있도록 아주 약간 대기
        await new Promise(r => setTimeout(r, 100));
        
        const dataUrl = await toPng(rendererRef.current, { cacheBust: true, pixelRatio: 1 });
        
        if (isMobile()) {
          // 모바일: 팝업 띄우기
          setResultImage(dataUrl);
        } else {
          // PC: 즉시 다운로드
          const link = document.createElement('a');
          link.download = `cardnews_${data.templateId}_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (err) {
        console.error('Export failed:', err);
        alert('이미지 생성에 실패했습니다.');
      } finally {
        setIsExporting(false);
      }
    }
  };"""

content = old_export_regex.sub(new_export, content)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Export logic branched successfully.")
