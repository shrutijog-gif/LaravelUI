import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FolderOpen, 
  ArrowRight, 
  ExternalLink, 
  Trash2, 
  Eye, 
  EyeOff,
  KeyRound,
  Search, 
  Clock, 
  ShieldCheck, 
  Check, 
  Layers, 
  Calendar, 
  X, 
  FileCheck2, 
  HardDrive, 
  ChevronRight, 
  Plus, 
  SlidersHorizontal, 
  Mic, 
  Camera,
  ChevronDown,
  Lightbulb,
  Info,
  Loader2,
  Send
} from 'lucide-react';
import { 
  NAAC_CRITERIA_SUMMARY, 
  NAAC_METRICS_LIST, 
  KEY_INDICATORS,
  NaacEvidenceDocument, 
  getStoredNaacDocuments, 
  addOrUpdateNaacDocument, 
  deleteNaacDocument 
} from '../../../data/naacDmsData';
import { openFileInNewTab } from '../../../utils/fileHelper';

export interface NaacQuickUploadLandingProps {
  academicYear: string;
  onNavigateToDocumentList: (critCode?: string, metricCode?: string) => void;
  // Role & Scope Customization
  role?: 'program' | 'school' | 'university';
  levelBadgeText?: string;
  portalTitle?: string;
  portalSubtitle?: string;
  headingTitle?: string;
  schoolId?: string;
  schoolName?: string;
  programId?: string;
  programName?: string;
  uploaderName?: string;
  submitTargetName?: string;
  initialSeedDocIds?: string[];
  storageKeySuffix?: string;
  topBarLeftSlot?: React.ReactNode;
  hideTopUploadButton?: boolean;
}

