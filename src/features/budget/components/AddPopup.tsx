import React from 'react';
import { Plus } from 'lucide-react';

interface AddPopupProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSelectCategoria: () => void;
  onSelectSubcategoria: () => void;
}

const AddPopup: React.FC<AddPopupProps> = ({ 
  isOpen, 
  position, 
  onClose, 
  onSelectCategoria, 
  onSelectSubcategoria 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]" onClick={onClose}>
      <div 
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[150px]"
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translateX(10px)' // Desplazar a la derecha
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onSelectCategoria}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Categoría
        </button>
        <button
          onClick={onSelectSubcategoria}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Subcategoría
        </button>
      </div>
    </div>
  );
};

export default AddPopup; 