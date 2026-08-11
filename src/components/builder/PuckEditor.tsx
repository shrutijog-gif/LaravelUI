import React from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { config } from '../../puck.config';

// Initial data for the Puck editor
const initialData = {
  content: [],
  root: {},
};

export const PuckEditor: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <Puck 
        config={config} 
        data={initialData} 
        onPublish={async (data) => {
          console.log('Publishing data:', data);
          // In a real app, you would save this data to your backend
          alert('Page published! Check console for data.');
        }} 
      />
    </div>
  );
};