export const NaacQuickUploadLanding: React.FC<NaacQuickUploadLandingProps> = ({
  academicYear,
  onNavigateToDocumentList,
  role = 'program',
  levelBadgeText,
  portalTitle,
  portalSubtitle,
  headingTitle,
  schoolId,
  schoolName,
  programId,
  programName,
  uploaderName,
  submitTargetName,
  initialSeedDocIds,
  storageKeySuffix,
  topBarLeftSlot,
  hideTopUploadButton = false,
}) => {
  const [documents, setDocuments] = useState<NaacEvidenceDocument[]>(() => getStoredNaacDocuments());
  const [isDragging, setIsDragging] = useState(false);
  const [isBarDragging, setIsBarDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [documentDescription, setDocumentDescription] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Google Bar & AI Mode state
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState<boolean>(false);

  // Filter state for recent uploads list
  const [searchQuery, setSearchQuery] = useState('');
  const [criterionFilter, setCriterionFilter] = useState<string>('ALL');

  // My Documents Drawer state & tracking
  const [isMyDocsDrawerOpen, setIsMyDocsDrawerOpen] = useState<boolean>(false);
  const myDocsStorageKey = `naac_my_uploaded_doc_ids_${storageKeySuffix || role || 'v3'}`;
  const [myDocIds, setMyDocIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(myDocsStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    if (initialSeedDocIds && initialSeedDocIds.length > 0) {
      return initialSeedDocIds;
    }
    if (role === 'school') {
      return ['naac-doc-2', 'naac-cse-fac-5', 'naac-cse-fac-5-b', 'naac-cse-fac-3'];
    }
    if (role === 'university') {
      return ['naac-doc-4', 'naac-doc-2', 'naac-cse-fac-5'];
    }
    // Default program coordinator
    return [
      'naac-cse-fac-5',
      'naac-cse-fac-5-b',
      'naac-cse-fac-5-c',
      'naac-cse-fac-5-d',
      'naac-cse-fac-5-e',
      'naac-cse-fac-1',
      'naac-cse-fac-1-b',
      'naac-cse-fac-3',
      'naac-cse-fac-2',
      'naac-cse-fac-4',
    ];
  });

  const myDocuments = documents.filter((doc) => myDocIds.includes(doc.id));

  const isDocSubmitted = (doc: NaacEvidenceDocument) =>
    doc.status === 'submitted_to_school' ||
    doc.status === 'approved_by_school' ||
    doc.status === 'university_verified';

  const unsubmittedDocs = myDocuments.filter((d) => !isDocSubmitted(d));

  // Selection state for submitting documents to coordinator (default unchecked)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === unsubmittedDocs.length && unsubmittedDocs.length > 0) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(unsubmittedDocs.map((d) => d.id));
    }
  };

  const handleToggleSelectDoc = (docId: string) => {
    const doc = myDocuments.find((d) => d.id === docId);
    if (doc && isDocSubmitted(doc)) return;

    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // Sync documents from storage
  const refreshDocuments = () => {
    setDocuments(getStoredNaacDocuments());
  };

  // Destination Target State (Criterion, Key Indicator, Metric) — Defaults to Criterion 1 for manual
  const [selectedCriterionCode, setSelectedCriterionCode] = useState<string>('Criterion 1');
  const [selectedKeyIndicatorCode, setSelectedKeyIndicatorCode] = useState<string>('1.1');
  const [selectedMetricCode, setSelectedMetricCode] = useState<string>('1.1.1');
  const [isChangeOpen, setIsChangeOpen] = useState<boolean>(false);
  const [isAiBoxOpen, setIsAiBoxOpen] = useState<boolean>(false);

  // OpenAI Integration State (Default OFF per user requirement)
  const [useAi, setUseAi] = useState<boolean>(false);
  const [openaiKey, setOpenaiKey] = useState<string>(() => localStorage.getItem('openai_api_key') || '');
  const [showOpenaiKey, setShowOpenaiKey] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Canonical helpers to prevent string mismatch across OpenAI, rules, and UI selects
  const toCanonicalCrit = (val: string) => {
    const m = val?.match(/Criterion\s*(\d)/i) || val?.match(/(\d)/);
    return m ? `Criterion ${m[1]}` : 'Criterion 1';
  };
  const toCanonicalKi = (val: string) => {
    const m = val?.match(/(\d+\.\d+)/);
    return m ? m[1] : '1.1';
  };
  const toCanonicalMetric = (val: string) => {
    const m = val?.match(/(\d+\.\d+\.\d+)/);
    return m ? m[1] : '1.1.1';
  };

  // Robust clean Criterion number and codes
  const cleanCritCode = toCanonicalCrit(selectedCriterionCode);
  const cleanKiCode = toCanonicalKi(selectedKeyIndicatorCode);
  const cleanMetricCode = toCanonicalMetric(selectedMetricCode);

  const currentCriterion = NAAC_CRITERIA_SUMMARY.find(
    (c) => c.code.toLowerCase() === cleanCritCode.toLowerCase()
  ) || NAAC_CRITERIA_SUMMARY[0];

  const availableKeyIndicators = KEY_INDICATORS.filter(
    (ki) => ki.criterionCode.toLowerCase() === cleanCritCode.toLowerCase()
  );
  const currentKeyIndicator = KEY_INDICATORS.find(
    (ki) => ki.code === cleanKiCode
  ) || availableKeyIndicators[0];

  const availableMetrics = NAAC_METRICS_LIST.filter(
    (m) => m.criterionCode.toLowerCase() === cleanCritCode.toLowerCase()
  );
  const currentMetric = NAAC_METRICS_LIST.find((m) => m.code === cleanMetricCode) || availableMetrics[0];

  // When criterion changes, auto-select corresponding Key Indicator and Metric
  const handleCriterionChange = (critCode: string) => {
    const canonical = toCanonicalCrit(critCode);
    setSelectedCriterionCode(canonical);
    const kis = KEY_INDICATORS.filter(
      (ki) => ki.criterionCode.toLowerCase() === canonical.toLowerCase()
    );
    const newKiCode = kis[0]?.code || '1.1';
    setSelectedKeyIndicatorCode(newKiCode);

    const metricsForCrit = NAAC_METRICS_LIST.filter(
      (m) => m.criterionCode.toLowerCase() === canonical.toLowerCase()
    );
    const matchingMetric = metricsForCrit.find(m => m.code.startsWith(newKiCode)) || metricsForCrit[0];
    if (matchingMetric) {
      setSelectedMetricCode(matchingMetric.code);
    }
  };

  // When key indicator changes, auto-select first matching metric
  const handleKeyIndicatorChange = (kiCode: string) => {
    const canonical = toCanonicalKi(kiCode);
    setSelectedKeyIndicatorCode(canonical);
    const matchingMetrics = availableMetrics.filter(m => m.code.startsWith(canonical));
    if (matchingMetrics.length > 0) {
      setSelectedMetricCode(matchingMetrics[0].code);
    }
  };

  // When metric changes, auto-sync parent key indicator
  const handleMetricChange = (metricCode: string) => {
    const canonical = toCanonicalMetric(metricCode);
    setSelectedMetricCode(canonical);
    const parts = canonical.split('.');
    if (parts.length >= 2) {
      const parentKi = `${parts[0]}.${parts[1]}`;
      setSelectedKeyIndicatorCode(parentKi);
    }
  };

  // Smart AI Metric Suggestion based on file name
  const getAiSuggestion = (filename: string): { crit: string; keyIndicator: string; metric: string; reason: string; source: 'rule-engine' } => {
    const lower = filename.toLowerCase();
    if (lower.includes('syllabus') || lower.includes('curriculum') || lower.includes('lesson') || lower.includes('timetable')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.1', 
        metric: '1.1.1', 
        reason: 'Detected curriculum design & syllabus planning terminology. Mapped to Criterion 1 (Curricular Aspects) under KI 1.1 Curricular Planning and Delivery.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('elective') || lower.includes('cbcs')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.2', 
        metric: '1.2.1', 
        reason: 'Detected elective course / CBCS academic flexibility terms. Mapped to Criterion 1 under KI 1.2 Academic Flexibility.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('enrichment') || lower.includes('value added')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.3', 
        metric: '1.3.1', 
        reason: 'Detected value-added and curriculum enrichment course content. Mapped to Criterion 1 under KI 1.3 Curriculum Enrichment.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('feedback') || lower.includes('atr') || lower.includes('stakeholder')) {
      return { 
        crit: 'Criterion 1', 
        keyIndicator: '1.4', 
        metric: '1.4.1', 
        reason: 'Detected stakeholder feedback and Action Taken Report (ATR) documentation. Mapped to Criterion 1 under KI 1.4 Feedback System.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('enroll') || lower.includes('admission') || lower.includes('student') || lower.includes('intake')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.1', 
        metric: '2.1.1', 
        reason: 'Detected student admissions, sanctioned intake, and enrolment records. Mapped to Criterion 2 (Teaching-Learning & Evaluation) under KI 2.1 Student Enrolment.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('experiential') || lower.includes('visit') || lower.includes('project') || lower.includes('lab manual')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.3', 
        metric: '2.3.1', 
        reason: 'Detected student-centric experiential learning, industrial visits, or laboratory projects. Mapped to Criterion 2 under KI 2.3 Teaching-Learning Process.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('phd') || lower.includes('faculty') || lower.includes('teacher') || lower.includes('credentials')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.4', 
        metric: '2.4.1', 
        reason: 'Detected faculty credentials, Ph.D. degrees, and full-time teacher qualifications. Mapped to Criterion 2 under KI 2.4 Teacher Profile and Quality.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('outcome') || lower.includes('po') || lower.includes('co') || lower.includes('attainment')) {
      return { 
        crit: 'Criterion 2', 
        keyIndicator: '2.6', 
        metric: '2.6.1', 
        reason: 'Detected Program Outcomes (POs) and Course Outcomes (COs) attainment mapping. Mapped to Criterion 2 under KI 2.6 Student Performance & Learning Outcomes.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('grant') || lower.includes('research') || lower.includes('fund') || lower.includes('seed')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.1', 
        metric: '3.1.1', 
        reason: 'Detected research grant sanctions, funding allocations, or seed money awards. Mapped to Criterion 3 (Research, Innovations & Extension) under KI 3.1 Resource Mobilization.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('incubat') || lower.includes('innovat') || lower.includes('startup') || lower.includes('hackathon')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.2', 
        metric: '3.2.1', 
        reason: 'Detected innovation ecosystem, startup incubation center, or hackathon proofs. Mapped to Criterion 3 under KI 3.2 Innovation Ecosystem.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('extension') || lower.includes('outreach') || lower.includes('nss') || lower.includes('ncc') || lower.includes('community') || lower.includes('blood') || lower.includes('donation') || lower.includes('camp') || lower.includes('red cross') || lower.includes('swachh') || lower.includes('village') || lower.includes('health') || lower.includes('clinic')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.4', 
        metric: '3.4.1', 
        reason: 'Detected Blood Donation Camp, NSS/NCC, or community outreach extension activity. Mapped to Criterion 3 (Research, Innovations & Extension) under KI 3.4 Extension Activities (Metric 3.4.1).',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('mou') || lower.includes('collaborat') || lower.includes('industry') || lower.includes('linkage')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.5', 
        metric: '3.5.1', 
        reason: 'Detected formal MoUs, corporate collaborations, and industry linkages. Mapped to Criterion 3 under KI 3.5 Collaboration & Linkages.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('lab') || lower.includes('ict') || lower.includes('facility') || lower.includes('classroom') || lower.includes('infrastructure')) {
      return { 
        crit: 'Criterion 4', 
        keyIndicator: '4.1', 
        metric: '4.1.1', 
        reason: 'Detected ICT-enabled classrooms, laboratory facilities, and physical infrastructure records. Mapped to Criterion 4 (Infrastructure) under KI 4.1 Physical Facilities.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('library') || lower.includes('book') || lower.includes('journal') || lower.includes('ieee') || lower.includes('springer')) {
      return { 
        crit: 'Criterion 4', 
        keyIndicator: '4.2', 
        metric: '4.2.1', 
        reason: 'Detected library automated resources, e-journal subscriptions, and books catalog. Mapped to Criterion 4 under KI 4.2 Library as a Learning Resource.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('scholarship') || lower.includes('freeship') || lower.includes('support')) {
      return { 
        crit: 'Criterion 5', 
        keyIndicator: '5.1', 
        metric: '5.1.1', 
        reason: 'Detected government scholarships, institutional freeships, and student financial aid. Mapped to Criterion 5 (Student Support & Progression) under KI 5.1 Student Support.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('sport') || lower.includes('cultural') || lower.includes('award') || lower.includes('event')) {
      return { 
        crit: 'Criterion 5', 
        keyIndicator: '5.3', 
        metric: '5.3.1', 
        reason: 'Detected sports medals, cultural festival participation, and competitive student awards. Mapped to Criterion 5 under KI 5.3 Student Participation.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('iqac') || lower.includes('formation') || lower.includes('audit') || lower.includes('quality') || lower.includes('minutes')) {
      return { 
        crit: 'Criterion 6', 
        keyIndicator: '6.5', 
        metric: '6.5.1', 
        reason: 'Detected IQAC quality reviews, academic audit reports, or IQAC meeting minutes. Mapped to Criterion 6 (Governance) under KI 6.5 Internal Quality Assurance System.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('gender') || lower.includes('equity') || lower.includes('safety') || lower.includes('icc')) {
      return { 
        crit: 'Criterion 7', 
        keyIndicator: '7.1', 
        metric: '7.1.1', 
        reason: 'Detected gender equity promotion, campus safety initiatives, or ICC records. Mapped to Criterion 7 (Institutional Values) under KI 7.1 Institutional Values.',
        source: 'rule-engine' 
      };
    }
    if (lower.includes('green') || lower.includes('best practice') || lower.includes('sustainability') || lower.includes('case study')) {
      return { 
        crit: 'Criterion 7', 
        keyIndicator: '7.2', 
        metric: '7.2.1', 
        reason: 'Detected green campus initiatives, environment audits, or institutional best practice case studies. Mapped to Criterion 7 under KI 7.2 Best Practices.',
        source: 'rule-engine' 
      };
    }
    return { 
      crit: 'Criterion 6', 
      keyIndicator: '6.5', 
      metric: '6.5.1', 
      reason: 'General academic/administrative evidence. Mapped to Criterion 6 (Governance & Quality Assurance) for institutional audit review.',
      source: 'rule-engine' 
    };
  };

  const [aiSuggestion, setAiSuggestion] = useState<{ 
    crit: string; 
    keyIndicator: string; 
    metric: string; 
    reason: string; 
    source?: 'openai' | 'rule-engine';
  } | null>(null);

  // Deep AI Classification via OpenAI with Multimodal Vision & NAAC Framework Knowledge
  const classifyWithOpenAi = async (filename: string, key: string, fileDataUrl?: string) => {
    try {
      setIsAiProcessing(true);
      setAiSuggestion(null);

      const isImage = !!(fileDataUrl && (
        fileDataUrl.startsWith('data:image/jpeg') || 
        fileDataUrl.startsWith('data:image/png') || 
        fileDataUrl.startsWith('data:image/webp') || 
        fileDataUrl.startsWith('data:image/jpg') ||
        fileDataUrl.startsWith('data:image/gif')
      ));

      const prompt = `You are a Senior NAAC (National Assessment and Accreditation Council) Accreditation Assessor and Quality Assurance Specialist.

TASK:
Classify this uploaded academic evidence file into the single most appropriate NAAC AQAR Criterion, Key Indicator, and Metric.
File name: "${filename}"

${isImage ? 'NOTE: An image of the evidence document or event photograph is attached. INSPECT THE VISUAL CONTENTS CAREFULLY (read all visible text, banners, certificates, posters, Red Cross / NSS / university logos, doctors/donors, and context) to identify what institutional event or record this represents.' : 'Analyze the filename, extension, and institutional context.'}

OFFICIAL NAAC CRITERIA & METRIC GUIDANCE:
- Criterion 1: Curricular Aspects
  * KI 1.1 Curricular Planning (1.1.1 BoS minutes, lesson plans, timetables)
  * KI 1.2 Academic Flexibility (1.2.1 CBCS electives)
  * KI 1.3 Curriculum Enrichment (1.3.1 Cross-cutting values, 1.3.2 Value-added courses, 1.3.3 Field projects & Internships)
  * KI 1.4 Feedback System (1.4.1 Stakeholder feedback ATR)

- Criterion 2: Teaching-Learning and Evaluation
  * KI 2.1 Enrolment (2.1.1 Intake sanctions)
  * KI 2.2 Student Diversity (2.2.1 Remedial teaching)
  * KI 2.3 Teaching-Learning Process (2.3.1 Experiential / problem-solving methods)
  * KI 2.4 Teacher Profile (2.4.1 Faculty Ph.D./NET credentials)
  * KI 2.5 Evaluation Process (2.5.1 Internal assessment reforms)
  * KI 2.6 Learning Outcomes (2.6.1 PO/CO attainment analysis)
  * KI 2.7 Student Satisfaction Survey (2.7.1 SSS reports)

- Criterion 3: Research, Innovations and Extension
  * KI 3.1 Resource Mobilization for Research (3.1.1 Government & corporate research grants)
  * KI 3.2 Innovation Ecosystem (3.2.1 Incubation center, start-ups & hackathons, 3.2.2 IPR workshops)
  * KI 3.3 Research Publications (3.3.1 UGC CARE/Scopus journal papers, 3.3.2 Books & edited volumes)
  * KI 3.4 Extension Activities & Social Responsibility:
    - Metric 3.4.1: Extension and outreach programs conducted in community development through NSS, NCC, Red Cross, YRC, Blood Donation Camps, Swachh Bharat, Medical & Health Clinics, Village Adoption.
    - Metric 3.4.2: Awards and recognitions received for extension activities from government or recognized bodies.
  * KI 3.5 Collaboration & Linkages (3.5.1 MoUs with industry, corporations, and foreign universities)

- Criterion 4: Infrastructure and Learning Resources
  * KI 4.1 Physical Facilities (4.1.1 Smart classrooms, labs, seminar halls, 4.1.2 Sports & gym)
  * KI 4.2 Library as a Learning Resource (4.2.1 ILMS software, e-journal subscriptions IEEE/Springer)
  * KI 4.3 IT Infrastructure (4.3.1 Wi-Fi bandwidth, firewall, 4.3.2 Student-computer ratio)
  * KI 4.4 Campus Maintenance (4.4.1 Physical maintenance AMC & audited balance sheets)

- Criterion 5: Student Support and Progression
  * KI 5.1 Student Support (5.1.1 Scholarships & freeships, 5.1.2 Soft skills training, 5.1.3 Competitive exam coaching GATE/GRE)
  * KI 5.2 Student Progression (5.2.1 Campus placement offer letters, 5.2.2 Higher education admissions)
  * KI 5.3 Student Participation (5.3.1 Sports & cultural awards, 5.3.2 Student council)
  * KI 5.4 Alumni Engagement (5.4.1 Alumni association activities & contributions)

- Criterion 6: Governance, Leadership and Management
  * KI 6.1 Institutional Vision (6.1.1 Perspective plan)
  * KI 6.2 Strategy Deployment (6.2.1 Organogram, 6.2.3 E-governance ERP implementation)
  * KI 6.3 Faculty Empowerment (6.3.1 Staff welfare, 6.3.2 Conference financial aid, 6.3.3 FDP programs)
  * KI 6.4 Financial Management (6.4.1 CA audited statements & institutional budgets)
  * KI 6.5 Internal Quality Assurance System (6.5.1 IQAC quality audits, accreditation reviews, ATR)

- Criterion 7: Institutional Values and Best Practices
  * KI 7.1 Institutional Values (7.1.1 Gender equity, 7.1.2 Green campus, solar energy & waste management)
  * KI 7.2 Best Practices (7.2.1 Institutional institutionalized best practices)
  * KI 7.3 Institutional Distinctiveness (7.3.1 Flagship institutional distinctiveness)

CRITICAL RULE FOR SOCIAL / COMMUNITY / HEALTH ACTIVITIES:
Any evidence of Blood Donation Camps, Health Checkup Drives, NSS/NCC Rallies, Village Outreach, or Social Service MUST be categorized under:
- Criterion: "Criterion 3"
- Key Indicator: "3.4"
- Metric: "3.4.1"

If the filename is generic (e.g. "download.jpg", "image.png", "scan.pdf"), infer the event from the image text/visuals and generate a concise, professional title (e.g. "Blood Donation Camp - NSS Community Outreach").

Respond in JSON ONLY:
{
  "crit": "Criterion 3",
  "keyIndicator": "3.4",
  "metric": "3.4.1",
  "suggestedTitle": "Professional Descriptive Title for the Document",
  "reason": "Detailed 1-2 sentence explanation connecting the visual/text evidence to this specific NAAC Criterion, Key Indicator, and Metric."
}`;

      // Build multimodal payload
      const userContent: any[] = [
        { type: "text", text: prompt }
      ];

      if (isImage && fileDataUrl) {
        userContent.push({
          type: "image_url",
          image_url: {
            url: fileDataUrl,
            detail: "low"
          }
        });
      }

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: userContent }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const parsed = JSON.parse(json.choices[0].message.content);
        if (parsed.crit && parsed.keyIndicator && parsed.metric) {
          const canonicalCrit = toCanonicalCrit(parsed.crit);
          const canonicalKi = toCanonicalKi(parsed.keyIndicator);
          const canonicalMetric = toCanonicalMetric(parsed.metric);

          setSelectedCriterionCode(canonicalCrit);
          setSelectedKeyIndicatorCode(canonicalKi);
          setSelectedMetricCode(canonicalMetric);

          // If filename is generic and AI provides a title, auto-populate the document title
          if (parsed.suggestedTitle) {
            const rawName = filename.toLowerCase();
            if (rawName.startsWith('download') || rawName.startsWith('image') || rawName.startsWith('img') || rawName.startsWith('photo') || rawName.startsWith('scan') || rawName.startsWith('file')) {
              setDocumentTitle(parsed.suggestedTitle);
            }
          }

          setAiSuggestion({
            crit: canonicalCrit,
            keyIndicator: canonicalKi,
            metric: canonicalMetric,
            reason: parsed.reason || 'OpenAI Vision & Natural Language analysis of evidence document content and metadata.',
            source: 'openai',
          });
          setIsAiBoxOpen(true);
          setSuccessToast(`✨ OpenAI analyzed & classified into ${canonicalCrit} › KI ${canonicalKi} › Metric ${canonicalMetric}`);
          setTimeout(() => setSuccessToast(null), 4000);
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}: OpenAI classification request failed.`;
        setAiSuggestion({
          crit: selectedCriterionCode,
          keyIndicator: selectedKeyIndicatorCode,
          metric: selectedMetricCode,
          reason: `OpenAI Notice: ${errMsg}. Please check your API key below or use manual selection.`,
          source: 'rule-engine',
        });
        setSuccessToast(`OpenAI: ${errMsg}`);
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (err: any) {
      console.warn('OpenAI classification error, fallback remains active:', err);
      setAiSuggestion({
        crit: selectedCriterionCode,
        keyIndicator: selectedKeyIndicatorCode,
        metric: selectedMetricCode,
        reason: 'Unable to complete AI analysis due to a network or connection issue. You can select target destination manually.',
        source: 'rule-engine',
      });
    } finally {
      setIsAiProcessing(false);
    }
  };

  // File drop / select handler
  const processFile = (file: File) => {
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = (e.target?.result as string) || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        dataUrl,
      });

      // Auto-set title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentTitle(cleanName);

      if (useAi) {
        // AI MODE: OpenAI classification with Vision support
        if (openaiKey.trim()) {
          classifyWithOpenAi(file.name, openaiKey.trim(), dataUrl);
        } else {
          setIsAiBoxOpen(true);
          setAiSuggestion({
            crit: selectedCriterionCode,
            keyIndicator: selectedKeyIndicatorCode,
            metric: selectedMetricCode,
            reason: 'AI Mode is active. Enter your OpenAI API Key to classify this evidence document, or use manual selection.',
            source: 'openai',
          });
        }
      } else {
        // STRICTLY MANUAL MODE: Clean fresh start at Criterion 1 without retaining stale history
        setSelectedCriterionCode('Criterion 1');
        setSelectedKeyIndicatorCode('1.1');
        setSelectedMetricCode('1.1.1');
        setAiSuggestion(null);
        setIsAiBoxOpen(false);
        setIsChangeOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Real-time title typing and AI metric suggestion
  const handleTitleInput = (val: string) => {
    setDocumentTitle(val);
    if (isAiMode && val.trim().length > 3) {
      const sug = getAiSuggestion(val);
      if (sug) {
        setAiSuggestion(sug);
      }
    }
  };

  // Google Bar Drag & Drop Handlers
  const handleBarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(true);
  };

  const handleBarDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(false);
  };

  const handleBarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsBarDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Speech / Mic click handler
  const handleMicClick = () => {
    setIsListening(true);
    setSuccessToast('🎤 Listening for voice note / document title...');
    setTimeout(() => {
      setIsListening(false);
      if (!documentTitle.trim()) {
        const sample = 'Approved Syllabus Revision & CBCS Handout 2025-26';
        handleTitleInput(sample);
        setSuccessToast(`🎙️ Voice transcribed: "${sample}"`);
        setTimeout(() => setSuccessToast(null), 3500);
      }
    }, 1500);
  };

  // Explicit AI Auto-Tag Trigger
  const handleTriggerAutoTag = () => {
    const textToCheck = uploadedFile?.name || documentTitle;
    if (!textToCheck.trim()) {
      setSuccessToast('Please enter a document title or attach a file to auto-tag.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }
    const sug = getAiSuggestion(textToCheck);
    if (sug) {
      handleCriterionChange(sug.crit);
      setSelectedMetricCode(sug.metric);
      setSuccessToast(`AI Auto-Tagged to ${sug.crit} → Metric ${sug.metric} (${sug.reason})`);
      setTimeout(() => setSuccessToast(null), 4000);
    } else {
      setSuccessToast('AI scanned document. Please select target criterion manually.');
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    handleCriterionChange(aiSuggestion.crit);
    setSelectedMetricCode(aiSuggestion.metric);
    setAiSuggestion(null);
  };

  // Confirm and Drop Evidence Document into Repository
  const handleConfirmAndDrop = () => {
    if (!uploadedFile) {
      fileInputRef.current?.click();
      return;
    }

    setIsSubmitting(true);

    const activeCrit = NAAC_CRITERIA_SUMMARY.find((c) => c.code.toLowerCase() === cleanCritCode.toLowerCase()) || NAAC_CRITERIA_SUMMARY[0];
    const activeMetric = NAAC_METRICS_LIST.find((m) => m.code === cleanMetricCode) || availableMetrics[0];

    const fileUrl = uploadedFile.dataUrl;
    const fileName = uploadedFile.name;
    const docTitle = documentTitle.trim() || uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const fileSize = uploadedFile.size;

    const newDoc: NaacEvidenceDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle,
      description: `Ingested NAAC evidence for ${cleanCritCode} › Key Indicator ${cleanKiCode} › Metric ${cleanMetricCode}.`,
      schoolId: schoolId || 'sch-tech',
      schoolName: schoolName || 'School of Technology & Computer Engineering',
      programId: programId || (role === 'school' ? 'school-common' : role === 'university' ? 'univ-master' : 'prog-cse'),
      programName: programName || (role === 'school' ? 'School Level Evidence' : role === 'university' ? 'Central Institutional Evidence' : 'B.Tech Computer Science & Engineering'),
      academicYear: academicYear || '2025-26',
      criterionId: activeCrit?.id || 'crit-1',
      criterionCode: cleanCritCode,
      metricCode: cleanMetricCode,
      metricName: activeMetric?.name || `${cleanMetricCode} Evidence Proof`,
      metricType: activeMetric?.metricType || 'QnM',
      fileUrl,
      fileName,
      fileSize,
      uploadedBy: uploaderName || (role === 'school' ? 'Dean (School Coordinator)' : role === 'university' ? 'IQAC Central Committee' : 'Program Coordinator (CSE)'),
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      version: 'v1.0',
    };

    addOrUpdateNaacDocument(newDoc);
    const updatedMyDocIds = [newDoc.id, ...myDocIds];
    setMyDocIds(updatedMyDocIds);
    setSelectedDocIds((prev) => [newDoc.id, ...prev]);
    localStorage.setItem(myDocsStorageKey, JSON.stringify(updatedMyDocIds));
    refreshDocuments();

    setSuccessToast(`Document "${fileName}" confirmed & dropped into ${cleanCritCode} › KI ${cleanKiCode} › Metric ${cleanMetricCode}!`);
    setTimeout(() => setSuccessToast(null), 5000);

    // Reset Form
    setUploadedFile(null);
    setDocumentTitle('');
    setDocumentDescription('');
    setSelectedCriterionCode('Criterion 1');
    setSelectedKeyIndicatorCode('1.1');
    setSelectedMetricCode('1.1.1');
    setAiSuggestion(null);
    setIsChangeOpen(false);
    setIsSubmitting(false);
  };

  // Submit selected documents to Coordinator / University / Archive
  const handleSubmitToCoordinator = () => {
    const docsToSubmit = myDocuments.filter((doc) => selectedDocIds.includes(doc.id));
    if (docsToSubmit.length === 0) {
      setSuccessToast('Please select at least one document to submit.');
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    const nextStatus = role === 'school'
      ? 'approved_by_school'
      : role === 'university'
      ? 'university_verified'
      : 'submitted_to_school';

    const targetLabel = submitTargetName || (role === 'school' ? 'University Coordinator' : role === 'university' ? 'Permanent SSR Archive' : 'Program Coordinator');

    docsToSubmit.forEach((doc) => {
      addOrUpdateNaacDocument({
        ...doc,
        status: nextStatus,
        coordinatorReviewStatus: role === 'program' ? 'pending_review' : doc.coordinatorReviewStatus,
        schoolReviewedBy: role === 'school' ? (uploaderName || 'Dean (School Coordinator)') : doc.schoolReviewedBy,
        schoolReviewedAt: role === 'school' ? new Date().toISOString() : doc.schoolReviewedAt,
        universityVerifiedBy: role === 'university' ? (uploaderName || 'IQAC Central Committee') : doc.universityVerifiedBy,
        universityVerifiedAt: role === 'university' ? new Date().toISOString() : doc.universityVerifiedAt,
      });
    });
    setSelectedDocIds([]);
    refreshDocuments();
    setSuccessToast(`✨ Successfully submitted ${docsToSubmit.length} selected document${docsToSubmit.length === 1 ? '' : 's'} to ${targetLabel}!`);
    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Delete document from my documents
  const handleDeleteMyDoc = (docId: string, title: string) => {
    if (window.confirm(`Delete evidence file "${title}"?`)) {
      deleteNaacDocument(docId);
      const updated = myDocIds.filter((id) => id !== docId);
      setMyDocIds(updated);
      setSelectedDocIds((prev) => prev.filter((id) => id !== docId));
      localStorage.setItem(myDocsStorageKey, JSON.stringify(updated));
      refreshDocuments();
      setSuccessToast(`Deleted "${title}" from uploaded documents.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  // View Complete Document Repository
  const handleViewCompleteRepository = () => {
    setIsMyDocsDrawerOpen(false);
    onNavigateToDocumentList();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleConfirmAndDrop();
  };

  // Delete handler
  const handleDelete = (docId: string, title: string) => {
    if (window.confirm(`Delete evidence file "${title}"?`)) {
      deleteNaacDocument(docId);
      refreshDocuments();
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.metricCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.criterionCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCriterion = criterionFilter === 'ALL' || doc.criterionCode === criterionFilter;
    return matchesSearch && matchesCriterion;
  });

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 animate-in slide-in-from-top-2 border border-emerald-600">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <div className="text-xs font-medium">
            {successToast}
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessToast(null)} 
            className="ml-2 text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navigation Bar: Single Unified Line */}
      <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
        {topBarLeftSlot ? (
          /* One Unified Line: Parent Desk Action Tabs on Left */
          <div className="flex items-center gap-3">
            {topBarLeftSlot}
          </div>
        ) : (
          /* Default Left Branding */
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="font-bold text-[#0f2748]">NAAC Proof Vault</span>
            <span className="text-gray-300">•</span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border border-blue-200">
              AQAR {academicYear}
            </span>
            {portalTitle && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-700 font-semibold">{portalTitle}</span>
              </>
            )}
            {levelBadgeText && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                role === 'university' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                role === 'school' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                {levelBadgeText}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* My Documents Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsMyDocsDrawerOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-lg shadow-2xs border border-slate-300 inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Open My Uploaded Documents Drawer"
          >
            <FolderOpen className={`w-3.5 h-3.5 ${role === 'program' ? 'text-emerald-600' : 'text-blue-600'}`} />
            <span>My Documents</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${
              role === 'program' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              {myDocuments.length}
            </span>
          </button>

          {role !== 'program' && role !== 'school' && role !== 'university' && !hideTopUploadButton && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-[#0f2748] hover:bg-[#183963] text-white font-bold text-xs rounded-lg shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload Document</span>
            </button>
          )}

          {topBarLeftSlot && (
            <span className={`px-2.5 py-1 rounded font-mono text-xs font-semibold border ${
              role === 'program' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              role === 'university' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              'bg-blue-50 text-blue-700 border-blue-200'
            }`}>
              AQAR {academicYear}
            </span>
          )}

          {!topBarLeftSlot && (
            <button
              type="button"
              onClick={() => onNavigateToDocumentList()}
              className="text-xs font-semibold text-[#0f2748] hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Master Repository Document List"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>Master Repository</span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                {documents.length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Center Google-Style Uncluttered Experience */}
      <div className="flex flex-col items-center justify-center min-h-[64vh] max-w-5xl w-full mx-auto px-4 text-center">
        {/* Bold Heading */}
        <div className="mb-5">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#0f2748]">
            {headingTitle || 'Drop NAAC Evidence'}
          </h1>
          {portalSubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium max-w-lg mx-auto">
              {portalSubtitle}
            </p>
          )}
        </div>

        {/* Google-Style Upload Bar Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!uploadedFile ? (
            /* EMPTY STATE: Capsule Upload Bar (Clickable Everywhere) */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleBarDragOver}
              onDragLeave={handleBarDragLeave}
              onDrop={handleBarDrop}
              className={`relative flex items-center bg-white border rounded-full px-4 py-2.5 sm:px-5 sm:py-3 transition-all shadow-[0_2px_14px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_26px_rgba(0,0,0,0.12)] cursor-pointer w-full max-w-4xl mx-auto ${
                isBarDragging
                  ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50/50 scale-[1.005]'
                  : 'border-gray-300 hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100/60'
              }`}
            >
              {/* VERY LEFT INSIDE DROP AREA: Enable AI Checkbox */}
              <div className="flex items-center shrink-0 pr-2.5 border-r border-gray-200 mr-2.5">
                <label
                  htmlFor="enable-ai-inside-bar"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold select-none cursor-pointer transition-all ${
                    useAi
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                  }`}
                  title="Toggle AI Parsing. When off, destination selection is strictly manual."
                >
                  <input
                    id="enable-ai-inside-bar"
                    type="checkbox"
                    checked={useAi}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setUseAi(checked);
                    }}
                    className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]"
                  />
                  <Sparkles className={`w-3.5 h-3.5 ${useAi ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                  <span>Enable AI</span>
                </label>
              </div>

              {/* Empty State Text */}
              <div className="flex items-center justify-between w-full min-w-0">
                <span className="text-xs sm:text-sm text-gray-500 font-medium select-none truncate">
                  Drop evidence file here or click anywhere to upload...
                </span>
                <div className="flex items-center gap-2 shrink-0 pl-2">
                  {useAi ? (
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs select-none">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>AI Active</span>
                    </span>
                  ) : (
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-medium flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 select-none">
                      <span>Manual Mode</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* UPLOADED FILE STATE: SINGLE UNIFIED CARD BOX (Replaces capsule bar so behind box is hidden) */
            <div
              onDragOver={handleBarDragOver}
              onDragLeave={handleBarDragLeave}
              onDrop={handleBarDrop}
              className={`w-full max-w-4xl mx-auto bg-white border-2 rounded-2xl p-4 sm:p-5 shadow-lg text-left transition-all animate-in fade-in zoom-in-95 ${
                isBarDragging ? 'border-blue-500 ring-4 ring-blue-100 bg-blue-50/30' : 'border-blue-200/90'
              }`}
            >
              {/* Box Top Header: Enable AI Checkbox, File Chip, and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                {/* Left: Enable AI + Attached File Chip */}
                <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                  <label
                    htmlFor="enable-ai-card-box"
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold select-none cursor-pointer transition-all shrink-0 ${
                      useAi
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
                    }`}
                    title="Toggle AI Parsing"
                  >
                    <input
                      id="enable-ai-card-box"
                      type="checkbox"
                      checked={useAi}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUseAi(checked);
                        if (checked) {
                          setIsChangeOpen(false);
                          if (uploadedFile && openaiKey.trim()) {
                            classifyWithOpenAi(uploadedFile.name, openaiKey.trim(), uploadedFile.dataUrl);
                          }
                        } else {
                          // Carry over AI suggestion destination into manual dropdowns if available
                          if (aiSuggestion) {
                            setSelectedCriterionCode(toCanonicalCrit(aiSuggestion.crit));
                            setSelectedKeyIndicatorCode(toCanonicalKi(aiSuggestion.keyIndicator));
                            setSelectedMetricCode(toCanonicalMetric(aiSuggestion.metric));
                          }
                          setAiSuggestion(null);
                          setIsChangeOpen(true);
                        }
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]"
                    />
                    <Sparkles className={`w-3.5 h-3.5 ${useAi ? 'text-amber-600 fill-amber-500' : 'text-gray-400'}`} />
                    <span>Enable AI</span>
                  </label>

                  <div className="h-4 w-px bg-gray-200 hidden sm:block shrink-0" />

                  {/* Attached Document File Chip (Subtle Rounded-Full Pill) */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/90 border border-blue-200 text-blue-900 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors shadow-2xs min-w-0"
                    title="Click to replace attached file"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate max-w-[200px] font-medium">{uploadedFile.name}</span>
                    <span className="text-[10px] text-blue-500 font-normal shrink-0">({uploadedFile.size})</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setSelectedCriterionCode('Criterion 1');
                        setSelectedKeyIndicatorCode('1.1');
                        setSelectedMetricCode('1.1.1');
                        setAiSuggestion(null);
                        setIsChangeOpen(false);
                        setIsAiBoxOpen(false);
                      }}
                      className="text-blue-400 hover:text-red-600 ml-1 cursor-pointer p-0.5 rounded hover:bg-blue-200/50"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 justify-end">
                  {useAi && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isChangeOpen && aiSuggestion) {
                          // Switching from Auto to Manual: strictly carry over the AI suggestion
                          setSelectedCriterionCode(toCanonicalCrit(aiSuggestion.crit));
                          setSelectedKeyIndicatorCode(toCanonicalKi(aiSuggestion.keyIndicator));
                          setSelectedMetricCode(toCanonicalMetric(aiSuggestion.metric));
                        }
                        setIsChangeOpen(!isChangeOpen);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer"
                      title={isChangeOpen ? 'Return to AI Suggestion' : 'Manually change Criterion, KI, or Metric'}
                    >
                      {isChangeOpen ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Back to AI</span>
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal className="w-3.5 h-3.5 text-gray-600" />
                          <span>Change</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirmAndDrop();
                    }}
                    disabled={isSubmitting || isAiProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0f2748] hover:bg-[#183963] active:scale-[0.98] shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
                    title={isAiProcessing ? 'AI is analyzing evidence document...' : 'Confirm destination and drop document into repository'}
                  >
                    {isAiProcessing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-blue-300 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        <span>Confirm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Box Body: EITHER AI Reasoning OR Manual Selectors in the exact same box */}
              {isChangeOpen || !useAi ? (
                /* VIEW A: Manual Destination Selectors */
                <div className="pt-3 animate-in fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                      Select Target Destination
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                      Manual Selection
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Criterion */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        1. Criterion
                      </label>
                      <select
                        value={cleanCritCode}
                        onChange={(e) => handleCriterionChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {NAAC_CRITERIA_SUMMARY.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}: {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Key Indicator */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        2. Key Indicator
                      </label>
                      <select
                        value={cleanKiCode}
                        onChange={(e) => handleKeyIndicatorChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {availableKeyIndicators.map((ki) => (
                          <option key={ki.code} value={ki.code}>
                            KI {ki.code}: {ki.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Metric */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">
                        3. Metric
                      </label>
                      <select
                        value={cleanMetricCode}
                        onChange={(e) => handleMetricChange(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white text-gray-800 shadow-2xs hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        {availableKeyIndicators.map((ki) => {
                          const metricsInKi = availableMetrics.filter((m) => m.code.startsWith(ki.code));
                          if (metricsInKi.length === 0) return null;
                          return (
                            <optgroup key={ki.code} label={`KI ${ki.code}: ${ki.name}`}>
                              {metricsInKi.map((m) => (
                                <option key={m.code} value={m.code}>
                                  {m.code} ({m.metricType}) — {m.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Manual Target Summary: Compact Pathway */}
                  <div className="mt-2.5 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* 1. Criterion */}
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Criterion
                          </span>
                          <span className="text-[10px] font-bold text-[#0f2748] font-mono">
                            {cleanCritCode}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentCriterion.name}>
                          {currentCriterion.name}
                        </p>
                      </div>

                      {/* 2. Key Indicator */}
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Key Indicator
                          </span>
                          <span className="text-[10px] font-bold text-gray-700 font-mono">
                            KI {cleanKiCode}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentKeyIndicator?.name}>
                          {currentKeyIndicator?.name || `KI ${cleanKiCode}`}
                        </p>
                      </div>

                      {/* 3. Metric */}
                      <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Selected Metric
                          </span>
                          <span className="text-[10px] font-bold text-blue-700 font-mono">
                            Metric {cleanMetricCode}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentMetric?.name}>
                          {currentMetric?.name || `Metric ${cleanMetricCode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : isAiProcessing ? (
                /* AI ANALYZING LOADER: Sleek Spinner Icon (No progress bar) */
                <div className="py-2.5 px-3 my-1 bg-slate-50/90 border border-slate-200/90 rounded-xl flex items-center justify-center gap-3 text-left animate-in fade-in">
                  <div className="w-7 h-7 rounded-lg bg-[#0f2748] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900">
                        AI Analyzing Evidence Document...
                      </span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100/90 border border-blue-200 px-2 py-0.2 rounded-full animate-pulse">
                        Matching NAAC Criteria
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      Evaluating file context, attributes & title against AQAR Criteria and Metrics...
                    </p>
                  </div>
                </div>
              ) : (
                /* VIEW B: Auto AI Classification Display */
                <div className="pt-3 animate-in fade-in space-y-2.5">
                  {/* Top sub-header: Label + Provider Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
                        AI Destination Pathway
                      </span>
                    </div>
                    {aiSuggestion?.source === 'openai' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full shadow-2xs">
                        <Sparkles className="w-3 h-3 text-emerald-600 fill-emerald-500" />
                        <span>OpenAI GPT-4o-mini</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-full shadow-2xs">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>NAAC AI Rule Engine</span>
                      </span>
                    )}
                  </div>

                  {/* 3 Light Gray Boxes: Identical style to Manual panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Criterion */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Criterion
                        </span>
                        <span className="text-[10px] font-bold text-[#0f2748] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200/90 shadow-2xs">
                          {cleanCritCode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentCriterion.name}>
                        {currentCriterion.name}
                      </p>
                    </div>

                    {/* Key Indicator */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Key Indicator
                        </span>
                        <span className="text-[10px] font-bold text-gray-700 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200/90 shadow-2xs">
                          KI {cleanKiCode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentKeyIndicator?.name}>
                        {currentKeyIndicator?.name || `KI ${cleanKiCode}`}
                      </p>
                    </div>

                    {/* Metric */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Target Metric
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 font-mono bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                          Metric {cleanMetricCode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug" title={currentMetric?.name}>
                        {currentMetric?.name || `Metric ${cleanMetricCode}`}
                      </p>
                    </div>
                  </div>

                  {/* Integrated AI Reasoning in Light Blue */}
                  {aiSuggestion?.reason && (
                    <div className="bg-blue-50/80 border border-blue-100/90 rounded-lg p-2.5 flex items-start gap-2 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-950 leading-relaxed font-normal">
                        <span className="font-semibold text-blue-900">Reasoning: </span>
                        {aiSuggestion.reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* OpenAI Pass Key Below Drop Area */}
          {useAi && (
            <div className="flex items-center justify-center pt-3 animate-in fade-in slide-in-from-top-1">
              <div className="inline-flex items-center gap-2.5 bg-white/95 border border-gray-200/90 rounded-full px-4 py-1.5 shadow-2xs text-xs">
                <KeyRound className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <span className="text-gray-600 font-semibold text-[11px] shrink-0">OpenAI API Key:</span>
                <div className="relative flex items-center">
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOpenaiKey(val);
                      localStorage.setItem('openai_api_key', val);
                    }}
                    placeholder="sk-..."
                    className="text-xs pl-2.5 pr-7 py-0.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-300 focus:border-blue-500 rounded-lg outline-hidden font-mono w-[180px] sm:w-[220px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    className="absolute right-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    title={showOpenaiKey ? 'Hide key' : 'Show key'}
                  >
                    {showOpenaiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                {openaiKey.trim() && (
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-bold shrink-0">
                    Key Saved
                  </span>
                )}
                {isAiProcessing && (
                  <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-semibold animate-pulse shrink-0">
                    Analyzing...
                  </span>
                )}
              </div>
            </div>
          )}
        </form>

        
      </div>

      {/* Criteria Guidelines Modal */}
      {isGuidelinesOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">NAAC Criteria & Evidence Guidelines</h3>
                  <p className="text-[11px] text-gray-500">Official AQAR evidence requirements for 7 core criteria</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 divide-y divide-gray-100">
              {NAAC_CRITERIA_SUMMARY.map((crit) => (
                <div key={crit.code} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {crit.code}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{crit.name}</span>
                      <span className="text-[10px] text-gray-400 font-medium">({crit.weightage} pts)</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      {crit.code === 'Criterion 1' && 'Approved syllabi, BoS minutes, timetable copies, CBCS handouts, curriculum feedback reports.'}
                      {crit.code === 'Criterion 2' && 'Enrolment lists, faculty Ph.D notifications, teacher awards, mentor-mentee records, evaluation schedules.'}
                      {crit.code === 'Criterion 3' && 'Government/industry research grants, seed money sanctions, UGC Care journal publications, signed MoUs.'}
                      {crit.code === 'Criterion 4' && 'Smart classroom geo-tagged photos, LMS portal audit, central library books & e-journals subscription proof.'}
                      {crit.code === 'Criterion 5' && 'Institutional scholarships, competitive exam coaching attendance, student council activities, placement letters.'}
                      {crit.code === 'Criterion 6' && 'Vision/mission documents, IQAC meeting minutes with ATR, CAS promotion files, audited balance sheets.'}
                      {crit.code === 'Criterion 7' && 'Gender audit reports, solar/rainwater plant photos, green campus initiatives, best practice case studies.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCriterionChange(crit.code);
                      setIsGuidelinesOpen(false);
                      setSuccessToast(`Switched target to ${crit.code}`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded border border-blue-200 cursor-pointer transition-colors"
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGuidelinesOpen(false)}
                className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MY DOCUMENTS RIGHT-SIDE DRAWER
          Shows criteria-wise document list with:
          - Submit to Program Coordinator button
          - View Complete Document Repository button
         ========================================================================= */}
      {isMyDocsDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMyDocsDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
            <div className="w-screen max-w-3xl bg-white shadow-2xl border-l border-gray-200 flex flex-col pointer-events-auto animate-in slide-in-from-right duration-200">
              {/* Drawer Header: Plain white, no icon, no description */}
              <div className="px-5 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold text-gray-900">My Uploaded Documents</h3>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                    {myDocuments.length}
                  </span>
                  {selectedDocIds.length > 0 && (
                    <span className="text-[11px] text-blue-700 font-semibold bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded-full">
                      {selectedDocIds.length} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMyDocsDrawerOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                  title="Close Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Body: One continuous table */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {myDocuments.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">No documents uploaded yet</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Drop evidence files on the main screen to ingest them criteria-wise.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMyDocsDrawerOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 px-4 py-1.5 bg-[#0f2748] text-white text-xs font-semibold rounded-lg hover:bg-[#183963] cursor-pointer"
                    >
                      Upload File Now
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
         
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                          <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <th className="py-2 px-3 w-9 text-center">
                              <input
                                type="checkbox"
                                checked={unsubmittedDocs.length > 0 && selectedDocIds.length === unsubmittedDocs.length}
                                disabled={unsubmittedDocs.length === 0}
                                onChange={handleToggleSelectAll}
                                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 accent-[#0f2748]"
                                title={
                                  unsubmittedDocs.length === 0
                                    ? 'All documents are already submitted'
                                    : 'Select all unsubmitted documents'
                                }
                              />
                            </th>
                            <th className="py-2 px-3 whitespace-nowrap">Metric</th>
                            <th className="py-2 px-3">File Name</th>
                            <th className="py-2 px-3 text-center whitespace-nowrap">Status</th>
                            <th className="py-2 px-3 text-right whitespace-nowrap">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {NAAC_CRITERIA_SUMMARY.map((crit) => {
                            const docsInCrit = myDocuments.filter(
                              (d) =>
                                d.criterionCode?.toLowerCase() === crit.code.toLowerCase() ||
                                toCanonicalCrit(d.criterionCode || '').toLowerCase() === crit.code.toLowerCase()
                            );
                            if (docsInCrit.length === 0) return null;

                            return (
                              <React.Fragment key={crit.code}>
                                {/* Criterion Group Subheader Row */}
                                <tr className="bg-slate-50/80 border-y border-slate-200/80">
                                  <td colSpan={5} className="py-1.5 px-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-mono text-[10px] font-bold text-[#0f2748] bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                          {crit.code}
                                        </span>
                                        <span className="text-[11px] font-bold text-gray-800 truncate" title={crit.name}>
                                          {crit.name}
                                        </span>
                                      </div>
                                      <span className="text-[10px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
                                        {docsInCrit.length} {docsInCrit.length === 1 ? 'doc' : 'docs'}
                                      </span>
                                    </div>
                                  </td>
                                </tr>

                                {/* Documents under this Criterion: Checkbox -> Metric -> File Name -> Status -> Action */}
                                {docsInCrit.map((doc) => {
                                  const isChecked = selectedDocIds.includes(doc.id);
                                  const isSubmitted =
                                    doc.status === 'submitted_to_school' ||
                                    doc.status === 'approved_by_school' ||
                                    doc.status === 'university_verified';

                                  return (
                                    <tr
                                      key={doc.id}
                                      className={`hover:bg-blue-50/30 transition-colors group ${
                                        isChecked ? 'bg-blue-50/20' : ''
                                      }`}
                                    >
                                      {/* 1. Checkbox */}
                                      <td className="py-2 px-3 text-center align-middle">
                                        <input
                                          type="checkbox"
                                          checked={!isSubmitted && isChecked}
                                          disabled={isSubmitted}
                                          onChange={() => !isSubmitted && handleToggleSelectDoc(doc.id)}
                                          className={`w-3.5 h-3.5 rounded shrink-0 transition-opacity ${
                                            isSubmitted
                                              ? 'opacity-25 cursor-not-allowed bg-gray-200 accent-gray-400'
                                              : 'text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0f2748]'
                                          }`}
                                          title={isSubmitted ? 'Already submitted' : `Select "${doc.fileName}"`}
                                        />
                                      </td>

                                      {/* 2. Metric (FIRST) */}
                                      <td className="py-2 px-3 align-middle whitespace-nowrap">
                                        <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                          {doc.metricCode}
                                        </span>
                                      </td>

                                      {/* 3. File Name (single clean line, no subtitle) */}
                                      <td className="py-2 px-3 align-middle">
                                        <div
                                          onClick={() => openFileInNewTab(doc.fileUrl)}
                                          className="font-medium text-gray-800 group-hover:text-blue-700 cursor-pointer truncate text-xs"
                                          title={doc.fileName}
                                        >
                                          {doc.fileName}
                                        </div>
                                      </td>

                                      {/* 4. Status: strictly two states - either blank or submitted */}
                                      <td className="py-2 px-3 align-middle text-center whitespace-nowrap">
                                        {isSubmitted ? (
                                          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            Submitted
                                          </span>
                                        ) : null}
                                      </td>

                                      {/* 5. Action */}
                                      <td className="py-2 px-3 align-middle text-right whitespace-nowrap">
                                        <div className="inline-flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => openFileInNewTab(doc.fileUrl)}
                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                                            title="View Document"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteMyDoc(doc.id, doc.fileName || doc.title)}
                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
                                            title="Delete from My Documents"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-200 shrink-0">
                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleSubmitToCoordinator}
                  disabled={selectedDocIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0f2748] hover:bg-[#183963] active:scale-[0.99] shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title={
                    selectedDocIds.length === 0
                      ? 'Select at least one document to submit'
                      : `Submit ${selectedDocIds.length} selected document(s)`
                  }
                >
                  <Send className="w-3.5 h-3.5 text-blue-200" />
                  <span>Submit</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};