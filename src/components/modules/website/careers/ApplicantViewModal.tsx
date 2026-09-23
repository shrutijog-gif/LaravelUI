import React from 'react';
import { JobApplicant } from '../../../../types/careers';
import { 
  User, Mail, Phone, Calendar, Briefcase, 
  FileText, ExternalLink, Download, CheckCircle2, X 
} from 'lucide-react';

interface ApplicantViewModalProps {
  applicant: JobApplicant | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: JobApplicant['status']) => void;
}

export const ApplicantViewModal: React.FC<ApplicantViewModalProps> = ({
  applicant,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#0f2748] to-[#1e3a8a] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">{applicant.name}</h3>
              <p className="text-xs text-blue-200">Applied for: {applicant.postFor}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
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
            <div className="p-3.5 border border-gray-200 rounded-xl">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Application Status
              </span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  applicant.status === 'Shortlisted'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : applicant.status === 'Interview'
                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                    : applicant.status === 'Reviewed'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {applicant.status || 'New'}
                </span>
                {onStatusChange && (
                  <select
                    value={applicant.status || 'New'}
                    onChange={(e) => onStatusChange(applicant.id, e.target.value as any)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-700 bg-white focus:outline-none"
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

            <div className="p-3.5 border border-gray-200 rounded-xl">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
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

          {/* Resume Attachment Link / Download Button */}
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open Resume
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
