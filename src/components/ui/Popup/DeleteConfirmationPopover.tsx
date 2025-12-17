// components/ui/Popup/DeleteConfirmationPopover.tsx
"use client";

import { useEffect, useRef, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { colors } from '@/lib/config/colors';

interface DeleteConfirmationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  triggerRef: RefObject<HTMLElement>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DeleteConfirmationPopover({
  isOpen,
  onClose,
  onConfirm,
  triggerRef,
  title = "¿Eliminar item?",
  description = "Esta acción no se puede deshacer.",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar"
}: DeleteConfirmationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Pequeño delay para evitar que se cierre inmediatamente
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Calcular posición
  const getPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };

    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = 320; // ancho del popover
    const spacing = 8;

    // Posición por defecto: abajo a la derecha del trigger
    let top = rect.bottom + spacing;
    let left = rect.right - popoverWidth;

    // Si se sale de la pantalla por abajo, ponerlo arriba
    if (top + 200 > window.innerHeight) {
      top = rect.top - 200 - spacing;
    }

    // Si se sale por la izquierda, ajustar
    if (left < spacing) {
      left = spacing;
    }

    // Si se sale por la derecha, ajustar
    if (left + popoverWidth > window.innerWidth - spacing) {
      left = window.innerWidth - popoverWidth - spacing;
    }

    return { top, left };
  };

  if (!isOpen) return null;

  const position = getPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay invisible para capturar clicks */}
          <div className="fixed inset-0 z-40" />

          {/* Popover */}
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border-2"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              borderColor: colors.coral.light,
            }}
          >
            {/* Header con icono de alerta */}
            <div className="p-4 border-b" style={{ borderColor: colors.gray[200] }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: colors.coral.light }}
                >
                  <AlertTriangle size={20} style={{ color: colors.coral.dark }} />
                </div>
                <div className="flex-1">
                  <h3
                    className="text-base font-bold"
                    style={{ color: colors.blue.primary }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: colors.gray[500] }}>
                    {description}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={16} style={{ color: colors.gray[500] }} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-colors"
                style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[200]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
              >
                {cancelLabel}
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all shadow-sm"
                style={{
                  backgroundColor: colors.coral.dark,
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.coral.darkest}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.coral.dark}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}