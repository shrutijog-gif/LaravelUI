import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-3 px-6 text-right text-xs text-gray-600">
      <span>All Rights Reserved | </span>
      <span className="font-medium text-gray-700">Demo College</span>
      <span> | Powered by </span>
      <a 
        href="#" 
        className="text-blue-600 font-medium hover:underline cursor-pointer"
        onClick={(e) => e.preventDefault()}
      >
        WhiteCode
      </a>
    </footer>
  );
};
