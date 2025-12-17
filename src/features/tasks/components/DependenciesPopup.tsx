// src/features/tasks/components/DependenciesPopup.tsx
import React, { useEffect, useRef } from 'react';
import { ArrowUpLeft, ArrowDownRight } from 'lucide-react';

interface DependencyItem {
  id: string;
  name: string;
  type: string;
}

interface DependenciesPopupProps {
  isOpen: boolean;
  loading: boolean;
  predecessors: DependencyItem[];
  successors: DependencyItem[];
  onClose: () => void;
  // Callbacks para abrir el modal de selección
  onOpenAddPredecessor?: (event?: React.MouseEvent) => void;
  onOpenAddSuccessor?: (event?: React.MouseEvent) => void;
  // Posición del popup
  position?: { x: number; y: number };
  // Indica si el popup de Add está abierto (para no cerrarse cuando hay scroll en él)
  isAddPopupOpen?: boolean;
  // Callback para cerrar el popup de Add cuando se cierre el de Dependencies
  onCloseAddPopup?: () => void;
}

export function DependenciesPopup({ 
  isOpen, 
  loading, 
  predecessors, 
  successors, 
  onClose, 
  onOpenAddPredecessor,
  onOpenAddSuccessor,
  position = { x: 0, y: 0 },
  isAddPopupOpen = false,
  onCloseAddPopup
}: DependenciesPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        if (onCloseAddPopup) onCloseAddPopup();
      }
    };

    const handleScroll = (event: Event) => {
      // Si el AddDependency está abierto, no cerrarse por scroll (dejamos que AddDependency maneje el cierre)
      if (isAddPopupOpen) return;
      
      // Solo cerrar si el scroll NO es dentro del popup
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true); // true para capturar scroll en cualquier elemento

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, onClose, isAddPopupOpen, onCloseAddPopup]);

  if (!isOpen) return null;

  // Calcular posición ajustada para evitar que se salga de la pantalla
  const popupWidth = 355;
  const popupMaxHeight = 200;
  const margin = 20;
  const gap = 10; // Espacio entre la celda y el popup
  
  let left = position.x + gap; // Posicionar a la derecha de la celda
  let top = position.y; // Alineado con la parte superior de la celda
  
  // Ajustar horizontalmente si se sale de la pantalla por la derecha
  if (left + popupWidth > window.innerWidth - margin) {
    // Si no cabe a la derecha, mostrarlo a la izquierda de la celda
    left = position.x - popupWidth - gap;
    // Si tampoco cabe a la izquierda, centrarlo
    if (left < margin) {
      left = (window.innerWidth - popupWidth) / 2;
      if (left < margin) left = margin;
    }
  }
  
  // Ajustar verticalmente si se sale de la pantalla por abajo
  if (top + popupMaxHeight > window.innerHeight - margin) {
    // Moverlo hacia arriba para que quepa
    top = window.innerHeight - popupMaxHeight - margin;
    if (top < margin) top = margin;
  }
  
  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div 
        ref={popupRef}
        className="fixed z-[10000] text-black"
        style={{
          left: `${left}px`,
          top: `${top}px`,
        }}
      >
        {/* Arrow pointing to the row */}
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
        <div className="p-1.5" style={{ maxHeight: `${popupMaxHeight}px`, overflow: 'hidden' }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-black">Dependencies</h3>
          <button 
            onClick={() => {
              onClose();
              if (onCloseAddPopup) onCloseAddPopup();
            }} 
            className="text-gray-500 hover:text-gray-700 text-sm leading-none"
          >
            ✕
          </button>
        </div>
        {loading ? (
          <div className="py-4 text-center text-gray-600 text-xs">Cargando...</div>
        ) : (
          <div className="space-y-1.5">
            {/* Predecessors Section */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <ArrowUpLeft className="w-3 h-3 text-gray-700 flex-shrink-0" />
                <span className="font-semibold text-black" style={{ fontSize: '10px' }}>Pred.</span>
                <div className="flex-1"></div>
                {onOpenAddPredecessor && (
                  <button 
                    id="add-predecessor-btn"
                    onClick={(e) => onOpenAddPredecessor(e)}
                    className="px-1.5 py-0.5 text-black rounded hover:opacity-80 transition-opacity"
                    style={{ fontSize: '9px', backgroundColor: '#A8D8EA' }}
                  >
                    Add
                  </button>
                )}
              </div>
              <div>
                <div className="grid grid-cols-2 gap-2 mb-0.5">
                  <div style={{ fontSize: '9px' }} className="font-medium text-gray-600">Task</div>
                  <div style={{ fontSize: '9px' }} className="font-medium text-gray-600">Type</div>
                </div>
                {predecessors.length === 0 ? (
                  <div className="py-0.5 text-gray-500 text-center" style={{ fontSize: '9px' }}>-</div>
                ) : (
                  <div 
                    className="space-y-0.5 overflow-y-auto hide-scrollbar" 
                    style={{ 
                      maxHeight: '60px',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none' // IE/Edge
                    }}
                  >
                    {predecessors.map((p) => (
                      <div key={`${p.id}-${p.type}`} className="grid grid-cols-2 gap-2">
                        <div className="px-1 py-0.5 text-black truncate rounded" style={{ backgroundColor: '#F7C59F', fontSize: '9px' }} title={p.name}>
                          {p.name}
                        </div>
                        <div className="px-1 py-0.5 text-black rounded" style={{ backgroundColor: '#E6BFBC', fontSize: '9px' }}>
                          {humanizeType(p.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Successors Section */}
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                <ArrowDownRight className="w-3 h-3 text-gray-700 flex-shrink-0" />
                <span className="font-semibold text-black" style={{ fontSize: '10px' }}>Succ.</span>
                <div className="flex-1"></div>
                {onOpenAddSuccessor && (
                  <button 
                    id="add-successor-btn"
                    onClick={(e) => onOpenAddSuccessor(e)}
                    className="px-1.5 py-0.5 text-bkack rounded hover:opacity-80 transition-opacity"
                    style={{ fontSize: '9px', backgroundColor: '#A8D8EA' }}
                  >
                    Add
                  </button>
                )}
              </div>
              <div>
                <div className="grid grid-cols-2 gap-2 mb-0.5">
                  <div style={{ fontSize: '9px' }} className="font-medium text-gray-600">Task</div>
                  <div style={{ fontSize: '9px' }} className="font-medium text-gray-600">Type</div>
                </div>
                {successors.length === 0 ? (
                  <div className="py-0.5 text-gray-500 text-center" style={{ fontSize: '9px' }}>-</div>
                ) : (
                  <div 
                    className="space-y-0.5 overflow-y-auto hide-scrollbar" 
                    style={{ 
                      maxHeight: '60px',
                      scrollbarWidth: 'none', // Firefox
                      msOverflowStyle: 'none' // IE/Edge
                    }}
                  >
                    {successors.map((s) => (
                      <div key={`${s.id}-${s.type}`} className="grid grid-cols-2 gap-2">
                        <div className="px-1 py-0.5 text-black truncate rounded" style={{ backgroundColor: '#F7C59F', fontSize: '9px' }} title={s.name}>
                          {s.name}
                        </div>
                        <div className="px-1 py-0.5 text-black rounded" style={{ backgroundColor: '#E6BFBC', fontSize: '9px' }}>
                          {humanizeType(s.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </>
  );
}

function humanizeType(t?: string): string {
  switch ((t || '').toUpperCase()) {
    case 'FINISH_TO_START':
      return 'Finish to Start';
    case 'START_TO_START':
      return 'Start to Start';
    case 'FINISH_TO_FINISH':
      return 'Finish to Finish';
    case 'START_TO_FINISH':
      return 'Start to Finish';
    default:
      return 'Finish to Start';
  }
}

