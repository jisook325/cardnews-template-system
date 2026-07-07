import { CardData, themes, ColorTheme, TemplateId } from '@/components/CardRenderer';

// Helper to draw image with object-cover semantics
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  
  let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
  
  if (imgRatio > targetRatio) {
    // Image is wider than target area (crop horizontally)
    srcW = img.height * targetRatio;
    srcX = (img.width - srcW) / 2;
  } else {
    // Image is taller than target area (crop vertically)
    srcH = img.width / targetRatio;
    srcY = (img.height - srcH) / 2;
  }
  
  ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
}

// Helper for multi-line text with line clamping
function drawTextKr(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  if (!text) return y;
  
  const paragraphs = text.split('\n');
  let currentY = y;
  let linesDrawn = 0;
  
  for (let p = 0; p < paragraphs.length; p++) {
    let line = '';
    const para = paragraphs[p];
    
    for (let i = 0; i < para.length; i++) {
      if (linesDrawn >= maxLines) return currentY;
      
      const char = para[i];
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        // We need to wrap
        if (linesDrawn === maxLines - 1 && i < para.length - 1) {
          // It's the last line allowed, add ellipsis
          let ellipsisLine = line;
          while (ctx.measureText(ellipsisLine + '...').width > maxWidth && ellipsisLine.length > 0) {
            ellipsisLine = ellipsisLine.slice(0, -1);
          }
          ctx.fillText(ellipsisLine + '...', x, currentY);
          linesDrawn++;
          return currentY + lineHeight;
        } else {
          ctx.fillText(line, x, currentY);
          line = char;
          currentY += lineHeight;
          linesDrawn++;
        }
      } else {
        line = testLine;
      }
    }
    
    if (linesDrawn < maxLines) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
      linesDrawn++;
    }
  }
  return currentY;
}

// Preload base64 image strings to HTMLImageElements
async function loadImages(base64Arr: string[]): Promise<(HTMLImageElement | null)[]> {
  return Promise.all(base64Arr.map(src => {
    if (!src) return Promise.resolve(null);
    return new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }));
}

export async function generateCardImage(data: CardData): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get 2D context");
  
  const theme = themes[data.themeId || 'white'] || themes.white;
  const fontFamily = data.fontFamily || 'Pretendard';
  
  // Base background
  ctx.fillStyle = theme.bgColor;
  ctx.fillRect(0, 0, 1080, 1350);
  
  // Load photos
  const imgs = await loadImages(data.photos);
  
  // Default placeholder gray
  const placeholderColor1 = '#E5E7EB';
  const placeholderColor2 = '#D1D5DB';
  
  const drawSlot = (img: HTMLImageElement | null, x: number, y: number, w: number, h: number, bg: string, text: string) => {
    if (img) {
      drawImageCover(ctx, img, x, y, w, h);
    } else {
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#9CA3AF';
      ctx.font = `48px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // adjust font size for smaller slots
      if (w < 500) ctx.font = `36px ${fontFamily}`;
      ctx.fillText(text, x + w / 2, y + h / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
    }
  };
  
  ctx.textBaseline = 'top';

  if (data.templateId === 'P0') {
    // P0 Layout
    ctx.fillStyle = theme.boxBgColor;
    ctx.fillRect(50, 45, 980, 1260);
    ctx.strokeStyle = theme.borderThemeColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(50, 45, 980, 1260);
    
    // Title
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 64px ${fontFamily}`;
    let y = drawTextKr(ctx, data.title, 90, 85, 900, 76, 5); // 76 roughly 64 * 1.2
    
    // Body
    y += 40;
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `40px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, 90, y, 900, 64, 12);
    
    // Meta (bottom anchored)
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 28px ${fontFamily}`;
    ctx.fillText(data.meta, 90, 45 + 1260 - 40 - 28);
  }
  else if (data.templateId === 'P1_V1') {
    drawSlot(imgs[0], 35, 35, 768, 1024, placeholderColor1, '사진 1');
    
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 56px ${fontFamily}`;
    drawTextKr(ctx, data.title, 35, 1084, 1010, 67, 1);
    
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `36px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, 35, 1084 + 56 + 16, 1010, 50, 2);
    
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 28px ${fontFamily}`;
    ctx.fillText(data.meta, 35, 1084 + 230 - 28);
  }
  else if (data.templateId === 'P1_V2') {
    drawSlot(imgs[0], 35, 35, 1010, 450, placeholderColor1, '사진 1');
    
    const bx = 35, by = 510;
    // Removed boxBgColor for P1_V2 to follow CSS inheritance (transparent)
    
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 64px ${fontFamily}`;
    let y = drawTextKr(ctx, data.title, bx + 40, by + 40, 1010 - 80, 76, 3);
    
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `40px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, bx + 40, y + 30, 1010 - 80, 64, 10);
    
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 28px ${fontFamily}`;
    ctx.fillText(data.meta, bx + 40, by + 804 - 40 - 28);
  }
  else if (data.templateId === 'P2') {
    drawSlot(imgs[0], 35, 35, 1010, 450, placeholderColor1, '사진 1');
    drawSlot(imgs[1], 35, 510, 1010, 445, placeholderColor2, '사진 2');
    
    const bx = 35, by = 980;
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 56px ${fontFamily}`;
    drawTextKr(ctx, data.title, bx + 16, by + 16, 1010 - 32, 67, 1);
    
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `36px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, bx + 16, by + 16 + 56 + 16, 1010 - 32, 54, 3);
    
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 28px ${fontFamily}`;
    ctx.fillText(data.meta, bx + 16, by + 334 - 16 - 28);
  }
  else if (data.templateId === 'P3') {
    drawSlot(imgs[0], 35, 35, 1010, 450, placeholderColor1, '사진 1');
    drawSlot(imgs[1], 35, 510, 495, 445, placeholderColor2, '사진 2');
    drawSlot(imgs[2], 550, 510, 495, 445, placeholderColor2, '사진 3');
    
    const bx = 35, by = 980;
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 56px ${fontFamily}`;
    drawTextKr(ctx, data.title, bx + 16, by + 16, 1010 - 32, 67, 1);
    
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `36px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, bx + 16, by + 16 + 56 + 16, 1010 - 32, 54, 3);
    
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 28px ${fontFamily}`;
    ctx.fillText(data.meta, bx + 16, by + 334 - 16 - 28);
  }
  else if (data.templateId === 'P4') {
    drawSlot(imgs[0], 35, 35, 495, 495, placeholderColor1, '사진 1');
    drawSlot(imgs[1], 550, 35, 495, 495, placeholderColor1, '사진 2');
    drawSlot(imgs[2], 35, 550, 495, 495, placeholderColor2, '사진 3');
    drawSlot(imgs[3], 550, 550, 495, 495, placeholderColor2, '사진 4');
    
    const bx = 35, by = 1065;
    ctx.fillStyle = theme.primaryTextColor;
    ctx.font = `bold 48px ${fontFamily}`;
    drawTextKr(ctx, data.title, bx + 16, by + 16, 1010 - 32, 57, 1);
    
    ctx.fillStyle = theme.secondaryTextColor;
    ctx.font = `32px ${fontFamily}`;
    drawTextKr(ctx, data.bodyKr, bx + 16, by + 16 + 48 + 16, 1010 - 32, 44, 2);
    
    ctx.fillStyle = theme.metaTextColor;
    ctx.font = `500 24px ${fontFamily}`;
    ctx.fillText(data.meta, bx + 16, by + 249 - 16 - 24);
  }
  
  return canvas.toDataURL('image/jpeg', 0.95);
}
