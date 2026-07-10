const fs = require('fs');

// --- 1. CardRenderer.tsx ---
let cardRenderer = fs.readFileSync('components/CardRenderer.tsx', 'utf-8');

// P0
cardRenderer = cardRenderer.replace(
  /className="absolute left-\[50px\] top-\[45px\] w-\[980px\] h-\[1260px\] flex flex-col justify-between p-\[40px\][^"]*"\n\s*style=\{\{ backgroundColor: "transparent", borderColor: theme\.borderThemeColor \}\}/,
  `className="absolute left-[35px] top-[35px] w-[1010px] h-[1280px] flex flex-col justify-between p-[16px]"\n          style={{ backgroundColor: "transparent" }}`
);

// P1_V1
cardRenderer = cardRenderer.replace(
  /className="absolute left-\[35px\] top-\[1084px\] w-\[1010px\] h-\[230px\] flex flex-col"/,
  `className="absolute left-[35px] top-[1084px] w-[1010px] h-[230px] flex flex-col p-[16px]"`
);

// P1_V2
cardRenderer = cardRenderer.replace(
  /className="absolute left-\[35px\] top-\[510px\] w-\[1010px\] h-\[804px\] flex flex-col p-\[40px\]"/,
  `className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[16px]"`
);

// Title mb for P1_V2
// P1_V2 title uses `mb-[20px]`. Let's change it to `mb-[16px]` for consistency.
cardRenderer = cardRenderer.replace(
  /className="text-\[64px\] font-bold leading-\[1\.2\] mb-\[20px\] break-keep"/,
  `className="text-[64px] font-bold leading-[1.2] mb-[16px] break-keep"`
);

fs.writeFileSync('components/CardRenderer.tsx', cardRenderer);

// --- 2. canvasExport.ts ---
let canvasExport = fs.readFileSync('lib/canvasExport.ts', 'utf-8');

// Remove P0 border correctly
canvasExport = canvasExport.replace(
  /ctx\.strokeStyle = theme\.borderThemeColor;\n\s*ctx\.lineWidth = 1;\n\s*ctx\.strokeRect\(50, 45, 980, 1260\);\n/g,
  ''
);

// Fix P1_V1 photo width from 768 to 1010
canvasExport = canvasExport.replace(
  /drawSlot\(imgs\[0\], 35, 35, 768, 1024, placeholderColor1, '사진 1'\);/,
  `drawSlot(imgs[0], 35, 35, 1010, 1024, placeholderColor1, '사진 1');`
);

// Update coordinates for P0
canvasExport = canvasExport.replace(
  /let y = drawTextKr\(ctx, data\.title, 90, 85, 900, 76, 5\);/,
  `let y = drawTextKr(ctx, data.title, 51, 51, 1010 - 32, 76, 5);`
);
canvasExport = canvasExport.replace(
  /drawTextKr\(ctx, data\.bodyKr, 90, y, 900, 64, 12\);/,
  `drawTextKr(ctx, data.bodyKr, 51, y, 1010 - 32, 64, 12);`
);
canvasExport = canvasExport.replace(
  /ctx\.fillText\(data\.meta, 90, 45 \+ 1260 - 40 - 28\);/,
  `ctx.fillText(data.meta, 51, 35 + 1280 - 16 - 28);`
);

// Update coordinates for P1_V1
canvasExport = canvasExport.replace(
  /drawTextKr\(ctx, data\.title, 35, 1084, 1010, 67, 1\);/,
  `drawTextKr(ctx, data.title, 35 + 16, 1084 + 16, 1010 - 32, 67, 1);`
);
canvasExport = canvasExport.replace(
  /drawTextKr\(ctx, data\.bodyKr, 35, 1084 \+ 56 \+ 16, 1010, 50, 2\);/,
  `drawTextKr(ctx, data.bodyKr, 35 + 16, 1084 + 16 + 56 + 16, 1010 - 32, 50, 2);`
);
canvasExport = canvasExport.replace(
  /ctx\.fillText\(data\.meta, 35, 1084 \+ 230 - 28\);/,
  `ctx.fillText(data.meta, 35 + 16, 1084 + 230 - 16 - 28);`
);

// Update coordinates for P1_V2
canvasExport = canvasExport.replace(
  /let y = drawTextKr\(ctx, data\.title, bx \+ 40, by \+ 40, 1010 - 80, 76, 3\);/,
  `let y = drawTextKr(ctx, data.title, bx + 16, by + 16, 1010 - 32, 76, 3);`
);
canvasExport = canvasExport.replace(
  /drawTextKr\(ctx, data\.bodyKr, bx \+ 40, y \+ 30, 1010 - 80, 64, 10\);/,
  `drawTextKr(ctx, data.bodyKr, bx + 16, y + 16, 1010 - 32, 64, 10);`
);
canvasExport = canvasExport.replace(
  /ctx\.fillText\(data\.meta, bx \+ 40, by \+ 804 - 40 - 28\);/,
  `ctx.fillText(data.meta, bx + 16, by + 804 - 16 - 28);`
);

fs.writeFileSync('lib/canvasExport.ts', canvasExport);

console.log("Margins updated");
