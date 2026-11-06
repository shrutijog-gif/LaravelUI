/**
 * Utility functions for handling local PDF uploads, base64 data URLs, and opening documents.
 */

export const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].replace('data:', '') || 'application/pdf';
  const rawBase64 = parts[1] || '';
  const byteCharacters = atob(rawBase64);
  const byteArrays: Uint8Array[] = [];

  const sliceSize = 1024;
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays as any, { type: contentType });
};

/**
 * Opens any URL or base64 PDF Data URL in a new browser tab.
 * Uses Blob Object URLs for data: URLs to prevent Chromium top-frame navigation block.
 */
export const openFileInNewTab = (url?: string, fileName?: string): void => {
  if (!url || url.trim() === '' || url === '#') {
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank', 'noopener,noreferrer');
    return;
  }

  if (url.startsWith('data:')) {
    try {
      const blob = dataUrlToBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      // Revoke after 60s to free memory
      setTimeout(() => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 60000);

      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || 'document.pdf';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    } catch (e) {
      console.error('Error creating Blob from Data URL:', e);
    }
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Extracts visible text and clickable document link URL from a row record for document_link fields.
 */
export const getDocumentLinkInfo = (rowData: Record<string, any>, field: { name: string; label?: string }): { text: string; url: string } => {
  let text = '';
  let url = '';

  const rawVal = rowData[field.name];

  if (rawVal && typeof rawVal === 'object') {
    text = rawVal.text || rawVal.title || rawVal.label || '';
    url = rawVal.url || rawVal.link || rawVal.fileUrl || '';
  } else if (typeof rawVal === 'string') {
    if (rawVal.startsWith('http://') || rawVal.startsWith('https://') || rawVal.startsWith('data:') || rawVal.toLowerCase().endsWith('.pdf') || rawVal.includes('.pdf?')) {
      url = rawVal;
      text = rowData[`${field.name}_title`] || rowData[`${field.name}_text`] || rowData[`${field.name}_label`] || rowData[`${field.name}_filename`] || rowData.title || '';
    } else {
      text = rawVal;
      url = rowData[`${field.name}_url`] || rowData[`${field.name}_link`] || rowData.fileUrl || rowData.pdf_url || '';
    }
  }

  if (!text) {
    text = rowData[`${field.name}_title`] || rowData[`${field.name}_text`] || rowData[`${field.name}_label`] || rowData.title || rowData[`${field.name}_filename`] || field.label || 'View Document';
  }

  if (!url) {
    url = rowData[`${field.name}_url`] || rowData.fileUrl || rowData.pdf_url || rowData.file || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
  }

  return { text, url };
};

export interface CompiledIndexPdfDocItem {
  id?: string;
  title: string;
  fileName: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  fileUrl?: string;
}

export interface CompiledIndexPdfOptions {
  cycleTitle: string;
  criterionCode: string;
  keyIndicatorCode: string;
  metricCode: string;
  metricName: string;
  compiledFileName: string;
  documents: CompiledIndexPdfDocItem[];
}

const escapePdfText = (str: string): string =>
  (str || '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const truncateText = (str: string, maxLen: number): string => {
  const clean = (str || '').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 3) + '...' : clean;
};

/**
 * Generates a real, lightweight (< 50 KB) NAAC SSR Index PDF containing a structured
 * table of documents with clickable PDF hyperlink annotations (/Subtype /Link /URI)
 * pointing to each individual PDF file, matching how colleges bypass NAAC's 5 MB upload cap.
 */
export const generateCompiledNaacIndexPdfDataUrl = (
  options: CompiledIndexPdfOptions
): string => {
  const {
    cycleTitle,
    criterionCode,
    keyIndicatorCode,
    metricCode,
    metricName,
    compiledFileName,
    documents,
  } = options;

  const lines: string[] = [];

  // Header Banner (Navy Blue #0f2748)
  lines.push('0.059 0.153 0.282 rg');
  lines.push('40 750 515 58 re f');

  // Header Text (White)
  lines.push('1 1 1 rg');
  lines.push('BT /F2 13 Tf 54 785 Td (NAAC SSR COMPILED EVIDENCE INDEX & DOCUMENT LINKS) Tj ET');
  lines.push(
    `BT /F1 9 Tf 54 769 Td (${escapePdfText(
      `${cycleTitle}   |   ${criterionCode}   |   KI ${keyIndicatorCode}   |   Metric ${metricCode}`
    )}) Tj ET`
  );
  lines.push(
    `BT /F1 8 Tf 54 756 Td (${escapePdfText(
      `Compiled Index File: ${compiledFileName}`
    )}) Tj ET`
  );

  // Metric Info Box (Light Slate #f8fafc with border #cbd5e1)
  lines.push('0.973 0.980 0.988 rg');
  lines.push('40 692 515 48 re f');
  lines.push('0.796 0.835 0.882 RG 0.8 w');
  lines.push('40 692 515 48 re S');

  lines.push('0.059 0.153 0.282 rg');
  lines.push(
    `BT /F2 10 Tf 50 723 Td (${escapePdfText(
      `${criterionCode}  >  Key Indicator ${keyIndicatorCode}  >  Metric ${metricCode}`
    )}) Tj ET`
  );
  lines.push('0.20 0.25 0.33 rg');
  lines.push(
    `BT /F1 9 Tf 50 709 Td (${escapePdfText(
      truncateText(metricName || `Metric ${metricCode} Supporting Evidence`, 92)
    )}) Tj ET`
  );
  lines.push('0.39 0.45 0.55 rg');
  lines.push(
    `BT /F1 8 Tf 50 697 Td (${escapePdfText(
      `Total Linked Evidence Files: ${documents.length}   |   Generated on: ${
        new Date().toISOString().split('T')[0]
      }`
    )}) Tj ET`
  );

  // Single-Column Table Header Bar
  const tableTopY = 660;
  lines.push('0.925 0.941 0.961 rg');
  lines.push(`40 ${tableTopY} 515 22 re f`);
  lines.push('0.796 0.835 0.882 RG 0.8 w');
  lines.push(`40 ${tableTopY} 515 22 re S`);

  lines.push('0.059 0.153 0.282 rg');
  lines.push(`BT /F2 8.5 Tf 48 ${tableTopY + 7} Td (SR.) Tj ET`);
  lines.push(`BT /F2 8.5 Tf 78 ${tableTopY + 7} Td (DOCUMENT TITLE \\(CLICK DOCUMENT NAME TO OPEN\\)) Tj ET`);

  // Document Rows + Track Link Annotations
  const linkAnnotations: Array<{
    rect: [number, number, number, number];
    url: string;
  }> = [];

  const rowHeight = 28;
  const maxRows = Math.min(documents.length, 18);

  for (let i = 0; i < maxRows; i++) {
    const doc = documents[i];
    const rowBottomY = tableTopY - (i + 1) * rowHeight;

    // Alternating subtle row fill
    if (i % 2 === 1) {
      lines.push('0.984 0.988 0.996 rg');
      lines.push(`40 ${rowBottomY} 515 ${rowHeight} re f`);
    }

    // Row border
    lines.push('0.886 0.910 0.941 RG 0.5 w');
    lines.push(`40 ${rowBottomY} 515 ${rowHeight} re S`);

    // Sr. No.
    lines.push('0.15 0.20 0.28 rg');
    lines.push(`BT /F2 9 Tf 50 ${rowBottomY + 10} Td (${i + 1}.) Tj ET`);

    // Resolve actual website link for this document
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'http://localhost:5173';
    const cleanSlug = encodeURIComponent(
      (doc.fileName || doc.title || `evidence-${i + 1}.pdf`).replace(/\s+/g, '_')
    );
    const localDocUrl = doc.id
      ? `${origin}/?naacDoc=${encodeURIComponent(doc.id)}&file=${cleanSlug}`
      : `${origin}/?file=${cleanSlug}`;
    const targetHref =
      doc.id || (doc.fileUrl && doc.fileUrl.startsWith('data:'))
        ? localDocUrl
        : doc.fileUrl && doc.fileUrl.startsWith('http')
        ? doc.fileUrl
        : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    // Document Title itself rendered as a clickable blue hyperlink (#1d4ed8)
    const displayTitle = truncateText(doc.fileName || doc.title || `Evidence_${i + 1}.pdf`, 82);
    lines.push('0.114 0.306 0.847 rg');
    lines.push(
      `BT /F2 9 Tf 78 ${rowBottomY + 10} Td (${escapePdfText(displayTitle)}) Tj ET`
    );

    // Subtle underline under the clickable document title
    const approxTextWidth = Math.min(450, Math.max(80, displayTitle.length * 4.8));
    lines.push('0.114 0.306 0.847 RG 0.5 w');
    lines.push(`78 ${rowBottomY + 8} ${approxTextWidth} 0 re S`);

    linkAnnotations.push({
      rect: [74, rowBottomY + 3, 545, rowBottomY + rowHeight - 3],
      url: targetHref,
    });
  }

  // Footer Verification Note
  const footerY = Math.max(55, tableTopY - maxRows * rowHeight - 38);
  lines.push('0.886 0.910 0.941 RG 0.8 w');
  lines.push(`40 ${footerY + 18} 515 0 re S`);
  lines.push('0.30 0.35 0.45 rg');
  lines.push(
    `BT /F2 8 Tf 40 ${footerY + 4} Td (Digitally Compiled by IQAC NAAC Evidence DMS - Click any document title above to open the PDF.) Tj ET`
  );

  const streamContent = lines.join('\n').replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '-');

  // Build PDF 1.4 Objects with Link Annotations
  const objects: string[] = [];
  // Obj 1: Catalog
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  // Obj 2: Pages
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');

  // Annotation object IDs start at 7
  const annotRefs = linkAnnotations.map((_, idx) => `${7 + idx} 0 R`).join(' ');

  // Obj 3: Page
  objects.push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R /Annots [${annotRefs}] >>\nendobj`
  );
  // Obj 4: Font Regular
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj'
  );
  // Obj 5: Font Bold
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj'
  );
  // Obj 6: Content Stream
  objects.push(
    `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`
  );

  // Obj 7..N: Link Annotation Objects
  linkAnnotations.forEach((annot, idx) => {
    const objId = 7 + idx;
    const [x1, y1, x2, y2] = annot.rect;
    objects.push(
      `${objId} 0 obj\n<< /Type /Annot /Subtype /Link /Rect [${x1} ${y1} ${x2} ${y2}] /Border [0 0 0] /A << /Type /Action /S /URI /URI (${escapePdfText(
        annot.url
      )}) >> >>\nendobj`
    );
  });

  // Assemble PDF with exact byte offsets in xref
  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];

  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  const safeAsciiPdf = pdf.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '-');
  return `data:application/pdf;base64,${btoa(safeAsciiPdf)}`;
};

