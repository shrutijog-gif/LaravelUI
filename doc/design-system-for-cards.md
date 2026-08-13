# Card Design System & Theme Architecture Specification

## 1. Executive Summary
This document outlines the architecture for the unified **Card Design System & Theme Customization Engine** used across all document and report modules in the web application (including **Timetables**, **AQAR Reports**, **Syllabus & Curriculum**, **Circulars & Notices**, and **Academic Calendars**).

The architecture enforces a strict separation of concerns between:
1. **Layout Templates (Structure)**: How content is visually arranged.
2. **Theme Customization (Branding & Colors)**: College brand colors, button styles, and accents.
3. **Domain Data Models (Datasets)**: Module-specific fields injected into shared templates.

---

## 2. Shared Card Layout Templates (Structure)

The system provides 4 universal Card Layouts and 3 Table Layouts that serve as a shared design system across all document modules.

### 🎨 Card Layout Templates
- **Style 1 — Classic Document**: Top icon badge + prominent title + metadata tag pills + bottom action link.
- **Style 2 — Minimalist File**: Minimalist card + file icon badge + title + bookmark action + PDF link.
- **Style 3 — Modern Gradient Banner**: Vibrant top accent banner containing the title + white card body with action button.
- **Style 4 — Dual-Pane Split Card**: Left gradient accent icon block + right clean content pane with title & action button.

### 📊 Table Layout Templates
- **Table Style 1 — Classic Clean**: Structured table with subtle hover highlighting, uppercase headers, and action buttons.
- **Table Style 2 — Bordered Row Cards**: Card-like table rows with file icon badges and action buttons per row.
- **Table Style 3 — Modern Gradient Header**: Vibrant gradient header row with glassmorphism accent pills.

---

## 3. Theme & Color Customization Architecture

Theme customization operates at two levels:

### 🏛️ Level 1: Global College Theme (Site-Wide Default)
- The institution configures its official brand colors in central settings:
  - **Primary Brand Color**: *(e.g. Royal Blue `#2563eb`, Emerald Green `#047857`, Crimson Red `#991b1b`)*
  - **Accent & Button Colors**
  - **Header Banner Style**
- Every block across the entire website automatically inherits this brand theme out-of-the-box.

### 🎨 Level 2: Per-Block Theme Overrides (`Theme Controller` in Puck)
- Individual page blocks can override colors locally via a dedicated **`Theme Controller`** accordion in Puck:
  - **Color Presets**: 🔵 *Royal Blue*, 🟢 *Emerald Green*, 🔴 *Crimson Red*, 🟣 *Indigo*, 🟠 *Amber*, ⬛ *Sleek Slate*.
  - **Custom Hex Picker**: Input arbitrary brand hex codes (`[ #2563eb ]`).
  - **Card Background Options**: White (`#ffffff`), Light Gray (`#f8fafc`), or Frosted Glass.

---

## 4. Domain Data Mapping per Module

While card layout templates are shared, each module injects its own domain-specific dataset:

| Module | Primary Title | Key Badges / Metadata | Primary Action |
| :--- | :--- | :--- | :--- |
| 📅 **Timetables** | Timetable Name | Academic Year, Branch, Semester, Section | Download PDF |
| 📊 **AQAR Reports** | Report Title | Academic Year, AQAR Criterion (I–VII), Status | View Full Report |
| 📚 **Syllabus** | Course / Program | Regulation Year, Degree, Total Credits | Download Scheme |
| 📢 **Circulars** | Notice Title | Notice Date, Department, Urgency Badge | View Attachment |

---

## 5. Puck Sidebar Controller Architecture

Property controls in the Puck Builder right sidebar are organized into modular, expandable boxed accordion controllers:

- 📦 **Block Header**: Block Title & Description inputs.
- 🎨 **Style Controller**: Layout template selection (`Select Style` modal trigger) & Grid columns dropdown (`2`, `3`, `4` cards per row).
- 🎛️ **Content Controller**: Show/hide checkboxes logically grouped into *Core Data Fields* (Name, Year, File Name, Branch, Semester) and *UI Elements* (Download button, Icon).
- ⚙️ **Advanced Controller**: Anchor ID (`id="..."` for scroll links) and CSS Class (`className="..."`) inputs.
- 🖌️ **Theme Controller** *(Planned)*: Palette presets & local brand color overrides.

---

## 6. Implementation Checklist & Next Steps

- [x] Timetable Block layout templates (Card Styles 1–4, Table Styles 1–3).
- [x] Puck 4-Boxed Controller Architecture (Header, Style, Content, Advanced).
- [x] Live LocalStorage Data Sync between Admin & Puck Builder.
- [x] Permanent PDF Data URL uploads & `target="_blank"` link resolution.
- [x] Interactive **View Page (Live Preview Modal)**.
- [ ] Theme Controller implementation in Puck for primary brand color pickers.
- [ ] Rollout of shared Card Design System to AQAR Reports module.
