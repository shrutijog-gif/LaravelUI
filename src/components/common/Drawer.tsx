import React, { useEffect } from 'react';
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
  // Lock body scroll and handle Escape key while drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Right Slide-over Drawer Panel */}
      <div className={`fixed inset-y-0 top-0 bottom-0 right-0 z-[9999] w-full ${maxWidth} h-screen h-[100dvh] max-h-screen max-h-[100dvh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300`}>
        {/* Drawer Header - Pinned at top */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white shrink-0 sticky top-0 z-20">
          <h3 className="text-base font-bold text-gray-900">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Middle Content - Only this part scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Drawer Footer - Pinned at bottom */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0 sticky bottom-0 z-20">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};

