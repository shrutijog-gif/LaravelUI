import React from 'react';
import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import { config } from '../../puck.config';
import { History, RotateCcw, RotateCw, ChevronDown } from 'lucide-react';

// Initial data for the Puck editor
const initialData = {
  content: [],
  root: {},
};

interface PuckEditorProps {
  onBack?: () => void;
  pageName?: string;
}

export const PuckEditor: React.FC<PuckEditorProps> = ({ onBack, pageName = 'Page' }) => {
  return (
    <div className="h-screen w-full">
      <Puck 
        config={config} 
        data={initialData} 
        overrides={{
          headerActions: ({ children }) => (
            <div className="flex items-center gap-3 text-sm ml-auto whitespace-nowrap">
              <button onClick={onBack} className="text-gray-700 hover:text-black font-medium transition-colors mr-2">
                Back
              </button>
              
              <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1.5 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-gray-500 text-xs">Breadcrumb:</span>
                <span className="text-xs font-medium text-gray-700">Title Top</span>
                <ChevronDown className="w-3 h-3 text-gray-500"/>
              </div>
              
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors bg-white">
                <History className="w-4 h-4"/> History
              </button>
              
              <button className="px-4 py-1.5 bg-[#1a56db] text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors">
                View Page
              </button>
              
              <button className="px-5 py-1.5 bg-[#1a56db] text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-colors" onClick={() => console.log('Saved!')}>
                Save
              </button>
            </div>
          )
        }}
        onPublish={async (data) => {
          console.log('Publishing data:', data);
          // In a real app, you would save this data to your backend
          alert('Page published! Check console for data.');
        }} 
      />
    </div>
  );
};
