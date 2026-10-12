import React, { useState, useEffect } from 'react';
import { Drawer } from '../../../common/Drawer';
import { JobOpening } from '../../../../types/careers';
import { Plus, X } from 'lucide-react';
import { JobRichTextEditor } from './JobRichTextEditor';

interface JobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  jobToEdit?: JobOpening | null;
  onSave: (job: JobOpening) => void;
}

export const JobDrawer: React.FC<JobDrawerProps> = ({
  isOpen,
  onClose,
  jobToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('Fresher');
  
  // Skills tags
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  // Qualifications tags
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [currentQual, setCurrentQual] = useState('');

  // Job Description
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; experience?: string }>({});

  useEffect(() => {
    if (jobToEdit) {
      setTitle(jobToEdit.title || '');
      setExperience(jobToEdit.experience || 'Fresher');
      setSkills(jobToEdit.skills || []);
      setQualifications(jobToEdit.qualifications || []);
      setDescription(jobToEdit.description || '');
    } else {
      setTitle('');
      setExperience('');
      setSkills([]);
      setQualifications([]);
      setDescription('');
    }
    setErrors({});
  }, [jobToEdit, isOpen]);

  // Skill tag add/remove
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = currentSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Qualification tag add/remove
  const handleAddQual = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = currentQual.trim();
    if (trimmed && !qualifications.includes(trimmed)) {
      setQualifications([...qualifications, trimmed]);
      setCurrentQual('');
    }
  };

  const handleRemoveQual = (qualToRemove: string) => {
    setQualifications(qualifications.filter(q => q !== qualToRemove));
  };



  const handleSave = () => {
    const errs: { title?: string; experience?: string } = {};
    if (!title.trim()) errs.title = 'Job Title is required';
    if (!experience.trim()) errs.experience = 'Experience is required';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload: JobOpening = {
      id: jobToEdit?.id || `job-${Date.now()}`,
      title: title.trim(),
      experience: experience.trim(),
      skills,
      qualifications,
      description,
      showOnWebsite: jobToEdit ? jobToEdit.showOnWebsite : true,
      createdAt: jobToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSave(payload);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={jobToEdit ? 'Edit Job' : 'Add Job'}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            {jobToEdit ? 'Update Job' : 'Save Job'}
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* Row 1: Job Title & Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Lead Generation Executive, UI/UX Intern"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white border ${
                errors.title ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300'
              } rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Fresher, 2+, 3-5 Years"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-white border ${
                errors.experience ? 'border-red-500 ring-1 ring-red-400' : 'border-gray-300'
              } rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all`}
            />
            {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience}</p>}
          </div>
        </div>

        {/* Row 3: Skills & Qualifications Tag Inputs (Matching Reference Screenshots 3 & 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Skills Tag Section */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
              Skills <span className="text-red-500">*</span>
            </label>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add skill (e.g. Figma, React, Sales)..."
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Added Skills Tag Pills */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {skills.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-1">No skills added yet.</p>
              ) : (
                skills.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Qualifications Tag Section */}
          <div className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
              Qualifications <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add qualification (e.g. B.Tech, MBA)..."
                value={currentQual}
                onChange={(e) => setCurrentQual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddQual();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => handleAddQual()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Added Qualifications Tag Pills */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {qualifications.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-1">No qualifications added yet.</p>
              ) : (
                qualifications.map((qual) => (
                  <div
                    key={qual}
                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-800 shadow-2xs"
                  >
                    <span>{qual}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQual(qual)}
                      className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer"
                      title="Remove qualification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Row 4: Job Description Editor */}
        <div>
          <div className="mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Job Description:
            </label>
          </div>

          <JobRichTextEditor value={description} onChange={setDescription} />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Use the toolbar above to format text. Content displays on the job listing page.
          </p>
        </div>
      </div>
    </Drawer>
  );
};
