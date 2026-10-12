import { JobOpening, JobApplicant } from '../types/careers';

export const INITIAL_JOB_OPENINGS: JobOpening[] = [
  {
    id: 'job-1',
    title: 'Lead Generation Executive',
    experience: 'Fresher',
    department: 'Sales & Marketing',
    location: 'Pune, India',
    jobType: 'Full-Time',
    workplaceType: 'In-Office',
    skills: ['Lead Generation', 'Market Research', 'Communication Skills', 'Email Outreach'],
    qualifications: ["Bachelor's Degree in Marketing / BBA / Any Graduate", 'Good verbal English'],
    description: `<h3>Lead Generation Executive (Fresher)</h3>
<p><strong>Location:</strong> In-Office, Pune</p>
<p><strong>Job Type:</strong> Full-Time | Entry-Level</p>
<p><strong>Overview:</strong> We are seeking an enthusiastic, results-driven Lead Generation Executive to identify and nurture prospective client relationships. You will research industry sectors, connect with key decision-makers, and maintain an organized outreach pipeline.</p>
<h4>Key Responsibilities:</h4>
<ul>
  <li>Conduct market research to identify potential corporate and institutional clients.</li>
  <li>Execute cold emails, LinkedIn networking, and phone outreach to generate qualified leads.</li>
  <li>Maintain and update lead statuses in CRM with detailed notes.</li>
  <li>Collaborate closely with the Sales & Marketing leadership on campaign goals.</li>
</ul>`,
    showOnWebsite: true,
    createdAt: '2026-09-18',
  },
  {
    id: 'job-2',
    title: 'Field Sales Executive',
    experience: '2+',
    department: 'Business Development',
    location: 'Pune, India',
    jobType: 'Full-Time',
    workplaceType: 'In-Office',
    skills: ['B2B Sales', 'Client Presentations', 'Negotiation', 'Territory Management'],
    qualifications: ['Any Graduate or MBA in Marketing', '2+ years of field B2B sales experience'],
    description: `<h3>Field Sales Executive</h3>
<p><strong>Location:</strong> Pune, India (Client Field Visits)</p>
<p><strong>Job Type:</strong> Full-Time</p>
<p><strong>Overview:</strong> As a Field Sales Executive, you will drive customer acquisitions through in-person consultations, institutional presentations, and relationship building.</p>
<h4>Key Responsibilities:</h4>
<ul>
  <li>Meet key decision-makers across allocated regions and demonstrate our solutions.</li>
  <li>Close deals and meet monthly revenue targets.</li>
  <li>Gather real-time market feedback and coordinate onboarding with the operations team.</li>
</ul>`,
    showOnWebsite: true,
    createdAt: '2026-09-15',
  },
  {
    id: 'job-3',
    title: 'UI/UX Intern',
    experience: 'Fresher',
    department: 'Design',
    location: 'Pune, India',
    jobType: 'Internship',
    workplaceType: 'In-Office',
    skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    qualifications: ['Degree/Diploma in Design, Fine Arts, CS, or certified UI/UX course', 'Strong portfolio in Figma'],
    description: `<h3>UI/UX Design Intern</h3>
<p><strong>Location:</strong> Pune, India</p>
<p><strong>Job Type:</strong> Internship (6 Months) with PPO opportunity</p>
<p><strong>Overview:</strong> Join our product design team to craft delightful, intuitive digital web and mobile experiences. You will transform complex workflows into elegant user interfaces.</p>
<h4>Key Responsibilities:</h4>
<ul>
  <li>Design wireframes, high-fidelity mockups, and interactive prototypes in Figma.</li>
  <li>Assist in user research, usability testing, and persona creation.</li>
  <li>Maintain and contribute to the unified UI design system and components.</li>
</ul>`,
    showOnWebsite: true,
    createdAt: '2026-09-19',
  },
  {
    id: 'job-4',
    title: 'Web Developer Intern',
    experience: 'Fresher',
    department: 'Engineering',
    location: 'Pune, India',
    jobType: 'Internship',
    workplaceType: 'In-Office',
    skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'HTML5/CSS3', 'Git'],
    qualifications: ['B.Tech / BE / BCA / MCA in Computer Science or IT', 'Hands-on projects with modern web tech'],
    description: `<h3>Web Developer Intern</h3>
<p><strong>Location:</strong> Pune, India</p>
<p><strong>Job Type:</strong> Internship (6 Months)</p>
<p><strong>Overview:</strong> Work with our core engineering team to build scalable, responsive frontend applications and customer portals.</p>
<h4>Key Responsibilities:</h4>
<ul>
  <li>Develop modern, accessible web components using React, TypeScript, and CSS.</li>
  <li>Integrate RESTful APIs and handle asynchronous data states.</li>
  <li>Optimize web applications for cross-browser responsiveness and maximum speed.</li>
</ul>`,
    showOnWebsite: true,
    createdAt: '2026-09-20',
  },
  {
    id: 'job-5',
    title: 'Software Tester Intern',
    experience: 'Fresher',
    department: 'Quality Assurance',
    location: 'Pune, India',
    jobType: 'Internship',
    workplaceType: 'In-Office',
    skills: ['Manual Testing', 'Test Case Design', 'Bug Reporting', 'Postman / API Testing'],
    qualifications: ['B.Sc / BCA / B.Tech or Software Testing Certification', 'Sharp attention to detail'],
    description: `<h3>Software Tester Intern (QA)</h3>
<p><strong>Location:</strong> Pune, India</p>
<p><strong>Job Type:</strong> Internship</p>
<p><strong>Overview:</strong> Ensure high software quality by writing comprehensive test plans, identifying defects, and verifying fixes before release.</p>`,
    showOnWebsite: true,
    createdAt: '2026-09-21',
  },
  {
    id: 'job-6',
    title: 'HR Intern',
    experience: 'Fresher',
    department: 'Human Resources',
    location: 'Pune, India',
    jobType: 'Internship',
    workplaceType: 'In-Office',
    skills: ['Talent Sourcing', 'Interview Scheduling', 'HR Operations', 'Employee Engagement'],
    qualifications: ['MBA in HR / BBA or equivalent degree', 'Positive interpersonal attitude'],
    description: `<h3>HR Intern</h3>
<p><strong>Location:</strong> Pune, India</p>
<p><strong>Job Type:</strong> Internship</p>
<p><strong>Overview:</strong> Assist the People Operations team in talent sourcing, candidate screening, scheduling technical rounds, and onboarding new employees.</p>`,
    showOnWebsite: true,
    createdAt: '2026-09-22',
  },
];

