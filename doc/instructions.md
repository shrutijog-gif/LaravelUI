# Project Instructions & Preferences

## Testing Policy
- For prototype features, do **NOT** run automated browser tests or subagent tests unless explicitly instructed by the user.
- The user will perform browser testing manually and share screenshots for feedback and adjustments.

## Core Data Benchmark
- **Primary Data Fields**: **Title / File Name** + **Year** (mandatory) + **Uploaded File Link**.
- Optional fields like `branch` and `semester` are extra badges if present, but the design benchmark focuses on looking rich, vibrant, and premium with just **Title + Year + File Link**.

## Puck Sidebar Expandable Boxed Controllers
All property controls in Puck's right sidebar are grouped into **3 expandable boxed accordion controllers**, each featuring an outer border, gray header bar, and expand/collapse chevron:
1. **Header Controller**: Expandable box containing `Title` input and `Description` textarea.
2. **Style Controller**: Expandable box containing `Select Style` button opening layout modal.
3. **Content Controller**: Expandable box containing content visibility checkboxes.
- **Native Puck Sidebar**: Native standard Puck layout is preserved without custom width overrides or drag handles.
- **Section Differentiation**: Standard section dividers are maintained between panels for clean visual separation.
- **Label Consistency**: All gray header titles (`Header Controller`, `Style Controller`, `Content Controller`) use uniform Title Case formatting and `font-semibold text-xs text-gray-700` styling.

## Card Sizing & Robustness Guidelines
- **Uniform Card Height**: All cards in grid views must maintain a consistent uniform height (`h-full`, `min-h-[180px]`) so cards align cleanly across rows.
- **Entire Card Clickable**: The entire card wrapper must be a clickable link (`href={fileUrl}`) — no need for separate redundant file name text.
- **Rich Aesthetics**: Utilize glassmorphism badges, vibrant gradients, crisp typography, and micro-hover animations so the cards never look dull or plain.
