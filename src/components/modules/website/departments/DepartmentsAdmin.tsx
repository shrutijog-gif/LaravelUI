import React, { useState, useEffect } from 'react';
import { Department, getStoredDepartments, saveStoredDepartments } from '../../../../data/mockDepartmentData';
import { DepartmentsList } from './DepartmentsList';
import { DepartmentContentManager } from './DepartmentContentManager';

// DepartmentsAdmin router: list (clean 3 columns) and manage content (21 tabs)

type ViewMode = 'list' | 'manage';

export const DepartmentsAdmin: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [departments, setDepartments] = useState<Department[]>(getStoredDepartments);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Keep state in sync with custom events
  useEffect(() => {
    const handleUpdate = () => {
      setDepartments(getStoredDepartments());
    };
    window.addEventListener('departments-updated', handleUpdate);
    return () => window.removeEventListener('departments-updated', handleUpdate);
  }, []);

  const handleDepartmentsChange = (updated: Department[]) => {
    setDepartments(updated);
    saveStoredDepartments(updated);
    if (selectedDepartment) {
      const refreshed = updated.find(d => d.id === selectedDepartment.id);
      if (refreshed) setSelectedDepartment(refreshed);
    }
  };

  const handleManage = (dept: Department) => {
    setSelectedDepartment(dept);
    setView('manage');
  };

  const handleBack = () => {
    setView('list');
    setSelectedDepartment(null);
  };

  if (view === 'manage' && selectedDepartment) {
    return (
      <DepartmentContentManager
        department={selectedDepartment}
        onBack={handleBack}
      />
    );
  }

  return (
    <DepartmentsList
      departments={departments}
      onDepartmentsChange={handleDepartmentsChange}
      onManage={handleManage}
    />
  );
};
