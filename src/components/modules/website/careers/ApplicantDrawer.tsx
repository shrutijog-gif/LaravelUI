import React from 'react';
import { Drawer } from '../../../common/Drawer';
import { JobApplicant } from '../../../../types/careers';
import { 
  User, Mail, Phone, Calendar, Briefcase,
  FileText, ExternalLink 
} from 'lucide-react';

interface ApplicantDrawerProps {
  applicant: JobApplicant | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ApplicantDrawer: React.FC<ApplicantDrawerProps> = ({
  applicant,
  isOpen,
  onClose,
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
                <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-6 h-6" />
              </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-snug break-words">
                {applicant.name}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Applied for: <span className="font-semibold text-gray-800">{applicant.postFor}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Application Details - One below another */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs divide-y divide-gray-200/60">
          <div className="flex items-center gap-2.5 py-2 first:pt-0 text-gray-700">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-gray-500 font-medium w-16 shrink-0">Email:</span>
            <span className="select-all font-semibold text-gray-800 break-all">{applicant.email}</span>
          </div>
          <div className="flex items-center gap-2.5 py-2 text-gray-700">
            <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-gray-500 font-medium w-16 shrink-0">Phone:</span>
            <span className="select-all font-semibold text-gray-800">{applicant.mobile}</span>
          </div>
          <div className="flex items-center gap-2.5 py-2 last:pb-0 text-gray-700">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
            <span className="text-gray-500 font-medium w-16 shrink-0">Applied:</span>
            <span className="font-semibold text-gray-800">{applicant.date}</span>
          </div>
        </div>

        {/* Experience & Resume Cards - Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Candidate Experience Card */}
          <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Total Experience
              </span>
              <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">
                {applicant.experience || 'Fresher'}
              </p>
            </div>
          </div>

          {/* Resume Card */}
          <div className="p-4 border  rounded-xl    shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
               <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
            </div>
            
         
              <div className="min-w-0">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Resume
              </span>
                <a href={applicant.resumeUrl || '#'}
              target="_blank" className="text-sm font-semibold underline    text-blue-600/90 mt-0.5   truncate">
                  View Document
                </a>
              </div>
            </div>
          
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
      </div>
    </Drawer>
  );
};
