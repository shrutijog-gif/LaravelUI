import React from 'react';
import { Drawer } from '../../../common/Drawer';
import { JobApplicant } from '../../../../types/careers';
import { 
  User, Mail, Phone, Calendar, 
  FileText, ExternalLink 
} from 'lucide-react';

interface ApplicantDrawerProps {
  applicant: JobApplicant | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: JobApplicant['status']) => void;
}

export const ApplicantDrawer: React.FC<ApplicantDrawerProps> = ({
  applicant,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!applicant) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Application Details"
      maxWidth="max-w-2xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
        >
          Close
        </button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Candidate Banner Card */}
        <div className="p-4 sm:p-5 bg-white border border-gray-200 rounded-xl shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-snug truncate">
                {applicant.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Applied for: <span className="font-semibold text-gray-800">{applicant.postFor}</span>
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
            applicant.status === 'Shortlisted'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : applicant.status === 'Interview'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : applicant.status === 'Reviewed'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : applicant.status === 'Rejected'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {applicant.status || 'New'}
          </span>
        </div>

        {/* Quick Contact & Details Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate select-all font-medium" title={applicant.email}>{applicant.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium select-all">{applicant.mobile}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Applied: {applicant.date}</span>
          </div>
        </div>

        {/* Status & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Update Application Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                applicant.status === 'Shortlisted'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : applicant.status === 'Interview'
                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                  : applicant.status === 'Reviewed'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : applicant.status === 'Rejected'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {applicant.status || 'New'}
              </span>
              {onStatusChange && (
                <select
                  value={applicant.status || 'New'}
                  onChange={(e) => onStatusChange(applicant.id, e.target.value as any)}
                  className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="New">Mark: New</option>
                  <option value="Reviewed">Mark: Reviewed</option>
                  <option value="Shortlisted">Mark: Shortlisted</option>
                  <option value="Interview">Mark: Interview</option>
                  <option value="Rejected">Mark: Rejected</option>
                </select>
              )}
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Candidate Experience
            </span>
            <p className="text-xs font-semibold text-gray-800">
              {applicant.experience || 'Fresher'}
            </p>
          </div>
        </div>

        {/* Cover Note / Statement */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Applicant Statement / Cover Note:
          </h4>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 leading-relaxed italic">
            "{applicant.coverNote || 'Looking forward to this exciting opportunity with your esteemed organization.'}"
          </div>
        </div>

        {/* Resume Attachment Link */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">Candidate Resume Document</p>
              <p className="text-[11px] text-blue-700">PDF Attachment provided during application</p>
            </div>
          </div>
          <a
            href={applicant.resumeUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Resume
          </a>
        </div>
      </div>
    </Drawer>
  );
};
