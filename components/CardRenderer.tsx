import React from 'react';

export type TemplateId = 'P0' | 'P1_V1' | 'P1_V2' | 'P2' | 'P3' | 'P4';

export interface ColorTheme {
  bgColor: string;
  boxBgColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  metaTextColor: string;
  borderThemeColor: string;
}

export const themes: Record<string, ColorTheme> = {
  white: {
    bgColor: '#F8F9FA',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#111827',
    secondaryTextColor: '#4B5563',
    metaTextColor: '#9CA3AF',
    borderThemeColor: '#E5E7EB',
  },
  pistachio: {
    bgColor: '#BADD7F',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#1E4620',
    secondaryTextColor: '#1E4620',
    metaTextColor: '#1E4620',
    borderThemeColor: '#1E4620',
  },
  columbia: {
    bgColor: '#B9D9EB',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#00693E',
    secondaryTextColor: '#00693E',
    metaTextColor: '#00693E',
    borderThemeColor: '#00693E',
  },
  dartmouth: {
    bgColor: '#00693E',
    boxBgColor: '#005C36',
    primaryTextColor: '#B9D9EB',
    secondaryTextColor: '#B9D9EB',
    metaTextColor: '#B9D9EB',
    borderThemeColor: '#B9D9EB',
  },
  electric: {
    bgColor: '#0029FF',
    boxBgColor: '#1A3EFF',
    primaryTextColor: '#FFFFFF',
    secondaryTextColor: '#E5E7EB',
    metaTextColor: '#D1D5DB',
    borderThemeColor: '#FFFFFF',
  },
  sunshine: {
    bgColor: '#F9E793',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#0029FF',
    secondaryTextColor: '#0029FF',
    metaTextColor: '#0029FF',
    borderThemeColor: '#0029FF',
  },
  periwinkle: {
    bgColor: '#AFC5FF',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#FD5959',
    secondaryTextColor: '#FD5959',
    metaTextColor: '#FD5959',
    borderThemeColor: '#FD5959',
  },
  lemon: {
    bgColor: '#FCFF82',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#FF9C6D',
    secondaryTextColor: '#FF9C6D',
    metaTextColor: '#FF9C6D',
    borderThemeColor: '#FF9C6D',
  },
  cantaloupe: {
    bgColor: '#FF9C6D',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#FCFF82',
    secondaryTextColor: '#FCFF82',
    metaTextColor: '#FCFF82',
    borderThemeColor: '#FCFF82',
  },
  watermelon: {
    bgColor: '#FD5959',
    boxBgColor: '#FFFFFF',
    primaryTextColor: '#AFC5FF',
    secondaryTextColor: '#AFC5FF',
    metaTextColor: '#AFC5FF',
    borderThemeColor: '#AFC5FF',
  },
};

export interface CardData {
  title: string;
  bodyKr: string;
  meta: string;
  photos: string[];
  templateId: TemplateId;
  fontFamily?: string;
  themeId?: string;
}

interface Props {
  data: CardData;
  rendererRef?: React.RefObject<HTMLDivElement | null>;
  onPhotoClick?: (index: number) => void;
}

