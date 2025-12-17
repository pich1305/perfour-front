import React from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  elementName: string;
  isDeleting?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  elementName,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">
          {message} "<strong>{elementName}</strong>"? Esta acción es irreversible.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg font-semibold transition-colors duration-150 hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-70"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`w-full justify-center flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors duration-150 ${
              isDeleting
                ? 'opacity-70 cursor-not-allowed'
                : 'hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
            }`}
          >
            {isDeleting && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isDeleting ? 'Eliminando' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal; 