"use client";

import React, { useState, useRef, ChangeEvent } from 'react';
import CardRenderer, { CardData, TemplateId } from '@/components/CardRenderer';
import { toPng } from 'html-to-image';
import { Download, ImageIcon } from 'lucide-react';

export default function Home() {
  const [data, setData] = useState<CardData>({
    title: 'title',
    bodyKr: '사진에 어울리는 본문을 입력해보세요.',
    meta: '닉네임 또는 날짜를 입력해보세요.',
    photos: [],
    templateId: 'P1_V1',
    fontFamily: 'Pretendard',
    themeId: 'white',
  });

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

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const newPhotos = [...data.photos];
          newPhotos[index] = ev.target.result as string;
          setData({ ...data, photos: newPhotos });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
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
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen bg-gray-100 md:overflow-hidden text-sm">
      {/* Sidebar / Editor */}
      <div className="w-full md:w-[420px] bg-white border-b md:border-b-0 md:border-r border-gray-200 p-6 flex flex-col gap-6 overflow-y-auto z-10 shadow-lg h-auto md:h-full">
        <h2 className="text-xl font-bold text-gray-800 pb-4 border-b">카드뉴스 에디터</h2>
        
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

        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">텍스트 입력</label>
          <input 
            type="text" 
            name="title" 
            value={data.title} 
            onChange={handleTextChange} 
            placeholder="title" 
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
                  <div className="w-10 h-10 rounded overflow-hidden border">
                    <img src={data.photos[i]} className="w-full h-full object-cover" alt="preview" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button 
          onClick={handleExport}
          className="mt-6 md:mt-auto bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-md flex justify-center items-center gap-2 transition shrink-0"
        >
          <Download size={18} /> PNG로 저장하기
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 relative min-h-[400px] md:min-h-0 overflow-auto">
        <div className="bg-gray-200 p-4 shadow-inner border border-gray-300 max-w-full overflow-auto">
          <div className="relative" style={{ width: 1080 * 0.5, height: 1350 * 0.5 }}>
            <div style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: 1080, height: 1350 }}>
              <CardRenderer data={data} rendererRef={rendererRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}