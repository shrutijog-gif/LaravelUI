export interface NaacCriterion {
  id: string;
  code: string;
  name: string;
  indicators: Array<{
    code: string;
    name: string;
    metricType: 'QnM' | 'QlM'; // Quantitative vs Qualitative Metric
  }>;
}

export const naacCriteriaList: NaacCriterion[] = [
  {
    id: 'crit-1',
    code: 'Criterion 1',
    name: 'Curricular Aspects',
    indicators: [
      { code: '1.1.1', name: 'Curricular Planning and Implementation', metricType: 'QlM' },
      { code: '1.2.1', name: 'Academic Flexibility & Choice Based Credit System (CBCS)', metricType: 'QnM' },
      { code: '1.3.1', name: 'Integration of Cross-cutting issues (Gender, Environment, Ethics)', metricType: 'QlM' },
      { code: '1.4.1', name: 'Structured Feedback System (Students, Teachers, Alumni)', metricType: 'QnM' },
    ],
  },
  {
    id: 'crit-2',
    code: 'Criterion 2',
    name: 'Teaching-Learning and Evaluation',
    indicators: [
      { code: '2.1.1', name: 'Enrolment Percentage and Student Allocation', metricType: 'QnM' },
      { code: '2.3.1', name: 'Student-Centric Methods (Experiential, Participative & Problem-Solving)', metricType: 'QlM' },
      { code: '2.4.1', name: 'Full-time Teachers and Faculty Quality Credentials', metricType: 'QnM' },
      { code: '2.6.1', name: 'Programme Outcomes (PO) and Course Outcomes (CO) Attainment', metricType: 'QlM' },
    ],
  },
  {
    id: 'crit-3',
    code: 'Criterion 3',
    name: 'Research, Innovations and Extension',
    indicators: [
      { code: '3.1.1', name: 'Grants and Resource Mobilization for Research Projects', metricType: 'QnM' },
      { code: '3.2.1', name: 'Ecosystem for Innovations and Knowledge Transfer', metricType: 'QlM' },
      { code: '3.4.1', name: 'Extension Activities in Neighborhood Community & NSS/NCC', metricType: 'QnM' },
      { code: '3.5.1', name: 'MoUs, Institutional Collaborations & Linkages', metricType: 'QnM' },
    ],
  },
  {
    id: 'crit-4',
    code: 'Criterion 4',
    name: 'Infrastructure and Learning Resources',
    indicators: [
      { code: '4.1.1', name: 'Adequacy of Physical Facilities (Classrooms, Labs, ICT)', metricType: 'QlM' },
      { code: '4.2.1', name: 'Library as a Learning Resource & E-Journals Access', metricType: 'QnM' },
      { code: '4.3.1', name: 'IT Infrastructure, Bandwidth & Digital Classrooms', metricType: 'QnM' },
    ],
  },
  {
    id: 'crit-5',
    code: 'Criterion 5',
    name: 'Student Support and Progression',
    indicators: [
      { code: '5.1.1', name: 'Government and Institutional Scholarships & Freeships', metricType: 'QnM' },
      { code: '5.2.1', name: 'Placement of Outgoing Students & Higher Education Progression', metricType: 'QnM' },
      { code: '5.3.1', name: 'Awards/Medals in Sports & Cultural Activities', metricType: 'QnM' },
    ],
  },
  {
    id: 'crit-6',
    code: 'Criterion 6',
    name: 'Governance, Leadership and Management',
    indicators: [
      { code: '6.2.1', name: 'Perspective Plan and Institutional Governance Structure', metricType: 'QlM' },
      { code: '6.3.1', name: 'Welfare Schemes for Teaching and Non-Teaching Staff', metricType: 'QnM' },
      { code: '6.5.1', name: 'Internal Quality Assurance Cell (IQAC) Quality Initiatives', metricType: 'QlM' },
    ],
  },
  {
    id: 'crit-7',
    code: 'Criterion 7',
    name: 'Institutional Values and Best Practices',
    indicators: [
      { code: '7.1.1', name: 'Gender Equity and Solar/Green Energy Facilities', metricType: 'QnM' },
      { code: '7.2.1', name: 'Institutional Best Practices', metricType: 'QlM' },
      { code: '7.3.1', name: 'Institutional Distinctiveness', metricType: 'QlM' },
    ],
  },
];
