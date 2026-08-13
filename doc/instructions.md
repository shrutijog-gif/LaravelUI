# Project Instructions & Preferences

## Public Website Homepage (`CollegeStorefront.tsx`)
- **Default Public Website**: Clicking **Visit Website** (the Globe icon) opens the public **University College Homepage** (`CollegeStorefront.tsx`).
- **Balanced Campus Hero Background**: Features Unsplash architectural campus image (`https://images.unsplash.com/photo-1562774053-701939374585`) with a balanced dark black gradient overlay (`linear-gradient(to right, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.72))`) for rich contrast while keeping the campus building clearly visible.
- **Homepage Sections Included**:
  1. 🏛️ **Hero Banner**: Unsplash campus architecture image, admissions announcement, slogan, quick action buttons.
  2. 🎓 **Principal's Message**: Leadership photo, quote badge, principal Ph.D. credentials.
  3. 📅 **Academic Timetables Section**: Embedded live `TimetableBlock` rendering active tenant's timetables with PDF download links.
  4. 🏆 **Alumni Spotlight**: Grid of prominent alumni cards with batch tags and achievements.
  5. 📢 **Notices & Circulars**: Quick updates and examination announcements.
  6. 🛡️ **College Footer**: Accreditation badges, campus helpline, and quick links.
- **Preserved Ecommerce Module**: The original e-commerce storefront is safely preserved and accessible via **`Visit Ecommerce Storefront`** on the E-Commerce Dashboard (`view=ecommerce`).

## Multi-Tenancy Prototype Architecture
- **Dynamic Tenant Profiles**: 3 college tenant profiles (`lady-irwin`, `mgm-kvk`, `st-xaviers`) defined in [tenantData.ts](file:///d:/projects/LaravelUI/LaravelUI/src/data/tenantData.ts).
- **Header Tenant Switcher Dropdown**: Dropdown in Admin Header (`Header.tsx`) and Storefront Header (`CollegeStorefront.tsx`) allows 1-click live demo switching between college tenants.
- **Dynamic Adaptive Branding**:
  - Logo/Emblem, College Name, Subtitle, and Storefront primary brand colors automatically update live when switching tenants.
  - User profile avatar `SJ` background color remains fixed at standard dark navy (`bg-[#0f2748]`).
  - Stored timetables are partitioned per tenant in `localStorage` (`laravel_ui_timetables_list_<tenant_id>`).
- **Full AI Vision & Roadmap**: Documented in [ai-enabling-product-roadmap.md](file:///d:/projects/LaravelUI/LaravelUI/doc/ai-enabling-product-roadmap.md).
- **Card Design System Specification**: Documented in [design-system-for-cards.md](file:///d:/projects/LaravelUI/LaravelUI/doc/design-system-for-cards.md).

## Admin Navigation & Header Toggle Defaults
- **Black Bar Removal**: The top black preview switcher strip has been removed completely for a clean UI.
- **Globe Icon Toggle (New Window)**: Clicking the **Globe icon** (`<Globe />`) in the Admin Header bar with title/tooltip (`Visit Website`) opens the Public Storefront website in a **new browser tab/window** (`window.open('?mode=storefront', '_blank')`). This allows administrators to keep working in the Admin Panel without losing context.
- **Admin Default Module**: Navigating to Admin Panel defaults to opening the main **Dashboard** module (`activeModuleId: 'dashboard'`) with submenus collapsed.

## Testing Policy
- For prototype features, do **NOT** run automated browser tests or subagent tests unless explicitly instructed by the user.
- The user will perform browser testing manually and share screenshots for feedback and adjustments.

## Core Data Benchmark & Live Browser Storage Sync
- **Primary Data Fields**: **Title / File Name** + **Year** (mandatory) + **Uploaded File Link**.
- **Live LocalStorage Sync**: Timetables added, edited, toggled (`showOnWebsite`), or deleted in the Admin Dashboard persistent in browser `localStorage`.
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
1. **Block Header**: Expandable box containing `Title` input and `Description` textarea.
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
- **Label Consistency**: All gray header titles (`Block Header`, `Style Controller`, `Content Controller`, `Advanced Controller`) use uniform Title Case formatting and `font-semibold text-xs text-gray-700` styling.

## Card Sizing & Robustness Guidelines
- **Uniform Card Height**: All cards in grid views must maintain a consistent uniform height (`h-full`, `min-h-[180px]`) so cards align cleanly across rows.
- **Entire Card Clickable**: The entire card wrapper must be a clickable link (`href={fileUrl}`) — no need for separate redundant file name text.
- **Rich Aesthetics**: Utilize glassmorphism badges, vibrant gradients, crisp typography, and micro-hover animations so the cards never look dull or plain.
