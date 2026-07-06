import React from 'react';

export type TemplateId = 'P0' | 'P1_V1' | 'P1_V2' | 'P2' | 'P3' | 'P4';

export interface CardData {
  title: string;
  bodyKr: string;
  meta: string;
  photos: string[];
  templateId: TemplateId;
  fontFamily?: string;
}

interface Props {
  data: CardData;
  rendererRef?: React.RefObject<HTMLDivElement | null>;
}

export default function CardRenderer({ data, rendererRef }: Props) {
  const cardStyle = {
    width: 1080,
    height: 1350,
    fontFamily: data.fontFamily || 'Pretendard, sans-serif'
  };

  return (
    <div
      ref={rendererRef}
      className="relative overflow-hidden bg-[#F8F9FA]"
      style={cardStyle}
    >
      {/* P0 Layout: 사진 없이 텍스트만 들어가는 형태 */}
      {data.templateId === 'P0' && (
        <div className="absolute left-[50px] top-[45px] w-[980px] h-[1260px] flex flex-col justify-between p-[40px] bg-white shadow-sm border border-gray-100">
          <div>
            <h1 className="text-[64px] font-bold text-[#111827] leading-tight mb-[40px] whitespace-pre-wrap">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[40px] text-[#4B5563] leading-[1.6] whitespace-pre-wrap">{data.bodyKr || '본문을 입력하세요'}</p>
          </div>
          <div className="text-[28px] text-[#9CA3AF] font-medium">{data.meta || '메타 정보'}</div>
        </div>
      )}

      {/* P1_V1 Layout: 사진 1장 비대칭 (좌측 쏠림) 구조 */}
      {data.templateId === 'P1_V1' && (
        <>
          <div className="absolute left-[35px] top-[35px] w-[768px] h-[1024px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">Photo 1</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[1084px] w-[1010px] h-[230px] flex flex-col">
            <h1 className="text-[56px] font-bold text-[#111827] leading-tight truncate mb-[16px]">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[36px] text-[#4B5563] leading-[1.4] line-clamp-2">{data.bodyKr || '본문을 입력하세요'}</p>
            <div className="text-[28px] text-[#9CA3AF] font-medium mt-auto">{data.meta || '메타 정보'}</div>
          </div>
        </>
      )}

      {/* P1_V2 Layout: 사진 1장 상단 꽉 찬 구조 */}
      {data.templateId === 'P1_V2' && (
        <>
          <div className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">Photo 1</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[40px] bg-white">
            <h1 className="text-[64px] font-bold text-[#111827] leading-tight mb-[30px]">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[40px] text-[#4B5563] leading-[1.6] whitespace-pre-wrap">{data.bodyKr || '본문을 입력하세요'}</p>
            <div className="text-[28px] text-[#9CA3AF] font-medium mt-auto">{data.meta || '메타 정보'}</div>
          </div>
        </>
      )}

      {/* P2 Layout: 사진 2장 상하 분할 */}
      {data.templateId === 'P2' && (
        <>
          <div className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">Photo 1</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[510px] w-[1010px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden">
            {data.photos[1] ? (
              <img src={data.photos[1]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">Photo 2</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[980px] w-[1010px] h-[334px] flex flex-col p-[16px]">
            <h1 className="text-[56px] font-bold text-[#111827] leading-tight truncate mb-[16px]">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[36px] text-[#4B5563] leading-[1.5] line-clamp-3">{data.bodyKr || '본문을 입력하세요'}</p>
            <div className="text-[28px] text-[#9CA3AF] font-medium mt-auto">{data.meta || '메타 정보'}</div>
          </div>
        </>
      )}

      {/* P3 Layout: 사진 3장 (1장 + 2장 격자) */}
      {data.templateId === 'P3' && (
        <>
          <div className="absolute left-[35px] top-[35px] w-[1010px] h-[450px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[0] ? (
              <img src={data.photos[0]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[48px] text-[#9CA3AF]">Photo 1</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[510px] w-[495px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden">
            {data.photos[1] ? (
              <img src={data.photos[1]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] text-[#9CA3AF]">Photo 2</span>
            )}
          </div>
          <div className="absolute left-[550px] top-[510px] w-[495px] h-[445px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden">
            {data.photos[2] ? (
              <img src={data.photos[2]} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[36px] text-[#9CA3AF]">Photo 3</span>
            )}
          </div>
          <div className="absolute left-[35px] top-[980px] w-[1010px] h-[334px] flex flex-col p-[16px]">
            <h1 className="text-[56px] font-bold text-[#111827] leading-tight truncate mb-[16px]">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[36px] text-[#4B5563] leading-[1.5] line-clamp-3">{data.bodyKr || '본문을 입력하세요'}</p>
            <div className="text-[28px] text-[#9CA3AF] font-medium mt-auto">{data.meta || '메타 정보'}</div>
          </div>
        </>
      )}

      {/* P4 Layout: 사진 4장 2x2 격자 */}
      {data.templateId === 'P4' && (
        <>
          <div className="absolute left-[35px] top-[35px] w-[495px] h-[495px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[0] ? <img src={data.photos[0]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">Photo 1</span>}
          </div>
          <div className="absolute left-[550px] top-[35px] w-[495px] h-[495px] bg-[#E5E7EB] flex items-center justify-center overflow-hidden">
            {data.photos[1] ? <img src={data.photos[1]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">Photo 2</span>}
          </div>
          <div className="absolute left-[35px] top-[550px] w-[495px] h-[495px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden">
            {data.photos[2] ? <img src={data.photos[2]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">Photo 3</span>}
          </div>
          <div className="absolute left-[550px] top-[550px] w-[495px] h-[495px] bg-[#D1D5DB] flex items-center justify-center overflow-hidden">
            {data.photos[3] ? <img src={data.photos[3]} className="w-full h-full object-cover" /> : <span className="text-[36px] text-[#9CA3AF]">Photo 4</span>}
          </div>
          <div className="absolute left-[35px] top-[1065px] w-[1010px] h-[249px] flex flex-col p-[16px]">
            <h1 className="text-[48px] font-bold text-[#111827] leading-tight truncate mb-[16px]">{data.title || '제목을 입력하세요'}</h1>
            <p className="text-[32px] text-[#4B5563] leading-[1.4] line-clamp-2">{data.bodyKr || '본문을 입력하세요'}</p>
            <div className="text-[24px] text-[#9CA3AF] font-medium mt-auto">{data.meta || '메타 정보'}</div>
          </div>
        </>
      )}
    </div>
  );
}