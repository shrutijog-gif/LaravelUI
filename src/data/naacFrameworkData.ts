/**
 * NAAC Key Indicator Framework Master Data Layer
 * 100% Client-Side LocalStorage with Cycle-Aware & Institution-Aware Presets
 * 
 * Supports 4-Level Hierarchy:
 * Level 1: Criterion / Attribute
 * Level 2: Key Indicator (KI)
 * Level 3: Metric (QnM / QlM + Weightage)
 * Level 4: Sub-Metric / Evidence Deliverable (Proof documents & guidelines)
 */

export interface NaacSubMetricMaster {
  id: string;
  code: string;               // e.g. "1.1.1.A"
  name: string;               // e.g. "Approved Syllabus Copy & BoS Minutes"
  description?: string;
  evidenceTypes?: string[];   // ['pdf', 'xlsx', 'docx', 'jpg']
  isMandatory: boolean;
  guidelines?: string;
}

export interface NaacMetricMaster {
  id: string;
  code: string;               // e.g. "1.1.1"
  name: string;
  metricType: 'QnM' | 'QlM';  // Quantitative vs Qualitative
  weightage: number;          // e.g. 20
  description?: string;
  benchmark?: string;
  dataTemplateUrl?: string;
  subMetrics: NaacSubMetricMaster[];
}

export interface NaacKeyIndicatorMaster {
  id: string;
  code: string;               // e.g. "1.1"
  name: string;
  weightage: number;          // e.g. 20
  description?: string;
  metrics: NaacMetricMaster[];
}

export interface NaacCriterionMaster {
  id: string;
  code: string;               // e.g. "Criterion 1" or "Attribute 1"
  name: string;
  weightage: number;          // e.g. 100
  description?: string;
  indicators: NaacKeyIndicatorMaster[];
}

export type NaacFrameworkType =
  | 'affiliated_7'
  | 'autonomous_7'
  | 'university_7'
  | 'medical_7'
  | 'binary_10'
  | 'custom';

export type NaacInstitutionType =
  | 'affiliated'
  | 'autonomous'
  | 'university'
  | 'medical'
  | 'general';

export interface NaacFrameworkProfile {
  id: string;
  name: string;
  type: NaacFrameworkType;
  institutionType: NaacInstitutionType;
  editionYear: string;
  description: string;
  totalWeightage: number;
  criteria: NaacCriterionMaster[];
}

