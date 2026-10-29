import fs from 'fs';
import path from 'path';

/**
 * Creates a valid multi-page PDF file with text content
 */
export function createSamplePdf(filePath: string, title: string, author: string, pagesCount = 10): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // We construct a valid PDF 1.4 document
  const objects: string[] = [];
  let currentOffset = 0;
  const offsets: number[] = [];

  function addObject(content: string): number {
    const objNum = objects.length + 1;
    objects.push(`${objNum} 0 obj\n${content}\nendobj\n`);
    return objNum;
  }

  // Object 1: Catalog
  // Object 2: Outlines
  // Object 3: Pages
  const catalogObjNum = 1;
  const outlinesObjNum = 2;
  const pagesObjNum = 3;
  const fontObjNum = 4;

  objects.push(''); // placeholder for 1
  objects.push(''); // placeholder for 2
  objects.push(''); // placeholder for 3
  objects.push(''); // placeholder for 4

  // Fonts
  objects[3] = `${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  const pageObjNums: number[] = [];

  for (let i = 1; i <= pagesCount; i++) {
    const isCover = i === 1;
    const isToc = i === 2;

    let textStream = '';
    if (isCover) {
      textStream = `BT
/F1 28 Tf
50 700 Td
(${title.replace(/[()\\]/g, '\\$&')}) Tj
/F1 16 Tf
0 -40 Td
(By: ${author.replace(/[()\\]/g, '\\$&')}) Tj
/F1 12 Tf
0 -30 Td
(Published exclusively on eBookHub - Learn Anywhere, Grow Everywhere) Tj
/F1 10 Tf
0 -500 Td
(This is an authorized personal copy licensed to the purchaser.) Tj
ET`;
    } else if (isToc) {
      textStream = `BT
/F1 20 Tf
50 720 Td
(Table of Contents) Tj
/F1 12 Tf
0 -40 Td
(Chapter 1: Foundations and Overview ..................... Page 3) Tj
0 -25 Td
(Chapter 2: Core Architecture & Setup .................... Page 4) Tj
0 -25 Td
(Chapter 3: Deep Dive & Practical Workflows .............. Page 5) Tj
0 -25 Td
(Chapter 4: Advanced Concepts & Optimization ............ Page 6) Tj
0 -25 Td
(Chapter 5: Real-World Case Studies & Exam Prep .......... Page 7) Tj
0 -25 Td
(Chapter 6: Comprehensive Review & Practice Questions ... Page 8) Tj
ET`;
    } else {
      textStream = `BT
/F1 18 Tf
50 720 Td
(${title} - Chapter ${i - 2}) Tj
/F1 12 Tf
0 -35 Td
(Page ${i} of ${pagesCount}) Tj
0 -30 Td
(Welcome to Chapter ${i - 2}. In this section we explore vital concepts in depth.) Tj
0 -25 Td
(Key takeaway 1: Understanding structural design and problem solving.) Tj
0 -20 Td
(Key takeaway 2: Practical implementation steps and step-by-step methodologies.) Tj
0 -20 Td
(Key takeaway 3: Real examination questions and performance tips.) Tj
0 -40 Td
(Practice Drill ${i - 2}: Solve 5 benchmark questions based on this module.) Tj
/F1 9 Tf
0 -450 Td
(eBookHub Digital Watermark: Protected Educational Content) Tj
ET`;
    }

    const streamLength = Buffer.byteLength(textStream, 'utf-8');
    const contentObj = addObject(`<< /Length ${streamLength} >>\nstream\n${textStream}\nendstream`);
    
    // Page obj
    const pageNum = objects.length + 1;
    const pageObj = `${pageNum} 0 obj\n<< /Type /Page /Parent ${pagesObjNum} 0 R /MediaBox [0 0 595 842] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${fontObjNum} 0 R >> >> >>\nendobj\n`;
    objects.push(pageObj);
    pageObjNums.push(pageNum);
  }

  // Catalog
  objects[0] = `${catalogObjNum} 0 obj\n<< /Type /Catalog /Pages ${pagesObjNum} 0 R >>\nendobj\n`;
  // Outlines
  objects[1] = `${outlinesObjNum} 0 obj\n<< /Type /Outlines /Count 0 >>\nendobj\n`;
  // Pages
  objects[2] = `${pagesObjNum} 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageObjNums.length} >>\nendobj\n`;

  // Assemble full PDF
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  currentOffset = Buffer.byteLength(pdf, 'latin1');

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    pdf += objects[i];
    currentOffset += Buffer.byteLength(objects[i], 'latin1');
  }

  const xrefOffset = currentOffset;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 0; i < offsets.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjNum} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  fs.writeFileSync(filePath, pdf, 'latin1');
}

/**
 * Creates SVG book cover
 */
export function createSvgCover(filePath: string, title: string, author: string, category: string, color = '#1E3A8A'): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 580" width="400" height="580">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Cover Background -->
  <rect width="400" height="580" rx="16" fill="url(#bg)" />
  <rect width="400" height="580" rx="16" fill="url(#grid)" />

  <!-- Spine 3D illusion -->
  <rect x="0" y="0" width="18" height="580" fill="rgba(0,0,0,0.25)" />
  <line x1="18" y1="0" x2="18" y2="580" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

  <!-- Badge / Category -->
  <rect x="40" y="45" width="130" height="28" rx="14" fill="#f59e0b" />
  <text x="105" y="63" font-family="Inter, sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    ${category.toUpperCase()}
  </text>

  <!-- Title -->
  <text x="40" y="140" font-family="Inter, sans-serif" font-size="30" font-weight="800" fill="#ffffff" width="320">
    <tspan x="40" dy="0">${title.slice(0, 20)}</tspan>
    <tspan x="40" dy="36">${title.slice(20, 45)}</tspan>
  </text>

  <!-- Subtitle ornament -->
  <line x1="40" y1="210" x2="160" y2="210" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />

  <!-- Center Graphic Symbol -->
  <circle cx="200" cy="330" r="70" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  <text x="200" y="348" font-family="Inter, sans-serif" font-size="52" fill="#ffffff" text-anchor="middle">&#128218;</text>

  <!-- Bottom Details -->
  <rect x="30" y="470" width="340" height="75" rx="10" fill="rgba(0,0,0,0.3)" />
  <text x="50" y="500" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">Written by</text>
  <text x="50" y="525" font-family="Inter, sans-serif" font-size="16" font-weight="bold" fill="#ffffff">${author}</text>
  <text x="350" y="525" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="#38bdf8" text-anchor="end">eBookHub Verified</text>
</svg>`;

  fs.writeFileSync(filePath, svg, 'utf-8');
}
