// src/features/tasks/components/AddDependencyPopup.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface AddDependencyPopupProps {
  isOpen: boolean;
  title: string;
  candidates: { id: string; name: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
  position?: { x: number; y: number };
  onCloseBoth?: () => void; // Para cerrar ambos popups cuando hay scroll fuera
}

export function AddDependencyPopup({ 
  isOpen, 
  title,
  candidates, 
  onSelect, 
  onClose,
  position = { x: 0, y: 0 },
  onCloseBoth
}: AddDependencyPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = (event: Event) => {
      // Solo cerrar si el scroll NO es dentro del popup
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        // Cerrar ambos popups porque están conectados
        if (onCloseBoth) {
          onCloseBoth();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true); // true para capturar scroll en cualquier elemento

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose, onCloseBoth]);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrar candidatos por búsqueda
  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular posición ajustada
  const popupWidth = 200;
  const popupMaxHeight = 150;
  const margin = 20;
  const gap = 10;
  
  let left = position.x + gap;
  let top = position.y;
  
  // Ajustar horizontalmente
  if (left + popupWidth > window.innerWidth - margin) {
    left = position.x - popupWidth - gap;
    if (left < margin) {
      left = (window.innerWidth - popupWidth) / 2;
      if (left < margin) left = margin;
    }
  }
  
  // Ajustar verticalmente
  if (top + popupMaxHeight > window.innerHeight - margin) {
    top = window.innerHeight - popupMaxHeight - margin;
    if (top < margin) top = margin;
  }

  return (
    <div 
      ref={popupRef}
      className="fixed z-[10001] text-black"
      style={{
        left: `${left}px`,
        top: `${top}px`,
      }}
    >
      {/* Arrow pointing to the Add button */}
      <div className="absolute left-0 top-2.5 -translate-x-2 w-0 h-0" style={{
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: '6px solid #e5e7eb'
      }}></div>
      <div className="absolute left-0 top-2.5 -translate-x-1 w-0 h-0" style={{
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderRight: '6px solid white'
      }}></div>
      
      <div 
        className="bg-white rounded-lg shadow-2xl border border-gray-200"
        style={{
          width: `${popupWidth}px`,
          maxHeight: `${popupMaxHeight}px`,
        }}
      >
        <div className="p-2">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-semibold text-black truncate">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-base leading-none ml-1 flex-shrink-0">✕</button>
        </div>

        {/* Search Input */}
        <div className="mb-1.5 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-2 py-1 bg-gray-100 rounded-full text-xs text-black placeholder-gray-500 focus:outline-none focus:bg-gray-200 border-0"
            autoFocus
          />
        </div>

        {/* Task List */}
        <div className="space-y-0.5 overflow-auto" style={{ maxHeight: '80px' }}>
          {filteredCandidates.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-2">
              {searchTerm ? 'No encontrado' : 'Sin tareas'}
            </div>
          ) : (
            filteredCandidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={() => {
                  onSelect(candidate.id);
                  onClose();
                }}
                className="w-full text-left px-1.5 py-1 hover:opacity-80 text-xs text-black truncate transition-opacity rounded"
                style={{ backgroundColor: '#F7C59F' }}
                title={candidate.name}
              >
                {candidate.name}
              </button>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