// ---------------------------------------------------------------------------------
// 1. TEMPLATE: Affiliated College (RAF - 7 Criteria)
// ---------------------------------------------------------------------------------
export const AFFILIATED_7_CRITERIA_TEMPLATE: NaacFrameworkProfile = {
  id: 'template-affiliated-7',
  name: 'Affiliated College Manual (7 Criteria RAF)',
  type: 'affiliated_7',
  institutionType: 'affiliated',
  editionYear: 'Revised RAF 2020',
  description: 'Standard NAAC accreditation manual for general UG/PG colleges affiliated with a state/central university.',
  totalWeightage: 1000,
  criteria: [
    {
      id: 'crit-1',
      code: 'Criterion 1',
      name: 'Curricular Aspects',
      weightage: 100,
      description: 'Focuses on how the curriculum is planned, delivered, enriched, and evaluated via stakeholder feedback.',
      indicators: [
        {
          id: 'ki-1-1',
          code: '1.1',
          name: 'Curricular Planning and Implementation',
          weightage: 20,
          description: 'Institutional mechanism for effective delivery of university curriculum.',
          metrics: [
            {
              id: 'm-1-1-1',
              code: '1.1.1',
              name: 'The Institution ensures effective curriculum planning and delivery through a well-planned and documented process including Academic calendar and conduct of continuous internal assessment.',
              metricType: 'QlM',
              weightage: 20,
              description: 'Upload academic calendar, departmental timetables, course files, and lesson plans.',
              subMetrics: [
                { id: 'sm-1-1-1-a', code: '1.1.1.A', name: 'Institutional Academic Calendar with Committee Approval', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-1-1-b', code: '1.1.1.B', name: 'Departmental Timetables with Staff Workload Allotment', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-1-1-c', code: '1.1.1.C', name: 'Course Plan & Lesson Delivery Tracking Registers', isMandatory: false, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
        {
          id: 'ki-1-2',
          code: '1.2',
          name: 'Academic Flexibility',
          weightage: 30,
          description: 'Introduction of new courses, elective options, and skill-oriented certificate programmes.',
          metrics: [
            {
              id: 'm-1-2-1',
              code: '1.2.1',
              name: 'Number of Add on / Certificate / Value added programs offered and online MOOCs completed by students during the last five years.',
              metricType: 'QnM',
              weightage: 30,
              description: 'Tabulate certificate courses >= 30 contact hours with student rosters and certificates.',
              subMetrics: [
                { id: 'sm-1-2-1-a', code: '1.2.1.A', name: 'Brochure, Course Curriculum & Outcome Document', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-2-1-b', code: '1.2.1.B', name: 'Attendance Sheets & Certified Student Enrolment List', isMandatory: true, evidenceTypes: ['xlsx', 'pdf'] },
                { id: 'sm-1-2-1-c', code: '1.2.1.C', name: 'Sample Course Completion Certificates (5 per program)', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-1-3',
          code: '1.3',
          name: 'Curriculum Enrichment',
          weightage: 30,
          description: 'Integration of cross-cutting issues like Professional Ethics, Gender, Human Values, and Environment.',
          metrics: [
            {
              id: 'm-1-3-1',
              code: '1.3.1',
              name: 'Institution integrates crosscutting issues relevant to Professional Ethics, Gender, Human Values, Environment and Sustainability in transacting the Curriculum.',
              metricType: 'QlM',
              weightage: 10,
              description: 'Qualitative narrative with proof of syllabus extracts, awareness workshops, and NSS events.',
              subMetrics: [
                { id: 'sm-1-3-1-a', code: '1.3.1.A', name: 'List & Syllabus extracts of courses addressing crosscutting values', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-3-1-b', code: '1.3.1.B', name: 'Event reports with geotagged photos and student attendance', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
            {
              id: 'm-1-3-2',
              code: '1.3.2',
              name: 'Percentage of students undertaking project work/field work/internships (Data for the latest completed academic year).',
              metricType: 'QnM',
              weightage: 20,
              description: 'Student list, project completion letters, and industry field visit certificates.',
              subMetrics: [
                { id: 'sm-1-3-2-a', code: '1.3.2.A', name: 'Department-wise Student Project / Internship Completion List', isMandatory: true, evidenceTypes: ['xlsx'] },
                { id: 'sm-1-3-2-b', code: '1.3.2.B', name: 'Industry Internship Completion Letters & Field Visit Logbooks', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-1-4',
          code: '1.4',
          name: 'Feedback System',
          weightage: 20,
          description: 'Formal feedback collection, analysis, and action taken report from key stakeholders.',
          metrics: [
            {
              id: 'm-1-4-1',
              code: '1.4.1',
              name: 'Institution obtains feedback on the academic performance and ambience of the institution from various stakeholders and Action Taken Report is made available on the website.',
              metricType: 'QnM',
              weightage: 20,
              description: 'Sample feedback forms, Stakeholder analysis reports, and Action Taken Reports on college website.',
              subMetrics: [
                { id: 'sm-1-4-1-a', code: '1.4.1.A', name: 'Feedback Analysis Report for Students, Teachers & Employers', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-4-1-b', code: '1.4.1.B', name: 'Action Taken Report (ATR) signed by Principal & IQAC Co-ordinator', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-1-4-1-c', code: '1.4.1.C', name: 'Live Website URL proofs showing public ATR hosting', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-2',
      code: 'Criterion 2',
      name: 'Teaching-Learning and Evaluation',
      weightage: 350,
      description: 'Enrolment statistics, teacher quality credentials, experiential learning, and student outcome attainment.',
      indicators: [
        {
          id: 'ki-2-1',
          code: '2.1',
          name: 'Student Enrolment and Profile',
          weightage: 40,
          description: 'Admissions against sanctioned intake and reservation quotas.',
          metrics: [
            {
              id: 'm-2-1-1',
              code: '2.1.1',
              name: 'Enrolment percentage (Average of last five years).',
              metricType: 'QnM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-2-1-1-a', code: '2.1.1.A', name: 'Sanctioned intake letters approved by Affiliating University', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-2-1-1-b', code: '2.1.1.B', name: 'First Year admitted students roll list signed by Principal', isMandatory: true, evidenceTypes: ['xlsx', 'pdf'] },
              ],
            },
            {
              id: 'm-2-1-2',
              code: '2.1.2',
              name: 'Percentage of seats filled against seats reserved for various categories (SC, ST, OBC, Divyangjan, etc.).',
              metricType: 'QnM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-2-1-2-a', code: '2.1.2.A', name: 'State Government reservation quota circular', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-2-1-2-b', code: '2.1.2.B', name: 'Category-wise admitted students summary attested by Competent Authority', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-2-4',
          code: '2.4',
          name: 'Teacher Profile and Quality',
          weightage: 80,
          description: 'Full-time faculty ratio, sanctioned posts, and Ph.D. qualifications.',
          metrics: [
            {
              id: 'm-2-4-1',
              code: '2.4.1',
              name: 'Percentage of full-time teachers against sanctioned posts during the last five years.',
              metricType: 'QnM',
              weightage: 40,
              subMetrics: [
                { id: 'sm-2-4-1-a', code: '2.4.1.A', name: 'Governing Body Sanctioned Post Letters', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-2-4-1-b', code: '2.4.1.B', name: 'Appointment Letters & Joining Reports of Full-time Teachers', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
            {
              id: 'm-2-4-2',
              code: '2.4.2',
              name: 'Percentage of full time teachers with NET/SET/SLET/ Ph. D. / D.M. / M.Ch. / D.N.B / D.Sc. / D.Litt.',
              metricType: 'QnM',
              weightage: 40,
              subMetrics: [
                { id: 'sm-2-4-2-a', code: '2.4.2.A', name: 'Doctoral Degree Certificates of Faculty', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-2-4-2-b', code: '2.4.2.B', name: 'NET/SET qualification award letters', isMandatory: false, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-2-6',
          code: '2.6',
          name: 'Student Performance and Learning Outcomes',
          weightage: 60,
          description: 'Program Outcomes (PO) and Course Outcomes (CO) attainment and final year pass percentage.',
          metrics: [
            {
              id: 'm-2-6-1',
              code: '2.6.1',
              name: 'Programme Outcomes and Course Outcomes are stated and displayed on website and communicated to teachers and students.',
              metricType: 'QlM',
              weightage: 30,
              subMetrics: [
                { id: 'sm-2-6-1-a', code: '2.6.1.A', name: 'Department-wise PO & CO statements and syllabus alignment document', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
            {
              id: 'm-2-6-2',
              code: '2.6.2',
              name: 'Pass percentage of Students of the final year examination (Average of last five years).',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'sm-2-6-2-a', code: '2.6.2.A', name: 'University Examination Result Gazettes & Certified Pass Lists', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-3',
      code: 'Criterion 3',
      name: 'Research, Innovations and Extension',
      weightage: 110,
      description: 'Grants received, faculty publications, community outreach through NSS/NCC, and collaborative MoUs.',
      indicators: [
        {
          id: 'ki-3-2',
          code: '3.2',
          name: 'Innovation Ecosystem',
          weightage: 15,
          description: 'Incubation centers, IPR cell, and start-up initiatives.',
          metrics: [
            {
              id: 'm-3-2-1',
              code: '3.2.1',
              name: 'Institution has created an ecosystem for innovations, Indian Knowledge System (IKS), including awareness initiatives and knowledge creation.',
              metricType: 'QlM',
              weightage: 15,
              subMetrics: [
                { id: 'sm-3-2-1-a', code: '3.2.1.A', name: 'IPR / Innovation Cell constitution order and activity report', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-3-3',
          code: '3.3',
          name: 'Research Publications and Awards',
          weightage: 25,
          description: 'UGC-CARE journals, Scopus indexed papers, books, and book chapters.',
          metrics: [
            {
              id: 'm-3-3-1',
              code: '3.3.1',
              name: 'Number of research papers published per teacher in the Journals notified on UGC CARE list during the last five years.',
              metricType: 'QnM',
              weightage: 15,
              subMetrics: [
                { id: 'sm-3-3-1-a', code: '3.3.1.A', name: 'Master Excel List of Publications with DOI and UGC CARE links', isMandatory: true, evidenceTypes: ['xlsx'] },
                { id: 'sm-3-3-1-b', code: '3.3.1.B', name: 'First page / reprint copies of journal articles', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-3-4',
          code: '3.4',
          name: 'Extension Activities',
          weightage: 50,
          description: 'Neighborhood outreach, Swachh Bharat, blood donation, and village adoption programs.',
          metrics: [
            {
              id: 'm-3-4-1',
              code: '3.4.1',
              name: 'Outcomes of Extension activities in the neighborhood community in terms of impact and sensitizing the students across social issues.',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-3-4-1-a', code: '3.4.1.A', name: 'NSS/NCC Annual Activity Report with Geotagged photographs', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-4',
      code: 'Criterion 4',
      name: 'Infrastructure and Learning Resources',
      weightage: 100,
      description: 'Physical campus facilities, automated library resources, IT bandwidth, and campus maintenance.',
      indicators: [
        {
          id: 'ki-4-1',
          code: '4.1',
          name: 'Physical Facilities',
          weightage: 30,
          description: 'Classrooms, laboratories, computing equipment, and sports amenities.',
          metrics: [
            {
              id: 'm-4-1-1',
              code: '4.1.1',
              name: 'The Institution has adequate infrastructure and other facilities for teaching-learning, ICT classrooms, laboratories, computing equipment etc.',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-4-1-1-a', code: '4.1.1.A', name: 'Master Room Inventory & ICT Enabled Classroom List', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
                { id: 'sm-4-1-1-b', code: '4.1.1.B', name: 'Geotagged photos of Classrooms, Labs, and Library', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-4-3',
          code: '4.3',
          name: 'IT Infrastructure',
          weightage: 30,
          description: 'Internet bandwidth (Mbps), Wi-Fi access, and computer-student ratio.',
          metrics: [
            {
              id: 'm-4-3-1',
              code: '4.3.1',
              name: 'Institution frequently updates its IT facilities and provides sufficient bandwidth for internet connection.',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-4-3-1-a', code: '4.3.1.A', name: 'Internet Bandwidth Invoices (Showing >= 100 Mbps leased line)', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-5',
      code: 'Criterion 5',
      name: 'Student Support and Progression',
      weightage: 140,
      description: 'Government/institutional scholarships, placement of graduates, competitive exam training, and active alumni cell.',
      indicators: [
        {
          id: 'ki-5-1',
          code: '5.1',
          name: 'Student Support',
          weightage: 50,
          description: 'Government scholarship disbursements and freeships.',
          metrics: [
            {
              id: 'm-5-1-1',
              code: '5.1.1',
              name: 'Percentage of students benefited by scholarships and freeships provided by the Government / Non-Government organizations.',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'sm-5-1-1-a', code: '5.1.1.A', name: 'Government Scholarship Sanction Letters & Beneficiary Bank Lists', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
        {
          id: 'ki-5-2',
          code: '5.2',
          name: 'Student Progression',
          weightage: 40,
          description: 'Campus placement records and progression to PG/higher studies.',
          metrics: [
            {
              id: 'm-5-2-1',
              code: '5.2.1',
              name: 'Percentage of placement of outgoing students and students progressing to higher education during the last five years.',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'sm-5-2-1-a', code: '5.2.1.A', name: 'Student Placement Offer Letters (Sample 10%)', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-5-2-1-b', code: '5.2.1.B', name: 'Admission Cards / Identity Cards of Higher Studies Progression', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-6',
      code: 'Criterion 6',
      name: 'Governance, Leadership and Management',
      weightage: 100,
      description: 'Vision, e-governance implementation, staff welfare, financial audits, and IQAC quality benchmarks.',
      indicators: [
        {
          id: 'ki-6-2',
          code: '6.2',
          name: 'Strategy Development and Deployment',
          weightage: 15,
          description: 'Perspective plan deployment and e-governance in administration, finance, and admissions.',
          metrics: [
            {
              id: 'm-6-2-1',
              code: '6.2.1',
              name: 'The institutional perspective plan is effectively deployed and the functioning of the institutional bodies is evidenced by policies, administrative setup, appointment service rules.',
              metricType: 'QlM',
              weightage: 10,
              subMetrics: [
                { id: 'sm-6-2-1-a', code: '6.2.1.A', name: 'Strategic Perspective Plan Document approved by Governing Body', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-6-2-1-b', code: '6.2.1.B', name: 'Organogram and Institutional Service Rules', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-6-4',
          code: '6.4',
          name: 'Financial Management and Resource Mobilization',
          weightage: 20,
          description: 'Internal and external financial audits and resource utilization statements.',
          metrics: [
            {
              id: 'm-6-4-1',
              code: '6.4.1',
              name: 'Institution has strategies for mobilization and optimal utilization of resources and conducts financial audits regularly.',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-6-4-1-a', code: '6.4.1.A', name: 'Statutory External Audit Reports (Audited Balance Sheets by CA)', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-6-4-1-b', code: '6.4.1.B', name: 'Internal Audit Reports and Compliance letters', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-6-5',
          code: '6.5',
          name: 'Internal Quality Assurance System (IQAC)',
          weightage: 30,
          description: 'IQAC quality initiatives, review mechanisms, and incremental improvements.',
          metrics: [
            {
              id: 'm-6-5-1',
              code: '6.5.1',
              name: 'Internal Quality Assurance Cell (IQAC) has contributed significantly for institutionalizing quality assurance strategies and processes.',
              metricType: 'QlM',
              weightage: 15,
              subMetrics: [
                { id: 'sm-6-5-1-a', code: '6.5.1.A', name: 'IQAC Meeting Minutes & Action Taken Reports signed by Principal', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-6-5-1-b', code: '6.5.1.B', name: 'Annual Academic and Administrative Audit (AAA) reports', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'crit-7',
      code: 'Criterion 7',
      name: 'Institutional Values and Best Practices',
      weightage: 100,
      description: 'Green energy initiatives, waste management, gender equity, institutional best practices, and distinctiveness.',
      indicators: [
        {
          id: 'ki-7-1',
          code: '7.1',
          name: 'Institutional Values and Social Responsibilities',
          weightage: 50,
          description: 'Solar power, rainwater harvesting, barrier-free divyangjan environment, and code of conduct.',
          metrics: [
            {
              id: 'm-7-1-1',
              code: '7.1.1',
              name: 'Institution has facilities and initiatives for alternate sources of energy, energy conservation, water conservation and green campus.',
              metricType: 'QnM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-7-1-1-a', code: '7.1.1.A', name: 'Solar Panel & Sensor-based Energy Conservation Invoices & Photos', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-7-1-1-b', code: '7.1.1.B', name: 'Green Audit, Energy Audit & Environment Audit Certificates', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-7-2',
          code: '7.2',
          name: 'Best Practices',
          weightage: 30,
          description: 'Two flagship institutional best practices in standard NAAC format.',
          metrics: [
            {
              id: 'm-7-2-1',
              code: '7.2.1',
              name: 'Describe two best practices successfully implemented by the Institution as per NAAC format.',
              metricType: 'QlM',
              weightage: 30,
              subMetrics: [
                { id: 'sm-7-2-1-a', code: '7.2.1.A', name: 'Best Practice 1 Complete Report (Context, Practice, Evidence of Success)', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'sm-7-2-1-b', code: '7.2.1.B', name: 'Best Practice 2 Complete Report (Context, Practice, Evidence of Success)', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
        {
          id: 'ki-7-3',
          code: '7.3',
          name: 'Institutional Distinctiveness',
          weightage: 20,
          description: 'Performance of the institution in one area distinctive to its priority and thrust.',
          metrics: [
            {
              id: 'm-7-3-1',
              code: '7.3.1',
              name: 'Portray the performance of the Institution in one area distinctive to its priority and thrust within 1000 words.',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'sm-7-3-1-a', code: '7.3.1.A', name: 'Institutional Distinctiveness Vision Document and Impact Evidence', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------
// 2. TEMPLATE: Autonomous College (RAF - 7 Criteria Autonomous Manual)
// ---------------------------------------------------------------------------------
export const AUTONOMOUS_7_CRITERIA_TEMPLATE: NaacFrameworkProfile = {
  id: 'template-autonomous-7',
  name: 'Autonomous College Manual (7 Criteria RAF)',
  type: 'autonomous_7',
  institutionType: 'autonomous',
  editionYear: 'Autonomous RAF 2021',
  description: 'Includes Academic Autonomy, Board of Studies (BoS), Choice Based Credit System (CBCS), and examination reforms.',
  totalWeightage: 1000,
  criteria: [
    {
      id: 'auto-crit-1',
      code: 'Criterion 1',
      name: 'Curricular Aspects (Autonomous)',
      weightage: 150,
      description: 'Focuses on syllabus formulation, Board of Studies (BoS) autonomy, and industry-aligned courses.',
      indicators: [
        {
          id: 'auto-ki-1-1',
          code: '1.1',
          name: 'Curriculum Design and Development',
          weightage: 50,
          description: 'Institutional autonomy in revising curriculum based on local and global needs.',
          metrics: [
            {
              id: 'auto-m-1-1-1',
              code: '1.1.1',
              name: 'Curricula developed and implemented have relevance to the local, national, regional and global developmental needs which are reflected in Programme Outcomes (POs) and Course Outcomes (COs).',
              metricType: 'QlM',
              weightage: 20,
              subMetrics: [
                { id: 'auto-sm-1-1-1-a', code: '1.1.1.A', name: 'Academic Council and BoS Meeting Minutes Approving Syllabus', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'auto-sm-1-1-1-b', code: '1.1.1.B', name: 'PO and CO Mapping Matrix with Bloom Taxonomy levels', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
            {
              id: 'auto-m-1-1-2',
              code: '1.1.2',
              name: 'Percentage of Programmes where syllabus revision was carried out during the last five years.',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'auto-sm-1-1-2-a', code: '1.1.2.A', name: 'BoS comparative statement highlighting curriculum revision percentage', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
        {
          id: 'auto-ki-1-2',
          code: '1.2',
          name: 'Academic Flexibility (CBCS)',
          weightage: 50,
          description: 'Elective course baskets, credit transfer, and multidisciplinary programs.',
          metrics: [
            {
              id: 'auto-m-1-2-1',
              code: '1.2.1',
              name: 'Percentage of Programmes in which Choice Based Credit System (CBCS)/elective course system has been implemented.',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'auto-sm-1-2-1-a', code: '1.2.1.A', name: 'CBCS Regulation Guidelines approved by Academic Council', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'auto-crit-2',
      code: 'Criterion 2',
      name: 'Teaching-Learning and Evaluation',
      weightage: 300,
      description: 'Continuous internal assessment (CIA), question paper moderation, and examination autonomy.',
      indicators: [
        {
          id: 'auto-ki-2-5',
          code: '2.5',
          name: 'Evaluation Process and Reforms (Autonomous)',
          weightage: 60,
          description: 'Controller of Examinations (CoE) office, barcoded answer sheets, and grievance redressal.',
          metrics: [
            {
              id: 'auto-m-2-5-1',
              code: '2.5.1',
              name: 'Average number of days from the date of last semester-end examination to the declaration of results during the last five years.',
              metricType: 'QnM',
              weightage: 30,
              subMetrics: [
                { id: 'auto-sm-2-5-1-a', code: '2.5.1.A', name: 'Controller of Examinations (CoE) Annual Result Declaration Reports', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'auto-crit-3',
      code: 'Criterion 3',
      name: 'Research, Innovations and Extension',
      weightage: 150,
      description: 'Research center recognitions, seed money grants, patents, and consultancy.',
      indicators: [
        {
          id: 'auto-ki-3-1',
          code: '3.1',
          name: 'Promotion of Research and Facilities',
          weightage: 40,
          metrics: [
            {
              id: 'auto-m-3-1-1',
              code: '3.1.1',
              name: 'The institution Research facilities are recognized by affiliating university / national agencies.',
              metricType: 'QnM',
              weightage: 20,
              subMetrics: [
                { id: 'auto-sm-3-1-1-a', code: '3.1.1.A', name: 'Research Centre Recognition Letters from University', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------
// 3. TEMPLATE: Health Sciences & Medical Colleges
// ---------------------------------------------------------------------------------
export const MEDICAL_7_CRITERIA_TEMPLATE: NaacFrameworkProfile = {
  id: 'template-medical-7',
  name: 'Health Sciences & Medical College Manual',
  type: 'medical_7',
  institutionType: 'medical',
  editionYear: 'Health Sciences Manual 2021',
  description: 'Specialized NAAC framework for Medical, Dental, Nursing, Pharmacy, and Allied Health Sciences institutions with clinical training.',
  totalWeightage: 1000,
  criteria: [
    {
      id: 'med-crit-1',
      code: 'Criterion 1',
      name: 'Curricular Aspects (Health Sciences)',
      weightage: 100,
      description: 'Competency-Based Medical Education (CBME), clinical clerkship, and medical bioethics integration.',
      indicators: [
        {
          id: 'med-ki-1-1',
          code: '1.1',
          name: 'Curriculum Planning & Clinical Integration',
          weightage: 30,
          metrics: [
            {
              id: 'med-m-1-1-1',
              code: '1.1.1',
              name: 'The Institution adheres to the Competency-Based Medical/Healthcare curriculum as mandated by NMC / DCI / INC, integrating clinical skills and medical ethics.',
              metricType: 'QlM',
              weightage: 30,
              subMetrics: [
                { id: 'med-sm-1-1-1-a', code: '1.1.1.A', name: 'Clinical Skill Lab Rotation Schedules and Logbooks', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'med-sm-1-1-1-b', code: '1.1.1.B', name: 'Medical Ethics Committee Clearance & Workshop Records', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'med-crit-2',
      code: 'Criterion 2',
      name: 'Teaching-Learning and Clinical Training',
      weightage: 350,
      description: 'Bedside clinics, simulation lab training, patient-to-student ratios, and clinical posting evaluations.',
      indicators: [
        {
          id: 'med-ki-2-3',
          code: '2.3',
          name: 'Clinical and Practical Learning',
          weightage: 80,
          metrics: [
            {
              id: 'med-m-2-3-1',
              code: '2.3.1',
              name: 'Students are exposed to patient care in Hospital OPD, IPD, and Rural Health Training Centres (RHTC/UHTC) with verified clinical case logs.',
              metricType: 'QlM',
              weightage: 50,
              subMetrics: [
                { id: 'med-sm-2-3-1-a', code: '2.3.1.A', name: 'OPD / IPD Daily Census & Bed Occupancy Rate Registers', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
                { id: 'med-sm-2-3-1-b', code: '2.3.1.B', name: 'RHTC and UHTC Community Health Posting Attendance Rosters', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'med-crit-8',
      code: 'Criterion 8',
      name: 'Hospital Infrastructure & Patient Care Facilities',
      weightage: 150,
      description: 'Attached teaching hospital facilities, emergency trauma care, ICU/NICU, blood bank, and diagnostics.',
      indicators: [
        {
          id: 'med-ki-8-1',
          code: '8.1',
          name: 'Hospital Infrastructure & Clinical Material',
          weightage: 80,
          metrics: [
            {
              id: 'med-m-8-1-1',
              code: '8.1.1',
              name: 'Attached Teaching Hospital is functional with prescribed Bed Strength, ICU, Operation Theatres, Central Diagnostic Lab, and NABH accreditation.',
              metricType: 'QnM',
              weightage: 80,
              subMetrics: [
                { id: 'med-sm-8-1-1-a', code: '8.1.1.A', name: 'Hospital License, NABH/NABL Accreditation Certificates & NMC Inspection Reports', isMandatory: true, evidenceTypes: ['pdf'] },
                { id: 'med-sm-8-1-1-b', code: '8.1.1.B', name: 'Bio-Medical Waste Management Authorization from Pollution Control Board', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------
// 4. TEMPLATE: New NAAC Binary & Graded Framework 2024+ (10 Attributes)
// ---------------------------------------------------------------------------------
export const BINARY_10_ATTRIBUTES_TEMPLATE: NaacFrameworkProfile = {
  id: 'template-binary-10',
  name: 'NAAC Binary & Graded Framework (10 Attributes)',
  type: 'binary_10',
  institutionType: 'general',
  editionYear: 'Radhakrishnan Committee Reform 2024–25',
  description: 'Replaces the 7 criteria with 10 Attributes for Maturity-Based Graded Accreditation (MBGA) and Binary Accreditation (Accredited / Not-Accredited).',
  totalWeightage: 1000,
  criteria: [
    {
      id: 'attr-1',
      code: 'Attribute 1',
      name: 'Governance, Leadership & Institutional Integrity',
      weightage: 100,
      description: 'Transparency, statutory compliance, anti-corruption safeguards, and democratic leadership.',
      indicators: [
        {
          id: 'attr-ki-1-1',
          code: 'A1.1',
          name: 'Statutory Compliance and Ethical Governance',
          weightage: 50,
          metrics: [
            {
              id: 'attr-m-1-1-1',
              code: '1.1',
              name: 'Adherence to AICTE/UGC/State norms, publicly disclosed audited financials, and active grievance ombudsman.',
              metricType: 'QlM',
              weightage: 50,
              subMetrics: [
                { id: 'attr-sm-1-1-1-a', code: '1.1.A', name: 'Public Disclosure Compliance Certificate on College Portal', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-2',
      code: 'Attribute 2',
      name: 'Academic Curriculum & Pedagogical Dynamism',
      weightage: 100,
      description: 'NEP 2020 alignment, multidisciplinary flexibility, credit transfers (ABC), and digital pedagogy.',
      indicators: [
        {
          id: 'attr-ki-2-1',
          code: 'A2.1',
          name: 'NEP 2020 Alignment & Multiple Entry/Exit',
          weightage: 50,
          metrics: [
            {
              id: 'attr-m-2-1-1',
              code: '2.1',
              name: 'Academic Bank of Credits (ABC) ID generation percentage and multiple entry/exit pathways enabled.',
              metricType: 'QnM',
              weightage: 50,
              subMetrics: [
                { id: 'attr-sm-2-1-1-a', code: '2.1.A', name: 'DigiLocker ABC Registration Statistics and University circular', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-3',
      code: 'Attribute 3',
      name: 'Teaching Excellence & Faculty Competence',
      weightage: 100,
      description: 'Teacher-student ratio, faculty training programs, digital literacy, and continuous professional development.',
      indicators: [
        {
          id: 'attr-ki-3-1',
          code: 'A3.1',
          name: 'Faculty Pedagogy & Continuous Upskilling',
          weightage: 50,
          metrics: [
            {
              id: 'attr-m-3-1-1',
              code: '3.1',
              name: 'Faculty members completing annual AI/Digital/Pedagogy upskilling through Malaviya Mission / SWAYAM / NPTEL.',
              metricType: 'QnM',
              weightage: 50,
              subMetrics: [
                { id: 'attr-sm-3-1-1-a', code: '3.1.A', name: 'Faculty FDP Completion Certificates', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-4',
      code: 'Attribute 4',
      name: 'Research, Innovation & Intellectual Property',
      weightage: 120,
      description: 'High impact index publications, commercialized patents, tech transfer, and start-up incubation.',
      indicators: [
        {
          id: 'attr-ki-4-1',
          code: 'A4.1',
          name: 'IPR and Start-up Incubation',
          weightage: 60,
          metrics: [
            {
              id: 'attr-m-4-1-1',
              code: '4.1',
              name: 'Number of granted patents, design registrations, and registered student start-ups.',
              metricType: 'QnM',
              weightage: 60,
              subMetrics: [
                { id: 'attr-sm-4-1-1-a', code: '4.1.A', name: 'Patent Grant Certificates by Indian Patent Office (IPO)', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-5',
      code: 'Attribute 5',
      name: 'Extension, Outreach & Community Engagement',
      weightage: 80,
      description: 'Measurable social impact, village adoption, disaster resilience, and sustainable development goals (SDGs).',
      indicators: [
        {
          id: 'attr-ki-5-1',
          code: 'A5.1',
          name: 'Social Impact and SDG Alignment',
          weightage: 40,
          metrics: [
            {
              id: 'attr-m-5-1-1',
              code: '5.1',
              name: 'Community development programs with tangible outcomes directly contributing to UN SDGs.',
              metricType: 'QlM',
              weightage: 40,
              subMetrics: [
                { id: 'attr-sm-5-1-1-a', code: '5.1.A', name: 'Community Impact Audit and Gram Panchayat Recognition Letters', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-6',
      code: 'Attribute 6',
      name: 'Student Lifecycle Support & Employability',
      weightage: 120,
      description: 'Mentorship, mental health support, skill-gap training, median salary increments, and competitive exams.',
      indicators: [
        {
          id: 'attr-ki-6-1',
          code: 'A6.1',
          name: 'Holistic Student Support & Placements',
          weightage: 60,
          metrics: [
            {
              id: 'attr-m-6-1-1',
              code: '6.1',
              name: 'Verified placement packages (Median CTC) and competitive examination success rates.',
              metricType: 'QnM',
              weightage: 60,
              subMetrics: [
                { id: 'attr-sm-6-1-1-a', code: '6.1.A', name: 'Verified Placement CTC Summary & Employer Offer Letters', isMandatory: true, evidenceTypes: ['pdf', 'xlsx'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-7',
      code: 'Attribute 7',
      name: 'Physical & Digital Learning Infrastructure',
      weightage: 100,
      description: 'Smart classrooms, high-speed fiber connectivity, assistive tech for persons with disabilities, and e-library.',
      indicators: [
        {
          id: 'attr-ki-7-1',
          code: 'A7.1',
          name: 'Smart Infrastructure & Digital Readiness',
          weightage: 50,
          metrics: [
            {
              id: 'attr-m-7-1-1',
              code: '7.1',
              name: 'Percentage of smart interactive boards, automated LMS integration, and campus-wide Wi-Fi 6 coverage.',
              metricType: 'QnM',
              weightage: 50,
              subMetrics: [
                { id: 'attr-sm-7-1-1-a', code: '7.1.A', name: 'Smart Classroom Invoices and Wi-Fi Heatmap Certificates', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-8',
      code: 'Attribute 8',
      name: 'Financial Sustainability, Resource Mobilization & Audits',
      weightage: 100,
      description: 'Diversified revenue streams, corpus fund growth, zero audit objections, and green budget allocations.',
      indicators: [
        {
          id: 'attr-ki-8-1',
          code: 'A8.1',
          name: 'Fiscal Prudence and Corpus Reserve',
          weightage: 50,
          metrics: [
            {
              id: 'attr-m-8-1-1',
              code: '8.1',
              name: 'Audited balance sheets evidencing positive operational surplus and adequate reserve fund.',
              metricType: 'QnM',
              weightage: 50,
              subMetrics: [
                { id: 'attr-sm-8-1-1-a', code: '8.1.A', name: 'CA Audited Balance Sheets and Reserve Fund Fixed Deposit Proofs', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-9',
      code: 'Attribute 9',
      name: 'Inclusivity, Environmental Sustainability & Diversity',
      weightage: 90,
      description: 'Zero carbon footprint roadmap, inclusive gender diversity, barrier-free access, and rain-water conservation.',
      indicators: [
        {
          id: 'attr-ki-9-1',
          code: 'A9.1',
          name: 'Environmental Stewardship & Net-Zero Target',
          weightage: 45,
          metrics: [
            {
              id: 'attr-m-9-1-1',
              code: '9.1',
              name: 'Solar generation ratio, water recycling plant efficiency, and third-party certified Carbon Audit.',
              metricType: 'QnM',
              weightage: 45,
              subMetrics: [
                { id: 'attr-sm-9-1-1-a', code: '9.1.A', name: 'Carbon Audit Certificate & Solar Net Metering Invoices', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'attr-10',
      code: 'Attribute 10',
      name: 'Institutional Distinctiveness & Strategic Horizon',
      weightage: 90,
      description: 'Global rankings benchmarking, unique societal impact, and 10-year Vision 2035 strategic roadmap.',
      indicators: [
        {
          id: 'attr-ki-10-1',
          code: 'A10.1',
          name: 'Strategic Distinctiveness and National Impact',
          weightage: 45,
          metrics: [
            {
              id: 'attr-m-10-1-1',
              code: '10.1',
              name: 'Evidence of institutional distinctiveness creating benchmark outcomes recognized nationally or globally.',
              metricType: 'QlM',
              weightage: 45,
              subMetrics: [
                { id: 'attr-sm-10-1-1-a', code: '10.1.A', name: 'Institutional Distinctiveness Dossier with Third-Party Validations', isMandatory: true, evidenceTypes: ['pdf'] },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Map of all system template presets
export const NAAC_FRAMEWORK_PRESETS: Record<NaacFrameworkType, NaacFrameworkProfile> = {
  affiliated_7: AFFILIATED_7_CRITERIA_TEMPLATE,
  autonomous_7: AUTONOMOUS_7_CRITERIA_TEMPLATE,
  university_7: {
    ...AFFILIATED_7_CRITERIA_TEMPLATE,
    id: 'template-university-7',
    name: 'University Manual (7 Criteria RAF)',
    type: 'university_7',
    institutionType: 'university',
    description: 'Higher weightage on research citations, doctoral guidance, international MoUs, and incubation.',
  },
  medical_7: MEDICAL_7_CRITERIA_TEMPLATE,
  binary_10: BINARY_10_ATTRIBUTES_TEMPLATE,
  custom: {
    ...AFFILIATED_7_CRITERIA_TEMPLATE,
    id: 'template-custom',
    name: 'Custom Institutional Framework',
    type: 'custom',
    description: 'User-configured custom framework for unique departmental or state-specific accreditation requirements.',
  },
};

export type CollegeTrackId = 'affiliated' | 'autonomous' | 'medical' | 'university';
export type RegimeId = 'raf_7' | 'binary_10';

export interface CollegeTrackInfo {
  id: CollegeTrackId;
  name: string;
  badge: string;
  iconName: 'Building2' | 'GraduationCap' | 'Stethoscope' | 'Landmark';
  description: string;
  examples: string;
}

export const COLLEGE_TRACKS: CollegeTrackInfo[] = [
  {
    id: 'affiliated',
    name: 'General Affiliated College',
    badge: 'Arts, Science & Commerce',
    iconName: 'Building2',
    description: 'Colleges following university-prescribed curriculum, affiliated with a State/Central university.',
    examples: 'B.A., B.Sc., B.Com., BCA, Affiliated Engineering & Teacher Education',
  },
  {
    id: 'autonomous',
    name: 'Autonomous College',
    badge: 'Curriculum Autonomy',
    iconName: 'GraduationCap',
    description: 'Institutions with UGC autonomy to design own syllabus, Board of Studies (BoS) and conduct exams.',
    examples: 'Autonomous Engineering, Autonomous Science/Commerce Colleges',
  },
  {
    id: 'medical',
    name: 'Health Sciences & Medical',
    badge: 'Clinical & Hospital Beds',
    iconName: 'Stethoscope',
    description: 'Medical, Dental, Nursing, Pharmacy & AYUSH colleges with attached teaching hospital & patient care.',
    examples: 'MBBS, BDS, BAMS, Nursing Colleges, Allied Health Sciences',
  },
  {
    id: 'university',
    name: 'University / Deemed-to-be',
    badge: 'Research & Multi-Faculty',
    iconName: 'Landmark',
    description: 'Universities with multiple schools/faculties, doctoral research, incubation & patents.',
    examples: 'State/Central/Private Universities, Deemed Universities',
  },
];

const getTrackRegimeStorageKey = (track: CollegeTrackId, regime: RegimeId): string =>
  `naac_master_profile_${track}_${regime}`;

export function getDefaultFrameworkForTrackRegime(
  track: CollegeTrackId,
  regime: RegimeId
): NaacFrameworkProfile {
  if (regime === 'raf_7') {
    switch (track) {
      case 'autonomous':
        return AUTONOMOUS_7_CRITERIA_TEMPLATE;
      case 'medical':
        return MEDICAL_7_CRITERIA_TEMPLATE;
      case 'university':
        return NAAC_FRAMEWORK_PRESETS.university_7;
      case 'affiliated':
      default:
        return AFFILIATED_7_CRITERIA_TEMPLATE;
    }
  } else {
    // 10 Attributes Binary Framework customized per track
    const base = JSON.parse(JSON.stringify(BINARY_10_ATTRIBUTES_TEMPLATE)) as NaacFrameworkProfile;
    const trackNames: Record<CollegeTrackId, string> = {
      affiliated: 'General Affiliated College (10 Attributes Binary)',
      autonomous: 'Autonomous College (10 Attributes Binary)',
      medical: 'Health Sciences & Medical (10 Attributes Binary)',
      university: 'University / Deemed (10 Attributes Binary)',
    };
    base.name = trackNames[track] || base.name;
    base.institutionType = track;
    return base;
  }
}

export function getTrackRegimeFramework(
  track: CollegeTrackId,
  regime: RegimeId
): NaacFrameworkProfile {
  if (typeof window === 'undefined') return getDefaultFrameworkForTrackRegime(track, regime);
  try {
    const raw = localStorage.getItem(getTrackRegimeStorageKey(track, regime));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.criteria)) {
        return parsed as NaacFrameworkProfile;
      }
    }
  } catch (err) {
    console.warn(`[NAAC Framework] Failed to load track regime framework for ${track}_${regime}:`, err);
  }
  return JSON.parse(JSON.stringify(getDefaultFrameworkForTrackRegime(track, regime)));
}

export function saveTrackRegimeFramework(
  track: CollegeTrackId,
  regime: RegimeId,
  profile: NaacFrameworkProfile
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getTrackRegimeStorageKey(track, regime), JSON.stringify(profile));
    window.dispatchEvent(
      new CustomEvent('naac-track-framework-updated', { detail: { track, regime, profile } })
    );
  } catch (err) {
    console.error(`[NAAC Framework] Failed to save track regime framework for ${track}_${regime}:`, err);
  }
}

export function resetTrackRegimeFramework(
  track: CollegeTrackId,
  regime: RegimeId
): NaacFrameworkProfile {
  if (typeof window === 'undefined') return getDefaultFrameworkForTrackRegime(track, regime);
  try {
    localStorage.removeItem(getTrackRegimeStorageKey(track, regime));
    const clean = JSON.parse(JSON.stringify(getDefaultFrameworkForTrackRegime(track, regime)));
    saveTrackRegimeFramework(track, regime, clean);
    return clean;
  } catch (err) {
    return JSON.parse(JSON.stringify(getDefaultFrameworkForTrackRegime(track, regime)));
  }
}

// ---------------------------------------------------------------------------------
// STORAGE & LOCAL PERSISTENCE HELPERS (100% Client-Side LocalStorage)
// ---------------------------------------------------------------------------------

const getStorageKey = (cycleId: string): string => `naac_framework_master_${cycleId}`;

/**
 * Get active framework for a given Cycle.
 * Falls back to LocalStorage custom edits, then to the requested preset type, then Affiliated.
 */
export function getActiveFrameworkForCycle(
  cycleId: string,
  preferredType: NaacFrameworkType = 'affiliated_7'
): NaacFrameworkProfile {
  if (typeof window === 'undefined') return NAAC_FRAMEWORK_PRESETS[preferredType];

  try {
    const raw = localStorage.getItem(getStorageKey(cycleId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.criteria)) {
        return parsed as NaacFrameworkProfile;
      }
    }
  } catch (err) {
    console.warn(`[NAAC Framework] Failed to load framework for cycle ${cycleId}:`, err);
  }

  // Fallback to preset
  const preset = NAAC_FRAMEWORK_PRESETS[preferredType] || AFFILIATED_7_CRITERIA_TEMPLATE;
  // Deep clone so in-memory changes don't mutate the const template
  return JSON.parse(JSON.stringify(preset));
}

/**
 * Save user custom edits for a cycle to LocalStorage
 */
export function saveFrameworkForCycle(cycleId: string, profile: NaacFrameworkProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(cycleId), JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent('naac-framework-updated', { detail: { cycleId, profile } }));
  } catch (err) {
    console.error(`[NAAC Framework] Failed to save framework for cycle ${cycleId}:`, err);
  }
}

/**
 * Reset a cycle's framework back to official NAAC system defaults
 */
export function resetFrameworkToDefault(cycleId: string, type: NaacFrameworkType = 'affiliated_7'): NaacFrameworkProfile {
  if (typeof window === 'undefined') return NAAC_FRAMEWORK_PRESETS[type];
  try {
    localStorage.removeItem(getStorageKey(cycleId));
    const cleanPreset = JSON.parse(JSON.stringify(NAAC_FRAMEWORK_PRESETS[type]));
    saveFrameworkForCycle(cycleId, cleanPreset);
    return cleanPreset;
  } catch (err) {
    return JSON.parse(JSON.stringify(NAAC_FRAMEWORK_PRESETS[type]));
  }
}

/**
 * Export framework profile as a downloadable JSON string
 */
export function exportFrameworkToJson(profile: NaacFrameworkProfile): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Import a framework from JSON string into a cycle
 */
export function importFrameworkFromJson(jsonStr: string, cycleId: string): NaacFrameworkProfile {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || !Array.isArray(parsed.criteria)) {
    throw new Error('Invalid NAAC Framework JSON: missing criteria array');
  }
  const validatedProfile: NaacFrameworkProfile = {
    id: parsed.id || `framework-imported-${Date.now()}`,
    name: parsed.name || 'Imported NAAC Framework',
    type: parsed.type || 'custom',
    institutionType: parsed.institutionType || 'general',
    editionYear: parsed.editionYear || 'Custom Import',
    description: parsed.description || 'Custom framework imported from external JSON',
    totalWeightage: typeof parsed.totalWeightage === 'number' ? parsed.totalWeightage : 1000,
    criteria: parsed.criteria,
  };
  saveFrameworkForCycle(cycleId, validatedProfile);
  return validatedProfile;
}

/**
 * List of available framework presets for selection dropdowns
 */
export const AVAILABLE_FRAMEWORK_PRESETS = [
  {
    type: 'affiliated_7' as NaacFrameworkType,
    name: 'General Affiliated College (7 Criteria RAF)',
    tag: 'Standard',
    criteriaCount: 7,
    weightage: 1000,
    description: 'Standard NAAC RAF for general colleges affiliated with a university.',
  },
  {
    type: 'autonomous_7' as NaacFrameworkType,
    name: 'Autonomous College Manual (7 Criteria)',
    tag: 'Autonomous',
    criteriaCount: 7,
    weightage: 1000,
    description: 'Board of Studies (BoS), academic autonomy, CBCS, and examination governance.',
  },
  {
    type: 'medical_7' as NaacFrameworkType,
    name: 'Health Sciences & Medical College Manual',
    tag: 'Medical / Dental',
    criteriaCount: 8,
    weightage: 1000,
    description: 'Clinical skill labs, hospital bed occupancy, RHTC/UHTC patient logs, and bioethics.',
  },
  {
    type: 'binary_10' as NaacFrameworkType,
    name: 'NAAC Binary & Graded Framework (10 Attributes)',
    tag: '2024–25 Reform',
    criteriaCount: 10,
    weightage: 1000,
    description: 'Radhakrishnan Committee recommendations: 10 Attributes for Binary Accreditation & MBGA.',
  },
];