export default function CardRenderer({ data, rendererRef, onPhotoClick }: Props) {
  const theme = themes[data.themeId || 'white'] || themes.white;

  const cardStyle = {
    width: 1080,
    height: 1350,
    fontFamily: data.fontFamily || 'Pretendard, sans-serif',
    backgroundColor: theme.bgColor,
  };

  return (
    <div
      ref={rendererRef}
      className="relative overflow-hidden"
      style={cardStyle}
    >
      {/* P0 Layout: 사진 없이 텍스트만 들어가는 형태 */}
      {data.templateId === 'P0' && (
        <div 
          className="absolute left-[35px] top-[35px] w-[1010px] h-[1280px] flex flex-col justify-between p-[16px]"
          style={{ backgroundColor: "transparent" }}
        >
          <div>
            <h1 
              className="text-[64px] font-bold leading-tight mb-[40px] whitespace-pre-wrap"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[40px] leading-[1.6] whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
          </div>
          <div 
            className="text-[28px] font-medium"
            style={{ color: theme.metaTextColor }}
          >
            {data.meta}
          </div>
        </div>
      )}

      {/* P1_V1 Layout: 사진 1장 비대칭 (좌측 쏠림) 구조 */}
      {data.templateId === 'P1_V1' && (
        <>
          <div onClick={() => onPhotoClick?.(0)} className="absolute left-[35px] top-[35px] w-[768px] h-[1024px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">사진 1</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[1084px] w-[1010px] h-[230px] flex flex-col p-[16px]">
            <h1 
              className="text-[56px] font-bold leading-tight truncate mb-[16px]"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[36px] leading-[1.4] line-clamp-2 whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
            <div 
              className="text-[28px] font-medium mt-auto"
              style={{ color: theme.metaTextColor }}
            >
              {data.meta}
            </div>
          </div>
        </>
      )}

      {/* P1_V2 Layout: 사진 1장 상단 꽉 찬 구조 */}
      {data.templateId === 'P1_V2' && (
        <>
          <div onClick={() => onPhotoClick?.(0)} className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">사진 1</span>
            )}
          </div>
          <div 
            className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[16px]"
            style={{ backgroundColor: "transparent" }}
          >
            <h1 
              className="text-[64px] font-bold leading-tight mb-[30px]"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[40px] leading-[1.6] whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
            <div 
              className="text-[28px] font-medium mt-auto"
              style={{ color: theme.metaTextColor }}
            >
              {data.meta}
            </div>
          </div>
        </>
      )}

      {/* P2 Layout: 사진 2장 상하 분할 */}
      {data.templateId === 'P2' && (
        <>
          <div onClick={() => onPhotoClick?.(0)} className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">사진 1</span>
            )}
          </div>
          <div onClick={() => onPhotoClick?.(1)} className="absolute left-[35px] top-[510px] w-[1010px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[1] ? (
              <img src={data.photos[1]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">사진 2</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[980px] w-[1010px] h-[334px] flex flex-col p-[16px]">
            <h1 
              className="text-[56px] font-bold leading-tight truncate mb-[16px]"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[36px] leading-[1.5] line-clamp-3 whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
            <div 
              className="text-[28px] font-medium mt-auto"
              style={{ color: theme.metaTextColor }}
            >
              {data.meta}
            </div>
          </div>
        </>
      )}

      {/* P3 Layout: 사진 3장 (1장 + 2장 격자) */}
      {data.templateId === 'P3' && (
        <>
          <div onClick={() => onPhotoClick?.(0)} className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">사진 1</span>
            )}
          </div>
          <div onClick={() => onPhotoClick?.(1)} className="absolute left-[35px] top-[510px] w-[495px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[1] ? (
              <img src={data.photos[1]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] text-[#9CA3AF]">사진 2</span>
            )}
          </div>
          <div onClick={() => onPhotoClick?.(2)} className="absolute left-[550px] top-[510px] w-[495px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[2] ? (
              <img src={data.photos[2]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] text-[#9CA3AF]">사진 3</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[980px] w-[1010px] h-[334px] flex flex-col p-[16px]">
            <h1 
              className="text-[56px] font-bold leading-tight truncate mb-[16px]"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[36px] leading-[1.5] line-clamp-3 whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
            <div 
              className="text-[28px] font-medium mt-auto"
              style={{ color: theme.metaTextColor }}
            >
              {data.meta}
            </div>
          </div>
        </>
      )}

      {/* P4 Layout: 사진 4장 2x2 격자 */}
      {data.templateId === 'P4' && (
        <>
          <div onClick={() => onPhotoClick?.(0)} className="absolute left-[35px] top-[35px] w-[495px] h-[495px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[0] ? <img src={data.photos[0]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">사진 1</span>}
          </div>
          <div onClick={() => onPhotoClick?.(1)} className="absolute left-[550px] top-[35px] w-[495px] h-[495px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[1] ? <img src={data.photos[1]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">사진 2</span>}
          </div>
          <div onClick={() => onPhotoClick?.(2)} className="absolute left-[35px] top-[550px] w-[495px] h-[495px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[2] ? <img src={data.photos[2]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">사진 3</span>}
          </div>
          <div onClick={() => onPhotoClick?.(3)} className="absolute left-[550px] top-[550px] w-[495px] h-[495px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden cursor-pointer transition hover:opacity-90">
            {data.photos[3] ? <img src={data.photos[3]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">사진 4</span>}
          </div>
          <div className="absolute left-[35px] top-[1065px] w-[1010px] h-[249px] flex flex-col p-[16px]">
            <h1 
              className="text-[48px] font-bold leading-tight truncate mb-[16px]"
              style={{ color: theme.primaryTextColor }}
            >
              {data.title}
            </h1>
            <p 
              className="text-[32px] leading-[1.4] line-clamp-2 whitespace-pre-wrap"
              style={{ color: theme.secondaryTextColor }}
            >
              {data.bodyKr}
            </p>
            <div 
              className="text-[24px] font-medium mt-auto"
              style={{ color: theme.metaTextColor }}
            >
              {data.meta}
            </div>
          </div>
        </>
      )}
    </div>
  );
}