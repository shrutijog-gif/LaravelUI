import React, { useState, useEffect } from 'react';
import { getStoredJobOpenings } from '../../../data/mockCareerData';
import { JobOpening } from '../../../types/careers';
import { Briefcase, Clock, ChevronRight, ChevronDown, MapPin, X, Tag, GraduationCap, Search, CheckCircle2 } from 'lucide-react';

export interface CareersProps {
  title?: string;
  description?: string;
  columns?: 2 | 3;
  showSearch?: boolean;
  applyLabel?: string;
  className?: string;
  anchorId?: string;
  jobs?: JobOpening[];
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
const ApplyModal: React.FC<{
  job: JobOpening;
  applyLabel: string;
  onClose: () => void;
}> = ({ job, applyLabel, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', coverNote: '' });
  const [resume, setResume] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile)) e.mobile = '10-digit mobile required';
    if (!resume) e.resume = 'Resume (PDF) is required';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Save applicant to localStorage (latest at top)
    try {
      const raw = localStorage.getItem('laraui_job_applicants');
      const existing = raw ? JSON.parse(raw) : [];
      const newApplicant = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        postFor: job.title,
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim(),
        coverNote: form.coverNote.trim(),
        resumeUrl: resume ? URL.createObjectURL(resume) : '',
        date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        status: 'New',
        experience: '',
        createdAt: Date.now(),
      };
      const updated = [newApplicant, ...existing];
      localStorage.setItem('laraui_job_applicants', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('careers-applicants-updated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
    } catch (_) {}

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
            <p className="text-sm text-gray-500 mb-6">Thank you <strong>{form.name}</strong>. We'll review your profile and reach out shortly.</p>
            <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Header - Fixed */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-white">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Apply Now</p>
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Experience: {job.experience || 'Open'}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 mt-1 flex-shrink-0 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form wrapping middle body and pinned footer */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Middle Body */}
              <div className="overflow-y-auto flex-1 p-6 space-y-4 custom-scrollbar">
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Rahul Sharma' },
                  { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. rahul@example.com' },
                  { key: 'mobile', label: 'Mobile Number', type: 'tel', placeholder: '10-digit mobile number' },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={(form as any)[key]}
                      onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className={`w-full px-3 py-2.5 border ${errors[key] ? 'border-red-400' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
                    />
                    {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Resume / CV <span className="text-red-500">*</span></label>
                  <label className={`flex items-center gap-3 px-3 py-2.5 border-2 border-dashed ${errors.resume ? 'border-red-400' : 'border-gray-300'} rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all`}>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm text-gray-500">{resume ? resume.name : 'Click to upload PDF'}</span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setResume(e.target.files?.[0] ?? null)} />
                  </label>
                  {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cover Note <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you're a great fit..."
                    value={form.coverNote}
                    onChange={(e) => setForm(f => ({ ...f, coverNote: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              {/* Fixed Pinned Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {applyLabel}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Accordion Job Card ───────────────────────────────────────────────────────
const JobCard: React.FC<{
  job: JobOpening;
  applyLabel?: string;
}> = ({ job, applyLabel = 'Apply' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showApply, setShowApply] = useState(false);

  const skills = Array.isArray(job.skills)
    ? job.skills
    : typeof job.skills === 'string' && (job.skills as string).trim()
    ? (job.skills as string).split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const qualifications = Array.isArray(job.qualifications)
    ? job.qualifications
    : typeof job.qualifications === 'string' && (job.qualifications as string).trim()
    ? (job.qualifications as string).split(',').map(q => q.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 w-full">
        {/* Card Header (Click to toggle accordion) */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
        >
          {/* Left Details */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-snug">
              {job.title || 'Untitled Role'}
            </h3>
            
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1.5 text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{job.location || 'Pune, India'}</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{job.jobType || 'Full-Time'}</span>
              </span>
              {job.experience && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{job.experience}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Action: Apply Button & Chevron */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowApply(true);
              }}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {applyLabel || 'Apply'}
            </button>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-gray-700' : ''}`} />
            </div>
          </div>
        </div>

        {/* Accordion Body (Details) */}
        {isExpanded && (
          <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-gray-100/90 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              {/* Required Skills Column */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3.5">
                  REQUIRED SKILLS
                </h4>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 bg-blue-50/50 hover:bg-blue-50 text-gray-700 border border-blue-100/70 text-xs font-medium rounded-lg transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">None specified</p>
                )}
              </div>

              {/* Key Qualifications Column */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3.5">
                  KEY QUALIFICATIONS
                </h4>
                {qualifications.length > 0 ? (
                  <ul className="space-y-2">
                    {qualifications.map((qual, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                        <span>{qual}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">None specified</p>
                )}
              </div>
            </div>

            {/* Description if available */}
            {job.description && (
              <div className="mt-6 pt-5 border-t border-gray-100">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                  JOB OVERVIEW
                </h4>
                <div
                  className="prose-careers text-xs sm:text-sm text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </div>
            )}

            {/* Bottom Apply Action */}
            <div className="flex justify-end pt-6">
              <button
                type="button"
                onClick={() => setShowApply(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Apply for this position
              </button>
            </div>
          </div>
        )}
      </div>

      {showApply && (
        <ApplyModal
          job={job}
          applyLabel="Apply Now"
          onClose={() => setShowApply(false)}
        />
      )}
    </>
  );
};

// ─── Main Block ───────────────────────────────────────────────────────────────
export const Careers: React.FC<CareersProps> = ({
  title = "We're Hiring",
  description = 'Join our growing team. Explore open roles and apply today.',
  columns = 3,
  showSearch = true,
  applyLabel = 'Apply Now',
  className = '',
  anchorId = '',
  jobs: passedJobs,
}) => {
  const [liveJobs, setLiveJobs] = useState<JobOpening[]>(() => {
    const all = getStoredJobOpenings();
    return all.filter(j => j && j.showOnWebsite !== false);
  });
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      const all = getStoredJobOpenings();
      setLiveJobs(all.filter(j => j && j.showOnWebsite !== false));
    };

    window.addEventListener('careers-data-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('careers-data-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const activeJobs = passedJobs && passedJobs.length > 0 ? passedJobs : liveJobs;

  const filtered = activeJobs.filter(j => {
    if (!j) return false;
    const queryLower = (query || '').toLowerCase().trim();
    if (!queryLower) return true;
    const titleMatch = (j.title || '').toLowerCase().includes(queryLower);
    const deptMatch = (j.department || '').toLowerCase().includes(queryLower);
    const expMatch = (j.experience || '').toLowerCase().includes(queryLower);
    return titleMatch || deptMatch || expMatch;
  });

  return (
    <section id={anchorId || undefined} className={`py-12 px-4 ${className}`}>
      {/* Section Header */}
      <div className="max-w-4xl mx-auto mb-10 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        {description && <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-2xl mx-auto">{description}</p>}
        {showSearch && (
          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search roles…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Job Cards List (Horizontal Full-Width) */}
      <div className="max-w-5xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">{query ? 'No roles match your search.' : 'No open positions right now. Check back soon!'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(job => (
              <JobCard key={job.id} job={job} applyLabel={applyLabel} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const CareersBlock = Careers;
