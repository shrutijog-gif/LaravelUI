import React, { useState } from 'react';
import { Timetable } from '../../../../types/timetable';
import { initialTimetables } from '../../../../data/mockTimetableData';
import { TimetableList } from './TimetableList';
import { TimetableDrawer } from './TimetableDrawer';

export const TimetableAdmin: React.FC = () => {
  const [timetables, setTimetables] = useState<Timetable[]>(initialTimetables);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);

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
      setTimetables(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setTimetables(prev => prev.map(t => 
      t.id === id ? { ...t, showOnWebsite: !t.showOnWebsite } : t
    ));
  };

  const handleSave = (timetableData: Omit<Timetable, 'id' | 'createdAt'>) => {
    if (editingTimetable) {
      setTimetables(prev => prev.map(t => 
        t.id === editingTimetable.id 
          ? { ...t, ...timetableData }
          : t
      ));
    } else {
      const newTimetable: Timetable = {
        ...timetableData,
        id: `tt-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setTimetables(prev => [newTimetable, ...prev]);
    }
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
