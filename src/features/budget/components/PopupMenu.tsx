"use client";

import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define la estructura de las opciones que el menú recibirá
interface Option {
  value: string;
  label: string;
  colorClass: string;
  hoverClass: string;
}

// Define las props que el componente acepta
interface ManualPopupMenuProps {
  children: ReactNode; // El elemento que funcionará como botón para abrir el menú
  title: string;
  options: Option[];
  onSelect: (value: string) => void;
}

export default function ManualPopupMenu({ children, title, options, onSelect }: ManualPopupMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    // Añade el listener cuando el menú está abierto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    // Limpia el listener cuando el componente se desmonta o el menú se cierra
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">

      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="absolute z-20 top-full right-0 mt-2 bg-white rounded-lg shadow-xl p-3 border border-gray-100 min-w-[160px]"
          >

            <h4 className="text-xs font-semibold text-gray-500 mb-2 px-1">{title}</h4>
            <div className="flex flex-col gap-1.5">
              {options.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-center text-sm font-medium px-3 py-1.5 rounded-md transition-opacity ${option.colorClass} ${option.hoverClass}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}