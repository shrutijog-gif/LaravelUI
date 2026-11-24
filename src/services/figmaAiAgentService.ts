// Figma & Vision AI Agent Service: Ingests Figma Files & Screenshots, Generates Pixel-Perfect CMS Header, Footer & Global CSS using OpenAI (GPT-4o)
import { saveTenantTemplateData, getTenantTemplateData, TenantTemplateData } from '../data/tenantTemplateStorage';
import { addFileToFolder } from '../data/fileManagerData';

export interface FigmaAgentProgress {
  step: number;
  totalSteps: number;
  message: string;
}

export interface FigmaAgentResult {
  success: boolean;
  fileTitle?: string;
  headerHtml?: string;
  footerHtml?: string;
  customCss?: string;
  extractedAssetsCount?: number;
  extractedColors?: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  error?: string;
}

// 1. Helper to extract Figma fileKey and optional nodeId from any Figma URL
export const parseFigmaUrl = (url: string): { fileKey: string | null; nodeId: string | null } => {
  if (!url) return { fileKey: null, nodeId: null };

  const keyMatch = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  const fileKey = keyMatch ? keyMatch[1] : null;

  const nodeMatch = url.match(/node-id=([a-zA-Z0-9%:-]+)/);
  let nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]).replace(/-/g, ':') : null;

  return { fileKey, nodeId };
};

// 2. Helper to crop emblems & logos from design screenshot using HTML5 Canvas
export const extractLogosFromImage = async (dataUrl: string): Promise<{
  leftLogoUrl?: string;
  rightLogoUrl?: string;
}> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const results: { leftLogoUrl?: string; rightLogoUrl?: string } = {};

        // Crop Left College Crest / Emblem (Left 2% to 22%, Middle 15% to 85%)
        const cropW = Math.max(80, Math.floor(img.width * 0.18));
        const cropH = Math.max(80, Math.floor(img.height * 0.65));
        const cropX = Math.max(0, Math.floor(img.width * 0.03));
        const cropY = Math.max(0, Math.floor(img.height * 0.16));

        const canvas1 = document.createElement('canvas');
        canvas1.width = cropW;
        canvas1.height = cropH;
        const ctx1 = canvas1.getContext('2d');
        if (ctx1) {
          ctx1.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          results.leftLogoUrl = canvas1.toDataURL('image/png');
        }

        // Crop Right Trust Seal / NAAC Emblem (Right 78% to 98%, Middle 15% to 85%)
        const rightX = Math.max(0, Math.floor(img.width * 0.79));
        const canvas2 = document.createElement('canvas');
        canvas2.width = cropW;
        canvas2.height = cropH;
        const ctx2 = canvas2.getContext('2d');
        if (ctx2) {
          ctx2.drawImage(img, rightX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          results.rightLogoUrl = canvas2.toDataURL('image/png');
        }

        resolve(results);
      };
      img.onerror = () => resolve({});
      img.src = dataUrl;
    } catch (e) {
      resolve({});
    }
  });
};

// 3. Helper to traverse Figma JSON tree and extract clean text, typography, colors and layout geometry
export const extractFigmaNodeSummary = (
  node: any, 
  depth = 0, 
  maxDepth = 8, 
  collectedTexts: string[] = []
): any => {
  if (!node || depth > maxDepth) return null;

  const result: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Text content & typography
  if (node.characters) {
    result.text = node.characters.trim();
    if (result.text && !collectedTexts.includes(result.text)) {
      collectedTexts.push(result.text);
    }
  }

  if (node.style) {
    result.typography = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      letterSpacing: node.style.letterSpacing,
      textAlign: node.style.textAlignHorizontal
    };
  }

  // Layout mode & spacing
  if (node.layoutMode) {
    result.layout = {
      mode: node.layoutMode,
      gap: node.itemSpacing,
      padding: {
        top: node.paddingTop,
        right: node.paddingRight,
        bottom: node.paddingBottom,
        left: node.paddingLeft
      }
    };
  }

  // Fills & Colors
  if (node.fills && Array.isArray(node.fills)) {
    const solidFills = node.fills.filter((f: any) => f.type === 'SOLID' && f.color);
    if (solidFills.length > 0) {
      result.colors = solidFills.map((f: any) => {
        const r = Math.round((f.color.r || 0) * 255);
        const g = Math.round((f.color.g || 0) * 255);
        const b = Math.round((f.color.b || 0) * 255);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      });
    }
  }

  // Children traversal (preserve full navigation and bar structures)
  if (node.children && Array.isArray(node.children) && node.children.length > 0) {
    result.children = node.children
      .slice(0, 40)
      .map((child: any) => extractFigmaNodeSummary(child, depth + 1, maxDepth, collectedTexts))
      .filter(Boolean);
  }

  return result;
};

