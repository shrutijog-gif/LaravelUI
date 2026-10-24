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
