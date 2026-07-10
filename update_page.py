import re

with open('app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CardRenderer props
content = content.replace("<CardRenderer data={data} rendererRef={rendererRef} />", "<CardRenderer data={data} rendererRef={rendererRef} onPhotoClick={(idx) => document.getElementById(`photo-upload-${idx}`)?.click()} />")

# 2. Fix handlePhotoUpload concurrency
old_upload = """  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
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
  };"""

new_upload = """  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>, index: number) => {
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
  };"""
content = content.replace(old_upload, new_upload)

# 3. Fix getCroppedImg to use uncropped image if crop not specified, and use functional setState
old_crop = """  const getCroppedImg = () => {
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
  };"""

new_crop = """  const getCroppedImg = () => {
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
  };"""
content = content.replace(old_crop, new_crop)

with open('app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("page.tsx updated.")