// 4. Main Agent Execution Function
export const runFigmaAiAgent = async (params: {
  figmaUrl?: string;
  figmaToken?: string;
  openaiKey: string;
  tenantId: string;
  imageScreenshot?: string;
  targetScope?: 'both' | 'header' | 'footer';
  onProgress?: (progress: FigmaAgentProgress) => void;
}): Promise<FigmaAgentResult> => {
  const { 
    figmaUrl = '', 
    figmaToken = '', 
    openaiKey, 
    tenantId, 
    imageScreenshot, 
    targetScope = 'both', 
    onProgress 
  } = params;

  const updateProgress = (step: number, message: string) => {
    if (onProgress) {
      onProgress({ step, totalSteps: 4, message });
    }
  };

  try {
    if (!figmaUrl.trim() && !imageScreenshot) {
      throw new Error('Please provide either a Figma URL or upload a design screenshot to analyze.');
    }

    if (!openaiKey || !openaiKey.trim()) {
      throw new Error('OpenAI API Key is missing. Please provide your OpenAI Key (sk-...).');
    }

    let fileTitle = 'Design Mockup';
    let headerFrame: any = null;
    let footerFrame: any = null;
    let headerSummary: any = null;
    let footerSummary: any = null;
    const detectedColors: string[] = [];
    const collectedTexts: string[] = [];
    let figmaRenderedImageUrl: string | null = null;
    let extractedAssetsCount = 0;

    // ----------------------------------------------------
    // STEP 1: ASSET EXTRACTION & CATALOGING TO FILE MANAGER
    // ----------------------------------------------------
    updateProgress(1, 'Extracting images and cataloging into File Manager (/website-assets)...');

    let primaryEmblemUrl = '';
    let secondarySealUrl = '';

    if (imageScreenshot) {
      const cropped = await extractLogosFromImage(imageScreenshot);
      if (cropped.leftLogoUrl) {
        const file1 = addFileToFolder({
          name: 'college_emblem_logo.png',
          folder: 'website-assets',
          url: cropped.leftLogoUrl,
          size: '32 KB',
          type: 'image',
          dimensions: '90 x 90'
        });
        primaryEmblemUrl = file1.url;
        extractedAssetsCount++;
      }
      if (cropped.rightLogoUrl) {
        const file2 = addFileToFolder({
          name: 'trust_seal_emblem.png',
          folder: 'website-assets',
          url: cropped.rightLogoUrl,
          size: '28 KB',
          type: 'image',
          dimensions: '90 x 90'
        });
        secondarySealUrl = file2.url;
        extractedAssetsCount++;
      }
    }

    // ----------------------------------------------------
    // STEP 2: FIGMA API INGESTION (IF FIGMA URL PROVIDED)
    // ----------------------------------------------------
    if (figmaUrl.trim()) {
      updateProgress(2, 'Connecting to Figma API and retrieving node tree...');
      const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

      if (!fileKey) {
        throw new Error('Invalid Figma URL format. Expected: https://www.figma.com/design/:fileKey/:name');
      }

      if (!figmaToken || !figmaToken.trim()) {
        throw new Error('Figma Access Token is required to fetch Figma files. Please enter your Figma token.');
      }

      const fetchHeaders = { 'X-Figma-Token': figmaToken.trim() };

      // Case A: Specific Node ID provided in the URL
      if (nodeId) {
        try {
          const nodeProxy = `/api/figma/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=6`;
          const res = await fetch(nodeProxy, { headers: fetchHeaders });
          if (res.ok) {
            const data = await res.json();
            if (data.nodes && data.nodes[nodeId]) {
              headerFrame = data.nodes[nodeId].document;
              fileTitle = data.name || 'Figma Frame';
            }
          }
        } catch (e) {
          try {
            const directUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}&depth=6`;
            const res2 = await fetch(directUrl, { headers: fetchHeaders });
            if (res2.ok) {
              const data2 = await res2.json();
              if (data2.nodes && data2.nodes[nodeId]) {
                headerFrame = data2.nodes[nodeId].document;
              }
            }
          } catch (err) {}
        }
      }

      // Case B: Fetch Full Document (depth 6 to get all sub-layers & texts)
      let figmaData: any = null;
      if (!headerFrame) {
        try {
          const proxyUrl = `/api/figma/v1/files/${fileKey}?depth=6`;
          const res = await fetch(proxyUrl, { headers: fetchHeaders });
          if (res.ok) {
            figmaData = await res.json();
          }
        } catch (e) {}

        if (!figmaData) {
          const directUrl = `https://api.figma.com/v1/files/${fileKey}?depth=6`;
          const res2 = await fetch(directUrl, { headers: fetchHeaders });
          if (!res2.ok) {
            const errText = await res2.text().catch(() => '');
            if (res2.status === 403 || res2.status === 401) {
              throw new Error('Figma API 403/401: Token lacks read permissions for this file.');
            } else if (res2.status === 404) {
              throw new Error(`Figma File not found (404): Check fileKey "${fileKey}".`);
            } else {
              throw new Error(`Figma API Error (${res2.status}): ${errText || res2.statusText}`);
            }
          }
          figmaData = await res2.json();
        }

        fileTitle = figmaData.name || 'Figma Design';
        const pages = figmaData.document?.children || [];
        const firstPage = pages[0] || {};
        const topLevelFrames = firstPage.children || [];

        for (const frame of topLevelFrames) {
          const name = (frame.name || '').toLowerCase();
          if (!headerFrame && (name.includes('header') || name.includes('top bar') || name.includes('navbar') || name.includes('navigation'))) {
            headerFrame = frame;
          }
          if (!footerFrame && (name.includes('footer') || name.includes('bottom') || name.includes('copyright'))) {
            footerFrame = frame;
          }

          if (frame.children && Array.isArray(frame.children)) {
            for (const sub of frame.children) {
              const subName = (sub.name || '').toLowerCase();
              if (!headerFrame && (subName.includes('header') || subName.includes('top bar') || subName.includes('navbar'))) {
                headerFrame = sub;
              }
              if (!footerFrame && (subName.includes('footer') || subName.includes('bottom'))) {
                footerFrame = sub;
              }
            }
          }
        }

        if (!headerFrame) {
          const framesWithBoxes = topLevelFrames.filter((f: any) => f.absoluteBoundingBox);
          if (framesWithBoxes.length > 0) {
            framesWithBoxes.sort((a: any, b: any) => a.absoluteBoundingBox.y - b.absoluteBoundingBox.y);
            headerFrame = framesWithBoxes[0];
            if (framesWithBoxes.length > 1) {
              footerFrame = framesWithBoxes[framesWithBoxes.length - 1];
            }
          }
        }
      }

      // Try to get high-resolution rendered PNG from Figma Images API
      const targetRenderId = headerFrame?.id || nodeId;
      if (targetRenderId) {
        try {
          const imgApi = `/api/figma/v1/images/${fileKey}?ids=${encodeURIComponent(targetRenderId)}&format=png&scale=2`;
          const imgRes = await fetch(imgApi, { headers: fetchHeaders });
          if (imgRes.ok) {
            const imgJson = await imgRes.json();
            if (imgJson.images && imgJson.images[targetRenderId]) {
              figmaRenderedImageUrl = imgJson.images[targetRenderId];
            }
          }
        } catch (e) {
          try {
            const directImg = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(targetRenderId)}&format=png&scale=2`;
            const directRes = await fetch(directImg, { headers: fetchHeaders });
            if (directRes.ok) {
              const directJson = await directRes.json();
              if (directJson.images && directJson.images[targetRenderId]) {
                figmaRenderedImageUrl = directJson.images[targetRenderId];
              }
            }
          } catch (err) {}
        }
      }
    }

    if (headerFrame) {
      headerSummary = extractFigmaNodeSummary(headerFrame, 0, 8, collectedTexts);
    }
    if (footerFrame) {
      footerSummary = extractFigmaNodeSummary(footerFrame, 0, 8, collectedTexts);
    }

    const collectColors = (node: any) => {
      if (node?.colors) detectedColors.push(...node.colors);
      if (node?.children) node.children.forEach(collectColors);
    };
    if (headerSummary) collectColors(headerSummary);
    if (footerSummary) collectColors(footerSummary);

    const primaryColor = detectedColors[0] || '#163758';
    const secondaryColor = detectedColors[1] || '#f6b26b';

    // ----------------------------------------------------
    // STEP 3: MULTIMODAL GPT-4o INVOCATION (CSS & HTML)
    // ----------------------------------------------------
    updateProgress(3, 'Synthesizing Global CSS and Semantic HTML with GPT-4o Vision...');

    const systemPrompt = `You are a World-Class Principal Frontend Architect and Web Designer specializing in institutional portals.

Your job is to convert visual design screenshots and Figma component trees into pixel-perfect, hyper-accurate HTML and CSS.

CRITICAL ACCURACY & PIPELINE RULES:
1. STRICT CONTENT VERBATIM EXTRACTION (NO GENERIC DUMMY TEXT):
   - You MUST transcribe the EXACT text visible in the design/image.
   - NEVER invent placeholders like "College Name", "College Logo", "Link 1", "Link 2", "HomeAbout...".
   - Extract the exact Sponsoring Trust name, College Name, University Affiliation subtitle, Contact Phone number, Official Email address, Utility Links (e.g. "ALUMNI", "CAREERS", "APPLY NOW"), and every Navigation Menu tab visible.

2. THREE-ROW INSTITUTIONAL HEADER ARCHITECTURE:
   - TIER 1: TOP UTILITY BAR
     * Background color: Deep navy blue (#163758) or brand color matching the design.
     * Left: Phone number with inline SVG phone icon, Email with inline SVG mail icon. Clear flex spacing and dividers so text is cleanly separated.
     * Right: Utility links (e.g. ALUMNI, CAREERS) and prominent action button (e.g. "APPLY NOW") with warm accent background (#f6b26b / #f3a847), rounded corners, bold text, and hover state.
   - TIER 2: MAIN BRANDING & TITLE SECTION
     * Background: Clean white / light background.
     * Left: Official College Crest Emblem using:
       ${primaryEmblemUrl ? `<img src="${primaryEmblemUrl}" alt="College Crest" class="h-16 w-auto object-contain" />` : '<img src="/website-assets/college_emblem_logo.png" alt="College Crest" class="h-16 w-auto object-contain" />'}
       Include graceful fallback if image fails.
     * Center: Three-tier institutional typography:
       - Line 1: Trust/Society name (e.g. "MARATHWADA SHIKSHAN PRASARAK MANDAL") in small letter-spaced uppercase tracking.
       - Line 2: Prominent College Title (e.g. "DEOGIRI LAW COLLEGE") in large, bold, elegant SERIF typography (font-family: 'DM Serif Display', 'Playfair Display', 'Cinzel', Georgia, serif).
       - Line 3: University Affiliation/Accreditation subtitle (e.g. "Affiliated to Dr. Babasaheb Ambedkar Marathwada University (BAMU), Chhatrapati Sambhajinagar").
     * Right: Secondary Trust seal using:
       ${secondarySealUrl ? `<img src="${secondarySealUrl}" alt="Trust Emblem" class="h-16 w-auto object-contain" />` : '<img src="/website-assets/trust_seal_emblem.png" alt="Trust Emblem" class="h-16 w-auto object-contain" />'}
   - TIER 3: FULL-WIDTH MAIN NAVIGATION BAR
     * Background: Deep navy blue (#163758) or brand primary color.
     * Menu tabs: All exact tabs extracted from the design (e.g. HOME, ABOUT ▾, ACADEMICS ▾, COURSES ▾, STUDENT COUNCIL, COMMITTEES, FACILITIES, ACHIEVEMENTS, NAAC, GALLERY, CONTACT).
     * Active tab: Distinct highlight (e.g. peach/orange active tab background with bold dark text).
     * Dropdown carets: Include subtle down arrow (▾ or SVG chevron) for tabs with submenus.
     * Clean spacing: Proper horizontal padding (px-4 py-2.5), whitespace-nowrap, flex layout with hover transitions.

3. "customCss" (DESTINATION: WEBSITE APPEARANCE -> GLOBAL CSS):
   - You MUST write the complete, self-contained CSS rules for Website Appearance in "customCss".
   - Include Google Fonts @import at the very top of "customCss" for required fonts (e.g., @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=DM+Serif+Display&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');).
   - Define CSS root variables for brand colors (--color-primary, --color-secondary, --color-accent).
   - Define scoped CSS classes (.top-utility-bar, .main-branding, .main-navbar, .nav-item, .nav-item.active, .apply-btn, etc.) so that styling applies completely in Website Appearance.

4. "headerHtml" & "footerHtml" (DESTINATION: HEADER 4 & FOOTER 4):
   - Semantic HTML5 with <header>, <nav>, and <footer> tags.
   - Use both the scoped CSS classes and Tailwind classes.

5. JSON OUTPUT FORMAT:
   Return ONLY a valid JSON object with EXACT keys:
   {
     "headerHtml": "<header ...>...</header>",
     "footerHtml": "<footer ...>...</footer>",
     "customCss": "/* Complete CSS for Website Appearance */",
     "extractedColors": {
       "primary": "#...",
       "secondary": "#...",
       "accent": "#..."
     }
   }
   Do NOT output markdown backticks or explanations outside of the JSON.`;

    const userTextPrompt = `Design Title: "${fileTitle}"
Detected Primary Color: "${primaryColor}"
Detected Secondary Color: "${secondaryColor}"

Available Extracted Assets in File Manager (/website-assets):
- Primary Logo: "${primaryEmblemUrl || '/website-assets/college_emblem_logo.png'}"
- Secondary Seal: "${secondarySealUrl || '/website-assets/trust_seal_emblem.png'}"

Extracted Visible Text Strings from Design:
${JSON.stringify(collectedTexts.length > 0 ? collectedTexts : ['Examine image carefully for exact institution name, contacts, and menu items'], null, 2)}

Figma Header Tree Summary (if available):
${JSON.stringify(headerSummary || { note: 'Extract structure and text directly from the attached visual design image' }, null, 2)}

Please inspect the design image thoroughly and generate pixel-perfect { headerHtml, footerHtml, customCss, extractedColors }.`;

    const userMessageContent: any[] = [
      {
        type: 'text',
        text: userTextPrompt
      }
    ];

    const visualImage = imageScreenshot || figmaRenderedImageUrl;
    if (visualImage) {
      userMessageContent.push({
        type: 'image_url',
        image_url: {
          url: visualImage,
          detail: 'high'
        }
      });
    }

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent }
        ],
        temperature: 0.1
      })
    });

    if (!openAiResponse.ok) {
      const errData = await openAiResponse.json().catch(() => ({}));
      const msg = errData?.error?.message || openAiResponse.statusText;
      throw new Error(`OpenAI API Error (${openAiResponse.status}): ${msg}`);
    }

    const aiResultJson = await openAiResponse.json();
    const rawContent = aiResultJson.choices?.[0]?.message?.content || '{}';
    const parsedCode = JSON.parse(rawContent);

    const generatedHeader = parsedCode.headerHtml || '';
    const generatedFooter = parsedCode.footerHtml || '';
    const generatedCss = parsedCode.customCss || '';
    const extractedColors = parsedCode.extractedColors || {
      primary: primaryColor,
      secondary: secondaryColor
    };

    // ----------------------------------------------------
    // STEP 4: DISTRIBUTE TO CMS DESTINATIONS
    // - CSS -> Website Appearance (customCss)
    // - HTML -> Header 4 & Footer 4 (headerHtml, footerHtml)
    // - Images -> File Manager (already cataloged in Step 1)
    // ----------------------------------------------------
    updateProgress(4, 'Distributing CSS to Website Appearance, HTML to Header/Footer, & Images to File Manager...');

    const currentTemplates = getTenantTemplateData(tenantId);
    saveTenantTemplateData({
      headerHtml: targetScope === 'footer' ? currentTemplates.headerHtml : generatedHeader,
      footerHtml: targetScope === 'header' ? currentTemplates.footerHtml : generatedFooter,
      customCss: generatedCss || currentTemplates.customCss,
    }, tenantId);

    // Dispatch template and file manager updated events for live preview
    window.dispatchEvent(new CustomEvent('tenant-template-updated', { 
      detail: { tenantId } 
    }));
    window.dispatchEvent(new CustomEvent('file-manager-updated', {}));

    return {
      success: true,
      fileTitle,
      headerHtml: generatedHeader,
      footerHtml: generatedFooter,
      customCss: generatedCss,
      extractedAssetsCount,
      extractedColors
    };

  } catch (error: any) {
    console.error('Figma AI Agent execution failed:', error);
    return {
      success: false,
      error: error?.message || 'An unknown error occurred during AI agent conversion.'
    };
  }
};
