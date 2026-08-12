# Workspace Rules

- For prototype features, do **NOT** run browser automated subagent tests unless explicitly instructed by the user.
- The user handles browser testing manually and will share screenshots if feedback or adjustments are required.
- **Core Data Benchmark**: **Title** + **Year** (mandatory) + **Uploaded File Link**. Optional fields like `branch` and `semester` auto-hide cleanly.
- **Puck Sidebar UI Architecture**:
  - All sidebar settings are grouped into **3 expandable boxed accordion controllers** with outer border, gray header bar, and expand/collapse chevron:
    - 📦 **Header Controller** (Title & Description)
    - 🎨 **Style Controller** (Select Style button)
    - 🎛️ **Content Controller** (Visibility checkboxes)
  - Native Puck sidebar & layout structure preserved cleanly.
  - All headers use matching Title Case and identical font boldness (`font-semibold text-xs text-gray-700`).
- **Uniform Card Height**: Cards in grid views must maintain a consistent uniform height (`h-full flex flex-col justify-between`) so grid rows align perfectly.
- **Entire Card Clickable**: The full card element is a clickable link (`<a>`) linked to `fileUrl`.
- **High-End Aesthetics**: Utilize modern typography, glassmorphism pills, micro-gradients, and smooth hover elevation so cards look vibrant and state-of-the-art.
