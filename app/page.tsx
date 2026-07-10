"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CardRenderer, { CardData, TemplateId, themes } from '@/components/CardRenderer';
import { generateCardImage } from '@/lib/canvasExport';
import { Download, ImageIcon } from 'lucide-react';
import JSZip from 'jszip';

export interface SlideItem {
  id: string;
  title: string;
  bodyKr: string;
  meta: string;
  photos: string[];
  originalPhotos: string[];
  templateId: TemplateId;
}

export default function Home() {
  const [slides, setSlides] = useState<SlideItem[]>([
    {
      id: 'slide-1',
      title: '',
      bodyKr: '사진에 어울리는 본문을 입력해보세요.',
      meta: '닉네임 또는 날짜를 입력해보세요.',
      photos: [],
      originalPhotos: [],
      templateId: 'P1_V1',
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [fontFamily, setFontFamily] = useState<string>('Pretendard');
  const [themeId, setThemeId] = useState<string>('white');

  const [crop, setCrop] = useState<Crop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.5);

  const [resultImages, setResultImages] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const rendererRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentSlideIndex] || slides[0] || {
    id: 'slide-default',
    title: '',
    bodyKr: '',
    meta: '',
    photos: [],
    originalPhotos: [],
    templateId: 'P1_V1'
  };

  const currentCardData: CardData = {
    title: currentSlide.title,
    bodyKr: currentSlide.bodyKr,
    meta: currentSlide.meta,
    photos: currentSlide.photos,
    templateId: currentSlide.templateId,
    fontFamily,
    themeId,
  };

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
        if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          setSlides(parsed.slides);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.themeId) setThemeId(parsed.themeId);
          if (typeof parsed.currentSlideIndex === 'number') {
            setCurrentSlideIndex(Math.min(parsed.currentSlideIndex, parsed.slides.length - 1));
          }
        } else if (parsed.data) {
          // Backward compatibility migration from single slide data
          setSlides([{
            id: 'slide-1',
            title: parsed.data.title || '',
            bodyKr: parsed.data.bodyKr || '',
            meta: parsed.data.meta || '',
            photos: parsed.data.photos || [],
            originalPhotos: parsed.originalPhotos || [],
            templateId: parsed.data.templateId || 'P1_V1',
          }]);
          if (parsed.data.fontFamily) setFontFamily(parsed.data.fontFamily);
          if (parsed.data.themeId) setThemeId(parsed.data.themeId);
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      (window as unknown as { __cardnewsGenerate?: typeof generateCardImage }).__cardnewsGenerate = generateCardImage;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cardnews_editor_data', JSON.stringify({
        slides,
        currentSlideIndex,
        fontFamily,
        themeId,
      }));
    } catch (e) {
      console.warn('Local storage save failed, possibly quota exceeded', e);
    }
  }, [slides, currentSlideIndex, fontFamily, themeId]);

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

  const updateCurrentSlide = (patch: Partial<SlideItem>) => {
    setSlides(prev => {
      const next = [...prev];
      if (!next[currentSlideIndex]) return prev;
      next[currentSlideIndex] = { ...next[currentSlideIndex], ...patch };
      return next;
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateCurrentSlide({ [e.target.name]: e.target.value });
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now()}`,
      title: '',
      bodyKr: '사진에 어울리는 본문을 입력해보세요.',
      meta: currentSlide.meta || '닉네임 또는 날짜를 입력해보세요.',
      photos: [],
      originalPhotos: [],
      templateId: currentSlide.templateId,
    };
    setSlides(prev => {
      const next = [...prev];
      next.splice(currentSlideIndex + 1, 0, newSlide);
      return next;
    });
    setCurrentSlideIndex(prev => prev + 1);
  };

  const handleDuplicateSlide = () => {
    const newSlide: SlideItem = {
      ...currentSlide,
      id: `slide-${Date.now()}`,
      photos: [...currentSlide.photos],
      originalPhotos: [...currentSlide.originalPhotos],
    };
    setSlides(prev => {
      const next = [...prev];
      next.splice(currentSlideIndex + 1, 0, newSlide);
      return next;
    });
    setCurrentSlideIndex(prev => prev + 1);
  };

  const handleDeleteSlide = () => {
    if (slides.length <= 1) {
      alert('최소 1장의 페이지는 유지해야 합니다.');
      return;
    }
    if (window.confirm(`${currentSlideIndex + 1}번 페이지를 삭제하시겠습니까?`)) {
      setSlides(prev => prev.filter((_, idx) => idx !== currentSlideIndex));
      setCurrentSlideIndex(prev => Math.max(0, prev - 1));
    }
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
      setSlides(prev => {
        const next = [...prev];
        if (!next[currentSlideIndex]) return prev;
        const cur = { ...next[currentSlideIndex] };
        const newOrig = [...cur.originalPhotos];
        newOrig[index] = resized;
        cur.originalPhotos = newOrig;
        next[currentSlideIndex] = cur;
        return next;
      });
      setCurrentCropIndex(index);
      setIsCropModalOpen(true);
      setCrop(undefined);
    }
  };

  const getCroppedImg = () => {
    if (!crop || !crop.width || !crop.height) {
      setSlides(prev => {
        const next = [...prev];
        if (!next[currentSlideIndex]) return prev;
        const cur = { ...next[currentSlideIndex] };
        const newPhotos = [...cur.photos];
        newPhotos[currentCropIndex] = cur.originalPhotos[currentCropIndex];
        cur.photos = newPhotos;
        next[currentSlideIndex] = cur;
        return next;
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
    setSlides(prev => {
      const next = [...prev];
      if (!next[currentSlideIndex]) return prev;
      const cur = { ...next[currentSlideIndex] };
      const newPhotos = [...cur.photos];
      newPhotos[currentCropIndex] = base64Image;
      cur.photos = newPhotos;
      next[currentSlideIndex] = cur;
      return next;
    });
    setIsCropModalOpen(false);
  };

  const getCropAspect = () => {
    switch (currentSlide.templateId) {
      case 'P1_V1': return 0.75;
      case 'P1_V2': return 2.24;
      case 'P2': return 2.24;
      case 'P3': return currentCropIndex === 0 ? 2.24 : 1.11;
      case 'P4': return 1.0;
      default: return 1;
    }
  };

  const handleReset = () => {
    if (window.confirm('작성 중인 모든 페이지와 사진이 초기화됩니다. 새로 만드시겠습니까?')) {
      localStorage.removeItem('cardnews_editor_data');
      setSlides([{
        id: `slide-${Date.now()}`,
        title: '',
        bodyKr: '',
        meta: '',
        photos: [],
        originalPhotos: [],
        templateId: 'P1_V1',
      }]);
      setCurrentSlideIndex(0);
      setFontFamily('Pretendard');
      setThemeId('white');
    }
  };

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  };

  const handleExportSingle = async () => {
    if (!rendererRef.current) return;
    try {
      setIsExporting(true);
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = await generateCardImage(currentCardData);
      if (isMobile()) {
        setResultImages([dataUrl]);
      } else {
        const link = document.createElement('a');
        link.download = `cardnews_${currentSlide.templateId}_page${currentSlideIndex + 1}_${Date.now()}.jpg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setIsExportingAll(true);
      await new Promise(r => setTimeout(r, 100));
      
      const generatedUrls: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const slideData: CardData = {
          ...slides[i],
          fontFamily,
          themeId,
        };
        const dataUrl = await generateCardImage(slideData);
        generatedUrls.push(dataUrl);
      }

      if (isMobile()) {
        // 모바일: 갤러리 모달 팝업으로 전체 노출
        setResultImages(generatedUrls);
      } else {
        // PC: JSZip 압축 다운로드
        const zip = new JSZip();
        for (let i = 0; i < generatedUrls.length; i++) {
          const base64Data = generatedUrls[i].replace(/^data:image\/jpeg;base64,/, "");
          zip.file(`cardnews_page_${i + 1}.jpg`, base64Data, { base64: true });
        }
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cardnews_set_${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Batch export failed:', err);
      alert('전체 이미지 저장에 실패했습니다.');
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleNativeShare = async () => {
    if (!resultImages.length) return;
    try {
      const files: File[] = [];
      for (let i = 0; i < resultImages.length; i++) {
        const fetchRes = await fetch(resultImages[i]);
        const blob = await fetchRes.blob();
        files.push(new File([blob], `cardnews_page_${i + 1}_${Date.now()}.jpg`, { type: 'image/jpeg' }));
      }
      
      if (navigator.canShare && navigator.canShare({ files })) {
        await navigator.share({
          files,
          title: '카드뉴스 전체 이미지 저장'
        });
      } else if (resultImages.length === 1) {
        const link = document.createElement('a');
        link.download = files[0].name;
        link.href = resultImages[0];
        link.click();
      } else {
        const zip = new JSZip();
        for (let i = 0; i < resultImages.length; i++) {
          const base64Data = resultImages[i].replace(/^data:image\/jpeg;base64,/, "");
          zip.file(`cardnews_page_${i + 1}.jpg`, base64Data, { base64: true });
        }
        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cardnews_set_${Date.now()}.zip`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.log('Share cancelled or failed', err);
    }
  };

  const getPhotoSlots = () => {
    switch (currentSlide.templateId) {
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
      <div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col gap-5 overflow-y-auto z-10 shadow-lg h-auto md:h-full">
        <div className="flex justify-between items-center pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-800">카드뉴스 에디터</h2>
          <div className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">
            {currentSlideIndex + 1} / {slides.length} 페이지
          </div>
        </div>

        {/* Page Navigation Bar */}
        <div className="flex flex-col gap-2.5 bg-gray-50 p-3.5 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700">
            <span>📄 페이지 선택 (`[1/N]`)</span>
            <div className="flex gap-1.5">
              <button
                onClick={handleDuplicateSlide}
                className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded text-gray-700 transition font-semibold shadow-xs"
                title="현재 페이지 복제"
              >
                📑 복제
              </button>
              <button
                onClick={handleDeleteSlide}
                disabled={slides.length <= 1}
                className={`px-2.5 py-1 border rounded transition font-semibold shadow-xs ${
                  slides.length <= 1 
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-white hover:bg-red-50 border-gray-300 text-red-600'
                }`}
                title="현재 페이지 삭제"
              >
                🗑️ 삭제
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs shrink-0 transition ${
                  currentSlideIndex === idx
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300 scale-105'
                    : 'bg-white hover:bg-gray-200 text-gray-700 border border-gray-300'
                }`}
              >
                {idx + 1} / {slides.length}
              </button>
            ))}
            <button
              onClick={handleAddSlide}
              className="px-3 py-1.5 rounded-md font-bold text-xs shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 transition flex items-center gap-1 shadow-xs"
              title="새 페이지 추가"
            >
              + 추가
            </button>
          </div>
        </div>

        {/* Advanced Design Settings (Global Theme/Font + Local Template) */}
        <div>
          <button
            data-testid="advanced-settings-toggle"
            onClick={() => setIsAdvancedSettingsOpen(!isAdvancedSettingsOpen)}
            className="w-full py-2.5 bg-gray-50 text-gray-800 font-bold rounded-md border border-gray-200 hover:bg-gray-100 transition flex justify-between items-center px-4 shadow-xs"
          >
            <span>🎨 디자인 설정 (템플릿, 글꼴, 테마)</span>
            <span>{isAdvancedSettingsOpen ? '▲' : '▼'}</span>
          </button>
        </div>
        
        {isAdvancedSettingsOpen && (
          <div className="flex flex-col gap-5 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-inner">
            {/* Page-specific: Template */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">📌 현재 페이지 템플릿 선택</label>
                <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">개별 설정</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    data-testid={`template-${tpl.id}`}
                    onClick={() => updateCurrentSlide({ templateId: tpl.id })}
                    className={`py-2 px-2 text-xs font-semibold rounded-md border text-center transition-colors ${
                      currentSlide.templateId === tpl.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold' 
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Global: Font Family */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">🌍 전체 슬라이드 글꼴 설정</label>
                <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">공통 설정</span>
              </div>
              <select
                name="fontFamily"
                value={fontFamily || 'Pretendard'}
                onChange={(e) => setFontFamily(e.target.value)}
                className="p-2 border rounded-md focus:outline-blue-500 bg-white font-medium"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Global: Theme Color */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-gray-700">🌍 전체 슬라이드 테마 컬러</label>
                <span className="text-[11px] text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded border border-purple-100">공통 설정</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    data-testid={`theme-${theme.id}`}
                    onClick={() => setThemeId(theme.id)}
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer ${
                      (themeId || 'white') === theme.id 
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

        {/* Text Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <label className="font-bold text-gray-700">✍️ 텍스트 입력 ({currentSlideIndex + 1}번 페이지)</label>
          </div>
          <div className="relative">
            <input 
              type="text" 
              name="title" 
              value={currentSlide.title} 
              onChange={handleTextChange} 
              placeholder="제목을 입력해보세요" 
              className="p-2.5 w-full pr-8 border rounded-md focus:outline-blue-500 bg-gray-50/50"
            />
            {currentSlide.title && (
              <button onClick={() => updateCurrentSlide({ title: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}
          </div>
          <div className="relative">
            <textarea 
              name="bodyKr" 
              value={currentSlide.bodyKr} 
              onChange={handleTextChange} 
              placeholder="사진에 어울리는 본문을 입력해보세요." 
              rows={4}
              className="p-2.5 w-full pr-8 border rounded-md resize-none focus:outline-blue-500 bg-gray-50/50"
            />
            {currentSlide.bodyKr && (
              <button onClick={() => updateCurrentSlide({ bodyKr: '' })} className="absolute right-3 top-2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}
          </div>
          <div className="relative">
            <input 
              type="text" 
              name="meta" 
              value={currentSlide.meta} 
              onChange={handleTextChange} 
              placeholder="닉네임 또는 날짜를 입력해보세요." 
              className="p-2.5 w-full pr-8 border rounded-md focus:outline-blue-500 bg-gray-50/50"
            />
            {currentSlide.meta && (
              <button onClick={() => updateCurrentSlide({ meta: '' })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 p-1 font-bold">✕</button>
            )}
          </div>
        </div>

        {/* Photo Uploads */}
        {getPhotoSlots() > 0 && (
          <div className="flex flex-col gap-3">
            <label className="font-bold text-gray-700">🖼️ 사진 업로드 ({currentSlideIndex + 1}번 페이지)</label>
            {Array.from({ length: getPhotoSlots() }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center p-3 border border-dashed border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-700 font-medium transition">
                  <ImageIcon size={16} className="mr-2 text-blue-600"/> 사진 {i + 1} 첨부
                  <input
                    id={`photo-upload-${i}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, i)}
                    className="hidden"
                  />
                </label>
                {currentSlide.photos[i] && (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded overflow-hidden border">
                      <img src={currentSlide.photos[i]} className="w-full h-full object-cover" alt="preview" />
                    </div>
                    {currentSlide.originalPhotos[i] && (
                      <button 
                        onClick={() => { setCurrentCropIndex(i); setIsCropModalOpen(true); setCrop(undefined); }}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-semibold"
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

        {/* Sticky Footer Buttons */}
        <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-auto z-20 border-t md:border-t-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              data-testid="export-single-button"
              onClick={handleExportSingle}
              disabled={isExporting || isExportingAll}
              className={`flex-1 ${isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'} text-white font-bold py-2.5 rounded-md flex justify-center items-center gap-1.5 transition text-xs`}
            >
              <Download size={15} /> {isExporting ? '생성 중...' : `현재 장 (${currentSlideIndex + 1}/${slides.length}) 저장`}
            </button>
            <button
              data-testid="export-all-button"
              onClick={handleExportAll}
              disabled={isExporting || isExportingAll}
              className={`flex-1 ${isExportingAll ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2.5 rounded-md flex justify-center items-center gap-1.5 transition text-xs shadow-sm`}
            >
              <Download size={15} /> {isExportingAll ? '압축 중...' : `전체 (${slides.length}장) 일괄 저장`}
            </button>
          </div>
          <button
            data-testid="reset-button"
            onClick={handleReset}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-1.5 rounded-md transition text-xs text-center"
          >
            초기화 (새로 만들기)
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
            <CardRenderer data={currentCardData} rendererRef={rendererRef} onPhotoClick={(idx) => document.getElementById(`photo-upload-${idx}`)?.click()} />
          </div>
        </div>
      </div>

      {/* Result Export Modal */}
      {resultImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4 flex-col overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-[480px] flex flex-col items-center shadow-2xl my-auto max-h-[90vh]">
            <h3 className="font-extrabold text-2xl mb-1 text-gray-900">
              ✨ {resultImages.length > 1 ? `총 ${resultImages.length}장 완성되었습니다!` : '완성되었습니다!'}
            </h3>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs text-center font-medium mb-4 w-full">
              {resultImages.length > 1 ? (
                <span>모바일에서는 각 사진을 <b>길게 눌러서</b> 개별 저장하거나,<br/>아래 <b>'기기에 일괄 저장/공유'</b> 버튼을 눌러주세요.</span>
              ) : (
                <span>모바일의 경우 이미지를 <b>길게 눌러서</b><br/>'사진 앱에 저장'을 선택해 주세요.</span>
              )}
            </div>
            
            <div className="w-full overflow-y-auto max-h-[50vh] flex flex-col gap-4 p-2 bg-gray-100 border rounded-lg shadow-inner">
              {resultImages.map((imgUrl, idx) => (
                <div key={idx} className="flex flex-col items-center bg-white p-2 rounded shadow">
                  <div className="text-xs font-bold text-gray-500 mb-1">{idx + 1} / {resultImages.length} 페이지</div>
                  <img src={imgUrl} alt={`카드뉴스 ${idx + 1} 페이지`} className="max-w-full max-h-[45vh] object-contain pointer-events-auto select-auto" style={{ WebkitTouchCallout: 'default' }} />
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 w-full mt-5 shrink-0">
              <button 
                onClick={() => setResultImages([])}
                className="flex-1 py-3 rounded-lg border-2 border-gray-300 font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                닫기
              </button>
              <button 
                onClick={handleNativeShare}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition"
              >
                <Download size={18} /> {resultImages.length > 1 ? '기기에 일괄 저장/공유' : '기기에 저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {isCropModalOpen && currentSlide.originalPhotos[currentCropIndex] && (
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
                  src={currentSlide.originalPhotos[currentCropIndex]} 
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
                data-testid="crop-confirm-button"
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