const fs = require('fs');

let content = fs.readFileSync('components/CardRenderer.tsx', 'utf-8');

content = content.replace(
  'rendererRef?: React.RefObject<HTMLDivElement | null>;\n}',
  'rendererRef?: React.RefObject<HTMLDivElement | null>;\n  onPhotoClick?: (index: number) => void;\n}'
);

content = content.replace(
  'export default function CardRenderer({ data, rendererRef }: Props) {',
  'export default function CardRenderer({ data, rendererRef, onPhotoClick }: Props) {'
);

// Fix P1_V2
content = content.replace(
  'className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[40px]"\n            style={{ backgroundColor: theme.boxBgColor }}',
  'className="absolute left-[35px] top-[510px] w-[1010px] h-[804px] flex flex-col p-[40px]"\n            style={{ backgroundColor: "transparent" }}'
);

// Add click handlers using a regex safely
content = content.replace(
  /(<div className="absolute[^"]+flex items-center justify-center overflow-hidden")>/g,
  (match, p1) => {
    // Add cursor-pointer and transition to className
    const newClass = p1.replace('overflow-hidden', 'overflow-hidden cursor-pointer transition hover:opacity-90');
    return newClass + '>';
  }
);

// Now we need to add the onClick handler depending on the index.
// We can use another regex to find {data.photos[INDEX] ? right after the div.
content = content.replace(
  /(<div className="absolute[^"]+cursor-pointer[^>]+>)\n\s*\{data\.photos\[(\d+)\] \?/g,
  (match, p1, index) => {
    // Insert onClick before the closing >
    const newDiv = p1.replace('className=', `onClick={() => onPhotoClick?.(${index})} className=`);
    return newDiv + `\n            {data.photos[${index}] ?`;
  }
);

fs.writeFileSync('components/CardRenderer.tsx', content);
console.log("Success");
