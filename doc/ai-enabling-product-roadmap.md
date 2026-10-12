# SaaS Product Strategy & AI Enabling Vision

## 1. Product Context & Multi-Tenancy Architecture
The application is built as a **Multi-Tenant SaaS Platform** designed to serve multiple colleges, universities, and institutions from a single codebase.

- **Multi-Tenant Isolation**: Each tenant (college) operates on shared component code while maintaining isolated branding, logos, theme colors, and database records.
- **Prototype Tenant Switcher**: A header dropdown in the Admin Header enables 1-click live switching between college tenants (*Lady Irwin College*, *MGM Krishi Vigyan Kendra*, *St. Xavier's University*) for instant stakeholder demos.

---

## 2. Design-to-Code Product Workflow

The product development pipeline follows an industry-standard workflow:

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│ 1. FIGMA / LOVABLE      │  ──► │ 2. IMPLEMENTATION       │  ──► │ 3. PUCK BUILDER & SAAS  │
│ Designer creates visual │      │ We convert design into  │      │ Wire into Puck so any   │
│ card & page layouts     │      │ reusable CSS & React    │      │ college admin can add   │
│ and gets approval.      │      │ component templates.    │      │ content dynamically.    │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

1. **Design Approval**: Visual designs created in Figma or Lovable and approved by stakeholders.
2. **Systemization**: Approved designs converted into reusable layout primitives (Card Styles 1–4, Table Styles 1–3).
3. **Puck Builder Integration**: Component templates registered in Puck Builder with standardized 5-accordion sidebar controllers:
   - 📦 **Block Header**: Title & Description inputs
   - 🎨 **Style Controller**: Template picker modal & Grid columns (2/3/4 Cards per row)
   - 🎛️ **Content Controller**: Core Data Fields vs UI Component toggles
   - 🖌️ **Theme Controller**: Brand color presets & custom hex picker
   - ⚙️ **Advanced Controller**: Anchor ID & CSS Class inputs

---

## 3. Two-Phase AI Architecture & Product Roadmap

```
┌──────────────────────────────────────┐
│ PHASE 1: Component Library           │ ◄── FOUNDATION (In Progress)
│ Pre-built, tested card templates     │     Serves as the building blocks for AI
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ PHASE 2: AI Copilot & Component Creator ◄── FLAGSHIP SAAS VISION
│ 1. AI Page Assembler (JSON Config)   │     Admins prompt AI to generate layouts
│ 2. Dynamic AI Component Studio       │     Admins generate brand-new components!
└──────────────────────────────────────┘
```

### Phase 1: Foundational Component Library (Current)
- Pre-built, pixel-perfect, battle-tested component templates (Timetables, AQAR Reports, Syllabus).
- Ensures 100% predictable layout quality, responsive design, and brand compliance.
- **Critical Insight**: Phase 1 is mandatory because AI cannot assemble layouts without a pre-tested component library.

### Phase 2: SaaS AI Copilot & Dynamic Component Creator (Vision)

#### 🤖 Feature 2A: AI Page Copilot (Intelligent Assembler)
- Non-technical college admins type prompts (*"Create a 3-card layout for Science Timetables with a navy blue banner"*).
- AI generates valid Puck JSON instantly, selecting appropriate card styles, grid columns, and brand colors without raw code generation.

#### 🚀 Feature 2B: Dynamic AI Component Creator (Custom Studio)
- College IT admins click **"✨ Create Custom Component with AI"**.
- Admin prompts AI (*"Create a 2-column Alumni Spotlight card with photo on left, quote on right, and LinkedIn button"*).
- AI generates dynamic component schema + React renderer, registers it in Puck, and saves it to the college tenant's database array (`tenantComponents`).

---

## 4. Immediate Next Action Items
1. Integrate **Multi-Tenant Header Switcher** (`Lady Irwin College`, `MGM KVK`, `St. Xavier's`).
2. Finalize Theme Controller for brand color switching across Admin & Storefront.
3. Prepare component registry architecture for Phase 2 AI Component Studio.
