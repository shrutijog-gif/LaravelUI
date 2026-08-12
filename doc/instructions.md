# Project Instructions & Preferences

## Testing Policy
- For prototype features, do **NOT** run automated browser tests or subagent tests unless explicitly instructed by the user.
- The user will perform browser testing manually and share screenshots for feedback and adjustments.

## Core Data Benchmark & Live Browser Storage Sync
- **Primary Data Fields**: **Title / File Name** + **Year** (mandatory) + **Uploaded File Link**.
- **Live LocalStorage Sync**: Timetables added, edited, toggled (`showOnWebsite`), or deleted in the Admin Dashboard persistent in browser `localStorage` (`laravel_ui_timetables_list`).
- **PDF Upload & Direct PDF Opening**:
  - Uploaded files are converted into permanent PDF Data URLs (`data:application/pdf;base64,...`) via `FileReader`.
  - All cards resolve links via `getValidFileUrl(fileUrl)` — ensuring any uploaded PDF opens in a new tab, and any previous item with `#` falls back to opening a valid sample PDF in a new tab instead of navigating to `http://localhost:5173/#`.

## Style Picker Modal Proportions
- **Exact 380px Preview Width**: Modal window set to `max-w-5xl` with `max-w-[380px]` preview wrapper width for perfectly proportioned preview card presentation.

## View Page & Save Persistence
- **`View Page` Button**: Clicking **View Page** opens a full-screen **Live Public Website View Modal** (`<Render config={config} data={data} />`).
  - Displays the exact published website layout inside a 7XL container.
  - All PDF file links (`href`), card clicks, hover effects, buttons, and anchor scroll IDs are **100% active and clickable**.
- **`Save` Button**: Persists Puck page data into `localStorage` (`puck_saved_page_data`) and displays a green success toast message.

## Puck Sidebar Expandable Boxed Controllers
All property controls in Puck's right sidebar are grouped into **4 expandable boxed accordion controllers**, each featuring an outer border, gray header bar, and expand/collapse chevron:
1. **Header Controller**: Expandable box containing `Title` input and `Description` textarea.
2. **Style Controller**: Expandable box containing visual layout choices:
   - **`Select Style`**: Left label + right badge `[ STYLE-1 ]` (opens modal).
   - **`Cards Per Row`**: Left label + right dropdown badge `[ 3 Cards ▾ ]`.
3. **Content Controller**: Expandable box containing show/hide checkboxes logically grouped with a subtle divider:
   - **Core Data Fields**: `Name`, `Year`, `File Name`, `Branch`, `Semester`
   - *Subtle Divider Line*
   - **UI Component Elements**: `Download button`, `Icon`
4. **Advanced Controller**: Expandable box (collapsed by default) containing developer/technical attributes:
   - **`Anchor Id`**: Left label + right inline input (`e.g. timetable-section`).
   - **`Css Class`**: Left label + right inline input (`e.g. custom-class`).
- **Section Differentiation**: Standard section dividers are maintained between panels for clean visual separation.
- **Label Consistency**: All gray header titles (`Header Controller`, `Style Controller`, `Content Controller`, `Advanced Controller`) use uniform Title Case formatting and `font-semibold text-xs text-gray-700` styling.

## Card Sizing & Robustness Guidelines
- **Uniform Card Height**: All cards in grid views must maintain a consistent uniform height (`h-full`, `min-h-[180px]`) so cards align cleanly across rows.
- **Entire Card Clickable**: The entire card wrapper must be a clickable link (`href={fileUrl}`) — no need for separate redundant file name text.
- **Rich Aesthetics**: Utilize glassmorphism badges, vibrant gradients, crisp typography, and micro-hover animations so the cards never look dull or plain.
