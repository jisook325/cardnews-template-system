import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Chunk 1: Imports
content = content.replace(
    "import React, { useState, useRef, ChangeEvent } from 'react';",
    "import React, { useState, useRef, ChangeEvent, useEffect } from 'react';\nimport ReactCrop, { type Crop } from 'react-image-crop';\nimport 'react-image-crop/dist/ReactCrop.css';"
)

# Chunk 2: State
old_state = """  const [data, setData] = useState<CardData>({
    title: 'title',
    bodyKr: '사진에 어울리는 본문을 입력해보세요.',
    meta: '닉네임 또는 날짜를 입력해보세요.',
    photos: [],
    templateId: 'P1_V1',
    fontFamily: 'Pretendard',
    themeId: 'white',
  });"""

new_state = old_state + """\n
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [crop, setCrop] = useState<Crop>();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

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
  }, [data, originalPhotos]);"""

content = content.replace(old_state, new_state)

# Chunk 3: handlePhotoUpload
old_upload = """  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>, index: number) => {
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
  };"""

new_upload = """  const resizeImage = (file: File): Promise<string> => {
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
      const newOrig = [...originalPhotos];
      newOrig[index] = resized;
      setOriginalPhotos(newOrig);
      setCurrentCropIndex(index);
      setIsCropModalOpen(true);
      setCrop(undefined);
    }
  };

  const getCroppedImg = () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      setIsCropModalOpen(false);
      return;
    }
    const canvas = document.createElement('canvas');
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
    const newPhotos = [...data.photos];
    newPhotos[currentCropIndex] = base64Image;
    setData({ ...data, photos: newPhotos });
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
  };"""

content = content.replace(old_upload, new_upload)

# Chunk 4: Photo Preview
old_preview = """                {data.photos[i] && (
                  <div className="w-10 h-10 rounded overflow-hidden border">
                    <img src={data.photos[i]} className="w-full h-full object-cover" alt="preview" />
                  </div>
                )}"""

new_preview = """                {data.photos[i] && (
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
                )}"""

content = content.replace(old_preview, new_preview)

# Chunk 5: Modal UI
old_modal_anchor = """      </div>
    </div>
  );
}"""

new_modal_anchor = """      </div>

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
}"""

content = content.replace(old_modal_anchor, new_modal_anchor)

with open('app/page.tsx', 'w') as f:
    f.write(content)

print("Modification complete.")
