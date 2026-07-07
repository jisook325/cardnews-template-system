"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CardRenderer, { CardData, TemplateId } from '@/components/CardRenderer';
import { generateCardImage } from '@/lib/canvasExport';
import { Download, ImageIcon } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<CardData>({
    title: '',
    bodyKr: '사진에 어울리는 본문을 입력해보세요.',
    meta: '닉네임 또는 날짜를 입력해보세요.',
    photos: [],
    templateId: 'P1_V1',
    fontFamily: 'Pretendard',
    themeId: 'white',
  });

  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [crop, setCrop] = useState<Crop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

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
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cardnews_editor_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData(parsed.data);
        if (parsed.originalPhotos) setOriginalPhotos(parsed.originalPhotos);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cardnews_editor_data', JSON.stringify({ data, originalPhotos }));
    } catch (e) {
      console.warn('Local storage save failed, possibly quota exceeded', e);
    }
  }, [data, originalPhotos]);

  const rendererRef = useRef<HTMLDivElement>(null);

  const templates: { id: TemplateId, label: string }[] = [
    { id: 'P0', label: '사진 없음 (P0)' },
    { id: 'P1_V1', label: '비대칭 1장 (P1_V1)' },
    { id: 'P1_V2', label: '상단 1장 (P1_V2)' },
    { id: 'P2', label: '분할 2장 (P2)' },
    { id: 'P3', label: '1+2 격자 (P3)' },
    { id: 'P4', label: '2x2 격자 (P4)' },
  ];

  const fontFamilies = [
    { value: 'Pretendard', label: 'Pretendard (기본 고딕)' },
    { value: 'Noto Sans KR', label: 'Noto Sans KR (구글 고딕)' },
    { value: 'Noto Serif KR', label: 'Noto Serif KR (구글 명조)' },
    { value: 'GmarketSans', label: 'Gmarket Sans (헤드라인 고딕)' },
    { value: 'Gowun Batang', label: 'Gowun Batang (고운 바탕)' },
    { value: 'Jua', label: 'Jua (배민 주아체)' },
    { value: 'Black Han Sans', label: 'Black Han Sans (검은고딕)' },
  ];

  const colorThemes = [
    { id: 'white', label: 'White (기본)', bgColor: '#F8F9FA' },
    { id: 'pistachio', label: 'Pistachio', bgColor: '#BADD7F' },
    { id: 'columbia', label: 'Columbia Blue', bgColor: '#B9D9EB' },
    { id: 'dartmouth', label: 'Dartmouth Green', bgColor: '#00693E' },
    { id: 'electric', label: 'Electric Blue', bgColor: '#0029FF' },
    { id: 'sunshine', label: 'Sunshine', bgColor: '#F9E793' },
    { id: 'periwinkle', label: 'Periwinkle', bgColor: '#AFC5FF' },
    { id: 'lemon', label: 'Lemon', bgColor: '#FCFF82' },
    { id: 'cantaloupe', label: 'Cantaloupe', bgColor: '#FF9C6D' },
    { id: 'watermelon', label: 'Watermelon', bgColor: '#FD5959' },
  ];

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const resized = await resizeImage(file);
      setOriginalPhotos(prev => {
        const newOrig = [...prev];
        newOrig[index] = resized;
        return newOrig;
      });
      setCurrentCropIndex(index);
      setIsCropModalOpen(true);
      setCrop(undefined);
    }
  };

  const getCroppedImg = () => {
    if (!crop || !crop.width || !crop.height) {
      setData(prev => {
        const newPhotos = [...prev.photos];
        newPhotos[currentCropIndex] = originalPhotos[currentCropIndex];
        return { ...prev, photos: newPhotos };
      });
      setIsCropModalOpen(false);
      return;
    }
    const canvas = document.createElement('canvas');
    if (!imgRef.current) return;
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    const base64Image = canvas.toDataURL('image/jpeg', 0.9);
    setData(prev => {
      const newPhotos = [...prev.photos];
      newPhotos[currentCropIndex] = base64Image;
      return { ...prev, photos: newPhotos };
    });
    setIsCropModalOpen(false);
  };

  const getCropAspect = () => {
    switch (data.templateId) {
      case 'P1_V1': return 0.75;
      case 'P1_V2': return 2.24;
      case 'P2': return 2.24;
      case 'P3': return currentCropIndex === 0 ? 2.24 : 1.11;
      case 'P4': return 1.0;
      default: return 1;
    }
  };

  const handleReset = () => {
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

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  };

  const handleExport = async () => {
    if (rendererRef.current) {
      try {
        setIsExporting(true);
        // React가 UI를 업데이트(생성 중...)할 수 있도록 아주 약간 대기
        await new Promise(r => setTimeout(r, 100));
        
        // Native Canvas rendering avoids all HTML parsing delays
        const dataUrl = await generateCardImage(data);
        
        if (isMobile()) {
          // 모바일: 팝업 띄우기
          setResultImage(dataUrl);
        } else {
          // PC: 즉시 다운로드
          const link = document.createElement('a');
          link.download = `cardnews_${data.templateId}_${Date.now()}.jpg`;
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
  };

  const handleNativeShare = async () => {
    if (!resultImage) return;
    try {
      const fetchRes = await fetch(resultImage);
      const blob = await fetchRes.blob();
      const file = new File([blob], `cardnews_${data.templateId}_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
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
  };

  const getPhotoSlots = () => {
    switch (data.templateId) {
      case 'P0': return 0;
      case 'P1_V1':
      case 'P1_V2': return 1;
      case 'P2': return 2;
      case 'P3': return 3;
      case 'P4': return 4;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row min-h-screen md:h-screen bg-gray-100 md:overflow-hidden text-sm">
      {/* Sidebar / Editor */}
      <div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-lg h-auto md:h-full">
        <h2 className="text-xl font-bold text-gray-800 pb-4 border-b">카드뉴스 에디터</h2>
        <div className="pb-2">
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
        <div className="flex flex-col gap-3">
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
        </div>

        <div className="flex flex-col gap-2">
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
        </div>

        <div className="flex flex-col gap-2">
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
        </div>
          </div>
        )}


        <div className="flex flex-col gap-2">
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
              <button onClick={() => setData({...data, title: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
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
              <button onClick={() => setData({...data, bodyKr: ''})} className="absolute right-3 top-2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
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
              <button onClick={() => setData({...data, meta: ''})} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}
          </div>
        </div>

        {getPhotoSlots() > 0 && (
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
        )}

        
        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-auto z-20 border-t md:border-t-0 flex gap-2">
          <button 
            onClick={handleReset}
            className="w-1/3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md flex justify-center items-center transition text-sm"
          >
            새로 만들기
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`w-2/3 ${isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'} text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition`}
          >
            <Download size={18} /> {isExporting ? '생성 중...' : '이미지로 저장하기'}
          </button>
        </div>
</div>

      {/* Preview Area */}
      <div 
        ref={previewContainerRef}
        className="flex-1 flex items-center justify-center p-4 relative min-h-[500px] md:min-h-0 bg-gray-200 overflow-hidden"
      >
        <div style={{ width: 1080 * previewScale, height: 1350 * previewScale }} className="relative shadow-2xl bg-white border border-gray-300">
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 1080, height: 1350 }}>
            <CardRenderer data={data} rendererRef={rendererRef} onPhotoClick={(idx) => document.getElementById(`photo-upload-${idx}`)?.click()} />
          </div>
        </div>
      </div>

            {/* Result Export Modal */}
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

      {/* Crop Modal */}
      {isCropModalOpen && originalPhotos[currentCropIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
          <div className="bg-white rounded-lg p-4 max-w-full max-h-full flex flex-col items-center">
            <h3 className="font-bold text-lg mb-4 text-gray-800">이미지 노출 영역 지정 (크롭)</h3>
            <div className="overflow-auto max-h-[60vh] border border-gray-300 bg-gray-100 flex justify-center items-center">
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                aspect={getCropAspect()}
              >
                <img 
                  ref={imgRef}
                  src={originalPhotos[currentCropIndex]} 
                  alt="crop" 
                  className="max-w-full max-h-[60vh]"
                />
              </ReactCrop>
            </div>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setIsCropModalOpen(false)}
                className="px-6 py-2 rounded border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button 
                onClick={getCroppedImg}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
              >
                자르기 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}