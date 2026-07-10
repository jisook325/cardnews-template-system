import { CardData, themes } from '@/components/CardRenderer';

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderMultilineSvgText(
  text: string,
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  fontWeight: string | number,
  fillColor: string,
  fontFamily: string,
  maxLines: number = 10
): { svg: string; linesDrawn: number } {
  if (!text) return { svg: '', linesDrawn: 0 };

  // Split text by lines
  const rawLines = text.split('\n');
  const lines: string[] = [];
  
  // Simple word wrapping approx for SVG (assuming ~fontSize*0.95 px per Kr char average)
  const maxCharsPerLine = Math.floor((1010 - 32) / (fontSize * 0.95));
  
  for (const para of rawLines) {
    if (para.length <= maxCharsPerLine) {
      lines.push(para);
    } else {
      let currentLine = '';
      for (let i = 0; i < para.length; i++) {
        const char = para[i];
        if ((currentLine + char).length > maxCharsPerLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine += char;
        }
      }
      if (currentLine) lines.push(currentLine);
    }
  }

  const clampedLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && clampedLines.length > 0) {
    clampedLines[clampedLines.length - 1] = clampedLines[clampedLines.length - 1].slice(0, -2) + '...';
  }

  const tspans = clampedLines.map((line, idx) => {
    const dy = idx === 0 ? 0 : lineHeight;
    return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
  }).join('\n    ');

  const svg = `<text x="${x}" y="${y}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fillColor}">
    ${tspans}
  </text>`;

  return { svg, linesDrawn: clampedLines.length };
}

function renderPhotoSlot(
  slotId: string,
  photoUrl: string | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  placeholderText: string = '사진'
): string {
  const defs = `<clipPath id="${slotId}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="0" /></clipPath>`;
  const bgRect = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#E5E7EB" />`;
  
  if (photoUrl) {
    const img = `<image href="${escapeXml(photoUrl)}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${slotId})" />`;
    return `${defs}\n  ${bgRect}\n  ${img}`;
  } else {
    const placeholder = `<text x="${x + w / 2}" y="${y + h / 2}" font-family="sans-serif" font-size="48" fill="#9CA3AF" text-anchor="middle" dominant-baseline="central">${placeholderText}</text>`;
    return `${bgRect}\n  ${placeholder}`;
  }
}

export function generateCardSvg(data: CardData): string {
  const theme = themes[data.themeId || 'white'] || themes.white;
  const fontFamily = data.fontFamily || 'Pretendard';
  const imgs = data.photos || [];

  let elements: string[] = [];

  if (data.templateId === 'P0') {
    const titleRes = renderMultilineSvgText(data.title, 51, 51 + 56, 64, 76, 700, theme.primaryTextColor, fontFamily, 5);
    elements.push(titleRes.svg);

    const bodyY = 51 + Math.max(1, titleRes.linesDrawn) * 76 + 48 + 36;
    const bodyRes = renderMultilineSvgText(data.bodyKr, 51, bodyY, 40, 64, 400, theme.secondaryTextColor, fontFamily, 12);
    elements.push(bodyRes.svg);

    const metaSvg = `<text x="51" y="${1350 - 35 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="28" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`;
    elements.push(metaSvg);
  } 
  else if (data.templateId === 'P1_V1') {
    elements.push(renderPhotoSlot('clip-p1v1-0', imgs[0], 35, 35, 768, 1024, '사진 1'));
    
    elements.push(renderMultilineSvgText(data.title, 51, 1084 + 56, 56, 67, 700, theme.primaryTextColor, fontFamily, 1).svg);
    // Body: increased from +16+36 to +72+24 to match screen spacious mb-[16px]
    elements.push(renderMultilineSvgText(data.bodyKr, 51, 1084 + 72 + 24 + 28, 36, 50, 400, theme.secondaryTextColor, fontFamily, 2).svg);
    
    elements.push(`<text x="51" y="${1084 + 230 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="28" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`);
  } 
  else if (data.templateId === 'P1_V2') {
    elements.push(renderPhotoSlot('clip-p1v2-0', imgs[0], 35, 35, 1010, 450, '사진 1'));

    const titleRes = renderMultilineSvgText(data.title, 51, 510 + 56, 64, 76, 700, theme.primaryTextColor, fontFamily, 3);
    elements.push(titleRes.svg);

    const bodyY = 510 + Math.max(1, titleRes.linesDrawn) * 76 + 34 + 36;
    elements.push(renderMultilineSvgText(data.bodyKr, 51, bodyY, 40, 64, 400, theme.secondaryTextColor, fontFamily, 10).svg);

    elements.push(`<text x="51" y="${510 + 804 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="28" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`);
  } 
  else if (data.templateId === 'P2') {
    elements.push(renderPhotoSlot('clip-p2-0', imgs[0], 35, 35, 1010, 450, '사진 1'));
    elements.push(renderPhotoSlot('clip-p2-1', imgs[1], 35, 510, 1010, 445, '사진 2'));

    elements.push(renderMultilineSvgText(data.title, 51, 980 + 56, 56, 67, 700, theme.primaryTextColor, fontFamily, 1).svg);
    elements.push(renderMultilineSvgText(data.bodyKr, 51, 980 + 72 + 24 + 28, 36, 54, 400, theme.secondaryTextColor, fontFamily, 3).svg);

    elements.push(`<text x="51" y="${980 + 334 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="28" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`);
  } 
  else if (data.templateId === 'P3') {
    elements.push(renderPhotoSlot('clip-p3-0', imgs[0], 35, 35, 1010, 450, '사진 1'));
    elements.push(renderPhotoSlot('clip-p3-1', imgs[1], 35, 510, 495, 445, '사진 2'));
    elements.push(renderPhotoSlot('clip-p3-2', imgs[2], 550, 510, 495, 445, '사진 3'));

    elements.push(renderMultilineSvgText(data.title, 51, 980 + 56, 56, 67, 700, theme.primaryTextColor, fontFamily, 1).svg);
    elements.push(renderMultilineSvgText(data.bodyKr, 51, 980 + 72 + 24 + 28, 36, 54, 400, theme.secondaryTextColor, fontFamily, 3).svg);

    elements.push(`<text x="51" y="${980 + 334 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="28" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`);
  } 
  else if (data.templateId === 'P4') {
    elements.push(renderPhotoSlot('clip-p4-0', imgs[0], 35, 35, 495, 495, '사진 1'));
    elements.push(renderPhotoSlot('clip-p4-1', imgs[1], 550, 35, 495, 495, '사진 2'));
    elements.push(renderPhotoSlot('clip-p4-2', imgs[2], 35, 550, 495, 495, '사진 3'));
    elements.push(renderPhotoSlot('clip-p4-3', imgs[3], 550, 550, 495, 495, '사진 4'));

    elements.push(renderMultilineSvgText(data.title, 51, 1065 + 48, 48, 57, 700, theme.primaryTextColor, fontFamily, 1).svg);
    elements.push(renderMultilineSvgText(data.bodyKr, 51, 1065 + 60 + 22 + 24, 32, 44, 400, theme.secondaryTextColor, fontFamily, 2).svg);

    elements.push(`<text x="51" y="${1065 + 249 - 16}" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="24" font-weight="500" fill="${theme.metaTextColor}">${escapeXml(data.meta)}</text>`);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1080 1350" width="1080" height="1350">
  <!-- Background -->
  <rect x="0" y="0" width="1080" height="1350" fill="${theme.bgColor}" />
  
  <!-- Card Elements -->
  ${elements.join('\n  ')}
</svg>`;
}
