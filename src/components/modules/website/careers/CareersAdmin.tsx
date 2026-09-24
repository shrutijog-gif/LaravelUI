import React, { useState, useEffect } from 'react';
import { 
  Search, Edit2, Trash2, Home, CheckCircle2, 
  FileText, Briefcase, ChevronLeft, ChevronRight, ExternalLink 
} from 'lucide-react';
import { JobOpening, JobApplicant } from '../../../../types/careers';
import { 
  getStoredJobOpenings, saveStoredJobOpenings, 
  getStoredJobApplicants, saveStoredJobApplicants 
} from '../../../../data/mockCareerData';
import { JobDrawer } from './JobDrawer';
import { ApplicantDrawer } from './ApplicantDrawer';

type ActiveTab = 'jobs' | 'applicants';

interface CareersAdminProps {
  initialTab?: ActiveTab;
}

export const CareersAdmin: React.FC<CareersAdminProps> = ({ initialTab = 'jobs' }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [showCount, setShowCount] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer / Modal states
  const [isJobDrawerOpen, setIsJobDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplicant | null>(null);
  const [isApplicantDrawerOpen, setIsApplicantDrawerOpen] = useState(false);

  // Delete confirmation
  const [jobToDelete, setJobToDelete] = useState<JobOpening | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      setJobs(getStoredJobOpenings());
      setApplicants(getStoredJobApplicants());
    };
    loadData();

    window.addEventListener('storage', loadData);
    window.addEventListener('careers-data-updated', loadData);
    window.addEventListener('careers-applicants-updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('careers-data-updated', loadData);
      window.removeEventListener('careers-applicants-updated', loadData);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle "Show on website"
  const handleToggleWebsite = (jobId: string) => {
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        const next = !j.showOnWebsite;
        showToast(`Job "${j.title}" is now ${next ? 'visible' : 'hidden'} on website`);
        return { ...j, showOnWebsite: next };
      }
      return j;
    });
    setJobs(updated);
    saveStoredJobOpenings(updated);
  };

  // Save Job
  const handleSaveJob = (job: JobOpening) => {
    let updated: JobOpening[];
    const exists = jobs.some(j => j.id === job.id);
    if (exists) {
      updated = jobs.map(j => j.id === job.id ? job : j);
      showToast(`Updated "${job.title}" successfully`);
    } else {
      updated = [job, ...jobs];
      showToast(`Added new job opening "${job.title}"`);
    }
    setJobs(updated);
    saveStoredJobOpenings(updated);
  };

  // Delete Job
  const confirmDeleteJob = () => {
    if (!jobToDelete) return;
    const updated = jobs.filter(j => j.id !== jobToDelete.id);
    setJobs(updated);
    saveStoredJobOpenings(updated);
    showToast(`Deleted "${jobToDelete.title}"`);
    setJobToDelete(null);
  };



  // Filtering
  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.experience.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredApplicants = applicants.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.postFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.mobile.includes(searchQuery)
  );

  const perPage = Number(showCount);
  const totalItems = activeTab === 'jobs' ? filteredJobs.length : filteredApplicants.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const paginatedJobs = filteredJobs.slice((currentPage - 1) * perPage, currentPage * perPage);
  const paginatedApplicants = filteredApplicants.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Home className="w-4 h-4 text-slate-600" />
        <span>/</span>
        <span className="text-gray-600">Careers</span>
        <span>/</span>
        <span className="text-gray-800 font-medium">
          {activeTab === 'jobs' ? 'Job Postings' : 'Job Posting Responses'}
        </span>
      </nav>

      {/* Page Header (Matching Timetables / Departments) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {activeTab === 'jobs' ? 'Job Postings' : 'Job Posting Responses'}
          </h1>
        </div>

        {activeTab === 'jobs' && (
          <button
            onClick={() => {
              setEditingJob(null);
              setIsJobDrawerOpen(true);
            }}
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-medium text-sm px-5 py-2 rounded shadow-sm transition-colors shrink-0"
          >
            Add New
          </button>
        )}
      </div>

      {/* Main Table Card (Same structure and style as Timetables/Departments) */}
      <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show :</span>
            <select
              value={showCount}
              onChange={(e) => {
                setShowCount(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search.."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-200 text-sm rounded pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {activeTab === 'jobs' ? (
            /* TAB 1: JOB OPENINGS */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-4 px-5">Job Title</th>
                  <th className="py-4 px-5">Experience</th>
                  <th className="py-4 px-5">Show on Website</th>
                  <th className="py-4 px-5 w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      {searchQuery ? 'No jobs match your search.' : 'No job openings found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Job Title */}
                      <td className="py-4 px-5 text-gray-800 font-medium">
                        {job.title}
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-5 text-gray-600">
                        {job.experience}
                      </td>

                      {/* Show on Website Toggle (matching Timetables) */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleWebsite(job.id)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
                              job.showOnWebsite ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                            title="Click to toggle visibility"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                job.showOnWebsite ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${job.showOnWebsite ? 'text-blue-600' : 'text-gray-500'}`}>
                            {job.showOnWebsite ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>

                      {/* Actions (matching Timetables) */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingJob(job);
                              setIsJobDrawerOpen(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setJobToDelete(job)}
                            className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* TAB 2: RECRUITMENT LIST */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50/50">
                  <th className="py-4 px-5">Candidate</th>
                  <th className="py-4 px-5">Post & Date</th>
                  <th className="py-4 px-4 text-center">Resume</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      {searchQuery ? 'No applicants match your search.' : 'No candidate applications received yet.'}
                    </td>
                  </tr>
                ) : (
                  paginatedApplicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Candidate */}
                      <td className="py-4 px-5">
                        <div className="text-gray-900 font-bold text-sm">
                          {applicant.name}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 mt-0.5 select-all">
                          <span title={applicant.email} className="truncate max-w-[200px]">{applicant.email}</span>
                          <span className="text-gray-300">•</span>
                          <span>{applicant.mobile}</span>
                        </div>
                      </td>

                      {/* Post & Date */}
                      <td className="py-4 px-5">
                        <div className="text-gray-800 font-semibold text-sm">
                          {applicant.postFor}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Applied: {applicant.date}
                        </div>
                      </td>

                      {/* Resume */}
                      <td className="py-4 px-4 text-center">
                        <a
                          href={applicant.resumeUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          Resume
                        </a>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplicant(applicant);
                            setIsApplicantDrawerOpen(true);
                          }}
                          className="px-3 py-1 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
          </div>

          <div className="flex items-center gap-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded border font-medium text-xs transition-colors ${
                  currentPage === p
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Job Drawer for Add / Edit */}
      <JobDrawer
        isOpen={isJobDrawerOpen}
        onClose={() => {
          setIsJobDrawerOpen(false);
          setEditingJob(null);
        }}
        jobToEdit={editingJob}
        onSave={handleSaveJob}
      />

      {/* Applicant View Details Slide-over Drawer */}
      <ApplicantDrawer
        isOpen={isApplicantDrawerOpen}
        applicant={selectedApplicant}
        onClose={() => {
          setIsApplicantDrawerOpen(false);
          setSelectedApplicant(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setJobToDelete(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-lg shadow-xl p-5 border border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-2">Delete Job Opening</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900">"{jobToDelete.title}"</strong>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setJobToDelete(null)}
                className="px-4 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteJob}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
