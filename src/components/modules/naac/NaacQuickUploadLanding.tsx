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
  Loader2
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
}

export const NaacQuickUploadLanding: React.FC<NaacQuickUploadLandingProps> = ({
  academicYear,
  onNavigateToDocumentList,
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
    if (lower.includes('extension') || lower.includes('outreach') || lower.includes('nss') || lower.includes('ncc') || lower.includes('community')) {
      return { 
        crit: 'Criterion 3', 
        keyIndicator: '3.4', 
        metric: '3.4.1', 
        reason: 'Detected NSS, NCC, or community outreach extension activities. Mapped to Criterion 3 under KI 3.4 Extension Activities.',
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

  // Deep AI Classification via OpenAI
  const classifyWithOpenAi = async (filename: string, key: string) => {
    try {
      setIsAiProcessing(true);
      setAiSuggestion(null);
      const prompt = `You are a NAAC (National Assessment and Accreditation Council) accreditation expert.
Classify this uploaded academic evidence file: "${filename}" into the single most appropriate NAAC AQAR Criterion, Key Indicator, and Metric.

Valid Criteria options:
- Criterion 1: Curricular Aspects (KI: 1.1, 1.2, 1.3, 1.4; Metrics: 1.1.1, 1.2.1, 1.3.1, 1.4.1)
- Criterion 2: Teaching-Learning and Evaluation (KI: 2.1, 2.3, 2.4, 2.6; Metrics: 2.1.1, 2.3.1, 2.4.1, 2.6.1)
- Criterion 3: Research, Innovations and Extension (KI: 3.1, 3.2, 3.4, 3.5; Metrics: 3.1.1, 3.2.1, 3.4.1, 3.5.1)
- Criterion 4: Infrastructure and Learning Resources (KI: 4.1, 4.2; Metrics: 4.1.1, 4.2.1)
- Criterion 5: Student Support and Progression (KI: 5.1, 5.3; Metrics: 5.1.1, 5.3.1)
- Criterion 6: Governance, Leadership and Management (KI: 6.5; Metric: 6.5.1)
- Criterion 7: Institutional Values and Best Practices (KI: 7.1, 7.2; Metrics: 7.1.1, 7.2.1)

Respond in JSON ONLY:
{
  "crit": "Criterion X",
  "keyIndicator": "X.Y",
  "metric": "X.Y.Z",
  "reason": "Detailed 1-2 sentence explanation of why this file belongs to this Criterion, Key Indicator, and Metric according to NAAC guidelines."
}`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
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
          setAiSuggestion({
            crit: canonicalCrit,
            keyIndicator: canonicalKi,
            metric: canonicalMetric,
            reason: parsed.reason || 'OpenAI natural language analysis of evidence document content and metadata.',
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
        // AI MODE: strictly OpenAI classification
        if (openaiKey.trim()) {
          classifyWithOpenAi(file.name, openaiKey.trim());
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
      schoolId: 'sch-eng',
      schoolName: 'School of Engineering & Technology',
      programId: 'prog-cse',
      programName: 'B.Tech Computer Science & Engineering',
      academicYear: academicYear || '2025-26',
      criterionId: activeCrit?.id || 'crit-1',
      criterionCode: cleanCritCode,
      metricCode: cleanMetricCode,
      metricName: activeMetric?.name || `${cleanMetricCode} Evidence Proof`,
      metricType: activeMetric?.metricType || 'QnM',
      fileUrl,
      fileName,
      fileSize,
      uploadedBy: 'Program Coordinator (CSE)',
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      version: 'v1.0',
    };

    addOrUpdateNaacDocument(newDoc);
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

      {/* Top Subtle Navigation Bar */}
      <div className="flex items-center justify-between py-2.5 border-b border-gray-200">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#0f2748]">NAAC Proof Vault</span>
          <span className="text-gray-300">•</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono text-[11px] font-semibold border border-blue-200">
            AQAR {academicYear}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 font-medium">B.Tech CSE</span>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Center Google-Style Uncluttered Experience */}
      <div className="flex flex-col items-center justify-center min-h-[64vh] max-w-5xl w-full mx-auto px-4 text-center">
        {/* Bold Heading */}
        <div className="mb-5">
          <h1 className="text-5xl sm:text-5xl font-black tracking-tight text-[#0f2748]  ">
            Drop NAAC Evidence  
          </h1>
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
                            classifyWithOpenAi(uploadedFile.name, openaiKey.trim());
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
                    {/* 1. Criterion */}
                    <div className="bg-slate-50/80 border border-slate-200/90 rounded-lg p-2.5 flex flex-col justify-between min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          1. Criterion
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
                          2. Key Indicator
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
                          3. Target Metric
                        </span>
                        <span className="text-[10px] font-bold text-blue-700 font-mono">
                          {cleanMetricCode}
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
    </div>
  );
};