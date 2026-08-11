import React from 'react';
import { createPortal } from 'react-dom';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Right Slide-over Drawer Panel */}
      <div className={`fixed inset-y-0 right-0 z-[9999] w-full ${maxWidth} bg-white shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300`}>
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0">
          <h3 className="text-base font-bold text-gray-900">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>

        {/* Drawer Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
