// frontend/components/Modal.tsx
"use client";

import React, { useRef, useEffect, ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // The title for the modal (e.g., "Add New Task", "Edit Task")
  children: ReactNode; // The content to be displayed inside the modal (e.g., your TaskForm)
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Effect to handle closing the modal on Escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Optional: Prevent scrolling of the body when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = ""; // Restore scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    // This is the full-screen overlay for the modal (dimmed background)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        // Close modal if clicking on the backdrop, not on the modal content itself
        if (
          modalContentRef.current &&
          !modalContentRef.current.contains(e.target as Node)
        ) {
          onClose();
        }
      }}
    >
      {/* This is the white content box of the modal */}
      <div
        ref={modalContentRef} // Attach ref here to prevent clicks inside from closing
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 space-y-4 relative"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal content from propagating to backdrop
      >
        {/* Modal Header with Title and Close Button */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>

        {/* Modal Content Area */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
