# NAAC SSR Evidence Filing & Role Hierarchy — Next Steps Roadmap

## Executive Summary

This roadmap outlines the architecture and execution plan for the two major planned capabilities of the NAAC SSR Evidence & Accreditation Management platform:
1. **Multi-Category Evidence Architecture**: Broadening evidence filing beyond Criteria 1–7 to include **Extended Profile (Institutional Baseline)** and **DVV Clarifications (Data Validation & Verification Queries)**.
2. **Rolewise & Multi-Institution Hierarchy Prototype**: Structuring the end-to-end governance flow from **Central University IQAC** down to **Constituent Colleges**, **Academic Departments/Programs**, and **Individual Faculty Desks**.

---

## Sequencing Strategy: Why Workstream 1 Comes First

```
┌──────────────────────────────────────────────────────────┐
│ Phase 1: Complete Evidence Destination Architecture       │
│ • Criteria 1–7 (QnM / QlM Metrics)                       │
│ • Extended Profile (Students, Teachers, Infrastructure)   │
│ • DVV Clarification Queries & Counter-Proofs             │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│ Phase 2: Multi-College & Rolewise Hierarchy Prototype    │
│ • University Central IQAC Master Cockpit                 │
│ • College / Institute Level (Principal / IQAC Director)  │
│ • Department / Program Level (HOD / Coordinator)         │
│ • Faculty Desk (Teaching & Research Proofs)              │
└──────────────────────────────────────────────────────────┘
```

### Strategic Rationale
- **Single Source of Truth**: Multi-institution aggregation (Phase 2) requires a complete filing model. If we replicate only Criteria 1–7 across multiple colleges, we would later have to refactor every tier to accommodate Extended Profile and DVV.
- **Accreditation Authenticity**: A real NAAC submission package requires all three sections submitted in tandem. Completing Phase 1 provides full functional authenticity for any individual college before scaling upward.
- **Rich Multi-College Dashboards**: When the Central University Coordinator reviews constituent institutions in Phase 2, they will see live progress across all 3 fronts (*Extended Profile Baseline*, *Criteria Metric Fulfillment*, and *DVV Queries Resolved*).

---

## Phase 1: Multi-Category Evidence Architecture

### 1. The 3 NAAC Evidence Categories

| Category | Purpose | Typical Documents | Destination Hierarchy |
| :--- | :--- | :--- | :--- |
| **1. Criteria 1–7 (Core SSR)** | Evaluate 7 NAAC Dimensions with Quantitative (QnM) and Qualitative (QlM) metrics. | Syllabi, feedback analyses, research papers, MoUs, event reports, audit statements. | `Criterion (1–7)` ➔ `Key Indicator` ➔ `Metric (e.g. 1.1.1, 3.4.1)` |
| **2. Extended Profile** | Institutional baseline numbers required for NAAC statistical algorithms and weighting. | Approved program lists, sanctioned seat matrices, appointment letters, audited balance sheets. | `Section` ➔ `Sub-Item` (e.g. *1. Programs: 1.1, 1.2*, *2. Students: 2.1, 2.2*, *3. Teachers: 3.1, 3.2*, *4. Expenditure: 4.1, 4.2*) |
| **3. DVV Clarifications** | Address specific discrepancies, deviations, or queries raised by NAAC DVV audit partners within 15-day window. | Clarification response letters, geotagged photos, revised data templates, certified counter-proofs. | `DVV Query Reference` ➔ `Target Metric` ➔ `Clarification Attachment` |

---

### 2. Implementation Specifications for Phase 1

#### A. Quick Drop Destination Selector
Update `NaacQuickUploadLanding.tsx` destination bar to offer 3 high-level filing targets:
- `[🔘 Criteria 1–7]` *(Default)*: Criterion ➔ Key Indicator ➔ Metric dropdowns.
- `[🔘 Extended Profile]`: Section (1. Programs, 2. Students, 3. Faculty, 4. Expenditure) ➔ Baseline Item dropdowns.
- `[🔘 DVV Clarification]`: Active DVV Query ➔ Affected Metric dropdowns.

