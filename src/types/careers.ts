export interface JobOpening {
  id: string;
  title: string;
  experience: string;
  department?: string;
  location?: string;
  jobType?: 'Full-Time' | 'Part-Time' | 'Internship' | 'Contract';
  workplaceType?: 'In-Office' | 'Remote' | 'Hybrid';
  skills: string[];
  qualifications: string[];
  description: string;
  showOnWebsite: boolean;
  createdAt: string;
}

export interface JobApplicant {
  id: string;
  jobId?: string;
  postFor: string;
  name: string;
  email: string;
  mobile: string;
  resumeUrl: string;
  date: string;
  status?: 'New' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Rejected';
  coverNote?: string;
  experience?: string;
}
