import React from 'react';
import { FileText, Newspaper, Image as ImageIcon } from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const stats = [
    {
      id: 'files',
      label: 'Total Files',
      value: '3114',
      icon: FileText,
    },
    {
      id: 'news',
      label: 'Total News',
      value: '153',
      icon: Newspaper,
    },
    {
      id: 'gallery',
      label: 'Photo Gallery',
      value: '33',
      icon: ImageIcon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.id}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
