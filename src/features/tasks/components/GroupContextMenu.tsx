import React, { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface GroupContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onDeleteGroup: () => void;
  elementName?: string;
  elementType?: string;
}

export function GroupContextMenu({ 
  isOpen, 
  onClose, 
  position, 
  onDeleteGroup,
  elementName = "elemento",
  elementType = "elemento"
}: GroupContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  // Cerrar el menú al presionar Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDeleteClick = () => {
    onDeleteGroup();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={handleDeleteClick}
        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
      >
        <Trash2 className="w-4 h-4 text-red-600" />
        Eliminar {elementType === 'GROUP' ? 'Grupo' : elementType === 'SUBGROUP' ? 'Subgrupo' : elementType === 'SIMPLE_TASK' ? 'Tarea' : elementType === 'MILESTONE' ? 'Hito' : 'Elemento'}
      </button>
    </div>
  );
}