export const INITIAL_JOB_APPLICANTS: JobApplicant[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    postFor: 'Business Development Executive',
    name: 'Chaitanya Deshmukh',
    email: 'chaitanyadeshmukh66@gmail.com',
    mobile: '7249791773',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '23-09-2026',
    status: 'New',
    coverNote: 'Experienced in cold email outreach and lead scoring. Excited to contribute to sales expansion.',
    experience: '1 year in tech sales',
  },
  {
    id: 'app-2',
    jobId: 'job-4',
    postFor: 'Web Developer Intern',
    name: 'Tushar Babar',
    email: 'babartushar2004@gmail.com',
    mobile: '9607082194',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '22-09-2026',
    status: 'Shortlisted',
    coverNote: 'Built multiple React & Tailwind projects during final year BCA. Ready for immediate joining.',
    experience: 'Fresher (2026 Graduate)',
  },
  {
    id: 'app-3',
    jobId: 'job-4',
    postFor: 'Web Developer Intern',
    name: 'Onkar Dhumal',
    email: 'onkardhumal572@gmail.com',
    mobile: '9850021416',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '22-09-2026',
    status: 'Reviewed',
    coverNote: 'Passionate about frontend development and modern UI architectures.',
    experience: 'Fresher',
  },
  {
    id: 'app-4',
    jobId: 'job-5',
    postFor: 'Software Tester Intern',
    name: 'Vaidehi Mahalle',
    email: 'vaidehimahalle03@gmail.com',
    mobile: '9370498791',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '22-09-2026',
    status: 'New',
    coverNote: 'Certified in ISTQB fundamentals with experience writing test cases and API testing with Postman.',
    experience: 'Fresher with QA certification',
  },
  {
    id: 'app-5',
    jobId: 'job-6',
    postFor: 'HR Intern',
    name: 'Vaibhavi Shrigondekar',
    email: 'shrigondekarvaibhavi@gmail.com',
    mobile: '7620578978',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    date: '21-09-2026',
    status: 'Interview',
    coverNote: 'MBA in HR candidate looking for real-world recruitment and onboarding internship experience.',
    experience: 'Fresher (MBA 2026)',
  },
];

const STORAGE_KEY_JOBS = 'laraui_job_openings';
const STORAGE_KEY_APPLICANTS = 'laraui_job_applicants';

export function getStoredJobOpenings(): JobOpening[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOBS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOB_OPENINGS));
      return INITIAL_JOB_OPENINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    // If empty or invalid, fall back to initial job openings and sync
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOB_OPENINGS));
    return INITIAL_JOB_OPENINGS;
  } catch (e) {
    return INITIAL_JOB_OPENINGS;
  }
}

export function saveStoredJobOpenings(jobs: JobOpening[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('careers-data-updated', { detail: jobs }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save jobs to localStorage', e);
  }
}

export function parseApplicantTimestamp(item: JobApplicant): number {
  if ((item as any).createdAt && typeof (item as any).createdAt === 'number') {
    return (item as any).createdAt;
  }
  // Check if id has timestamp format like 'app-1790163...'
  const idMatch = item.id.match(/^app-(\d{10,})$/);
  if (idMatch) {
    return parseInt(idMatch[1], 10);
  }
  // Parse date string like '23-09-2026'
  if (item.date && typeof item.date === 'string') {
    const parts = item.date.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const mockIdNum = parseInt(item.id.replace(/\D/g, ''), 10) || 0;
      // Subtract mockIdNum seconds so app-1 appears before app-2 on the same date
      return new Date(year, month, day).getTime() - (mockIdNum * 1000);
    }
  }
  return 0;
}

export function sortApplicantsLatestFirst(applicants: JobApplicant[]): JobApplicant[] {
  return [...applicants].sort((a, b) => {
    return parseApplicantTimestamp(b) - parseApplicantTimestamp(a);
  });
}

export function getStoredJobApplicants(): JobApplicant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPLICANTS);
    if (!raw) {
      const sorted = sortApplicantsLatestFirst(INITIAL_JOB_APPLICANTS);
      localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(sorted));
      return sorted;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? sortApplicantsLatestFirst(parsed) : INITIAL_JOB_APPLICANTS;
  } catch (e) {
    return INITIAL_JOB_APPLICANTS;
  }
}

export function saveStoredJobApplicants(applicants: JobApplicant[]): void {
  try {
    const sorted = sortApplicantsLatestFirst(applicants);
    localStorage.setItem(STORAGE_KEY_APPLICANTS, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('careers-applicants-updated', { detail: sorted }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save applicants to localStorage', e);
  }
}
