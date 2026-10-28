import React, { useState } from 'react';
import { NaacQuickUploadLanding } from './NaacQuickUploadLanding';
import { CheckCircle2 } from 'lucide-react';

export interface FacultyDeskProps {
  academicYear?: string;
}

export const FacultyDesk: React.FC<FacultyDeskProps> = ({
  academicYear = '2025-26',
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-xl shadow-xl flex items-center justify-between text-xs font-semibold gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Quick Upload Experience */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <NaacQuickUploadLanding
          academicYear={academicYear}
          role="faculty"
        
          portalTitle="Department of Computer Science & Engineering"
        //  portalSubtitle="Drag & drop syllabus files, BoS minutes, student projects, research grants, or workshop proofs. Antigravity AI will auto-categorize and route directly to Program Coordinator."
          headingTitle="Drop NAAC Evidence"
          schoolId="sch-tech"
          schoolName="School of Technology & Computer Engineering"
          programId="prog-cse"
          programName="B.Tech Computer Science & Engineering"
          submitTargetName="Program Coordinator"
          uploaderName="Dr. Ramesh Gupta (Associate Professor)"
          storageKeySuffix="faculty_cse"
          hideTopUploadButton={true}
          onNavigateToDocumentList={(critCode, metricCode) => {
            showToast(`Evidence files auto-saved. Access 'My Documents' to review and submit to Program Coordinator.`);
          }}
        />
      </div>
    </div>
  );
};