#### B. AI Rule Engine & Classification
- Update `getAiSuggestion()` and OpenAI prompt to detect:
  - Extended profile documents (e.g., *"Audited Expenditure 2024-25"*, *"Sanctioned Full-Time Faculty List"*).
  - DVV letters (e.g., *"DVV Clarification Response Metric 3.4.1"*).

#### C. Evidence Directory & Compilation
- Filter directory views by Category: `All`, `Criteria 1-7`, `Extended Profile`, `DVV Queries`.
- PDF Compilation tool to support compiling **Extended Profile dossiers** and **DVV Response Packets** with shareable portal links.

---

## Phase 2: Rolewise & Multi-College Hierarchy Prototype

### 1. Hierarchy & Persona Model

```
                    ┌───────────────────────────────┐
                    │    University Central IQAC    │
                    │   (Master Multi-College View) │
                    └───────────────┬───────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  College A:     │        │  College B:     │        │  College C:     │
│  Lady Irwin     │        │  MGM KVK        │        │  St. Xavier's   │
│  (Principal/    │        │  (Principal/    │        │  (Principal/    │
│   College IQAC) │        │   College IQAC) │        │   College IQAC) │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ Department/Prog │        │ Department/Prog │        │ Department/Prog │
│ (HOD/Coord.)    │        │ (HOD/Coord.)    │        │ (HOD/Coord.)    │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ Faculty Members │        │ Faculty Members │        │ Faculty Members │
│ (Individual)    │        │ (Individual)    │        │ (Individual)    │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

### 2. Tier Specifications

1. **Tier 4: Faculty Desk**
   - Personal proof drop zone.
   - Auto-tracks *"My Evidence"* proofs.
   - Submits single or batch drafts to Department Coordinator.

2. **Tier 3: Program / Department Coordinator (HOD)**
   - Reviews proofs from all department faculty.
   - Verifies against Criterion & Metric requirements.
   - Forwards approved Department proofs to College IQAC.

3. **Tier 2: College Level (Principal & College IQAC Director)**
   - Aggregates all departments within the college.
   - Oversees Extended Profile completion and DVV query responses for the college.
   - Submits verified college SSR report to University Master Archive.

4. **Tier 1: Central University IQAC (Multi-Institution Master)**
   - High-level executive cockpit showing comparative readiness cards for:
     - College A (e.g. Lady Irwin College: 88% complete)
     - College B (e.g. MGM KVK: 74% complete)
     - College C (e.g. St. Xavier's: 91% complete)
   - Batch nudge/reminder capabilities across all colleges.
   - Final SSR export and university-wide benchmark reports.

---

## Technical File Reference

- **Quick Drop & Directory**: [`src/components/modules/naac/NaacQuickUploadLanding.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/NaacQuickUploadLanding.tsx)
- **SSR Cycle & DVV Module**: [`src/components/modules/naac/NaacSsrCycleModule.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/NaacSsrCycleModule.tsx)
- **Multi-Tenant State**: [`src/data/tenantData.ts`](file:///d:/projects/LaravelUI/LaravelUI/src/data/tenantData.ts)
- **Existing Desks**:
  - Faculty: [`src/components/modules/naac/FacultyDesk.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/FacultyDesk.tsx)
  - Program Coordinator: [`src/components/modules/naac/ProgramCoordinatorDesk.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/ProgramCoordinatorDesk.tsx)
  - School Coordinator: [`src/components/modules/naac/SchoolCoordinatorDesk.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/SchoolCoordinatorDesk.tsx)
  - University Coordinator: [`src/components/modules/naac/UniversityCoordinatorDesk.tsx`](file:///d:/projects/LaravelUI/LaravelUI/src/components/modules/naac/UniversityCoordinatorDesk.tsx)

---
*Created on: 2026-11-06 — Ready for development when scheduled.*

