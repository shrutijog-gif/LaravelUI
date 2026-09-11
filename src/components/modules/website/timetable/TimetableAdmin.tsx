import React, { useState } from 'react';
import { Timetable } from '../../../../types/timetable';
import { getStoredTimetables, saveStoredTimetables } from '../../../../data/mockTimetableData';
import { TimetableList } from './TimetableList';
import { TimetableDrawer } from './TimetableDrawer';

export const TimetableAdmin: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>(() => getStoredTimetables());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);

  React.useEffect(() => {
    const handleTenantChange = () => {
      setTimetables(getStoredTimetables());
    };
    window.addEventListener('tenant-changed', handleTenantChange);
    return () => window.removeEventListener('tenant-changed', handleTenantChange);
  }, []);

  const updateTimetablesState = (newTimetables: Timetable[]) => {
    setTimetables(newTimetables);
    saveStoredTimetables(newTimetables);
  };

  const handleAddClick = () => {
    setEditingTimetable(null);
    setIsDrawerOpen(true);
  };

  const handleEditClick = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      const updated = timetables.filter(t => t.id !== id);
      updateTimetablesState(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = timetables.map(t => 
      t.id === id ? { ...t, showOnWebsite: !t.showOnWebsite } : t
    );
    updateTimetablesState(updated);
  };

  const handleSave = (timetableData: Omit<Timetable, 'id' | 'createdAt'>) => {
    let updated: Timetable[];
    if (editingTimetable) {
      updated = timetables.map(t => 
        t.id === editingTimetable.id 
          ? { ...t, ...timetableData }
          : t
      );
    } else {
      const newTimetable: Timetable = {
        ...timetableData,
        id: `tt-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      updated = [newTimetable, ...timetables];
    }
    updateTimetablesState(updated);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <TimetableList 
        timetables={timetables}
        onAdd={handleAddClick}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
      
      <TimetableDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        timetableToEdit={editingTimetable}
        onSave={handleSave}
      />
    </div>
  );
};
