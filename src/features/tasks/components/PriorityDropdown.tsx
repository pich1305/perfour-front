// src/features/tasks/components/PriorityDropdown.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { TaskPriority } from '@/types';
import { PriorityIcon } from './PriorityIcons';

interface PriorityDropdownProps {
  value: TaskPriority;
  onChange: (next: TaskPriority) => void;
}

const CLASS_BY_PRIORITY: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'text-gray-700',
  [TaskPriority.MEDIUM]: 'text-gray-900',
  [TaskPriority.HIGH]: 'text-amber-700',
  [TaskPriority.CRITICAL]: 'text-red-700',
};

export function PriorityDropdown({ value, onChange }: PriorityDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const calculateMenuPosition = (buttonEl: HTMLButtonElement | null) => {
    if (!buttonEl) return null;
    const rect = buttonEl.getBoundingClientRect();
    const menuWidth = 220;
    const menuHeight = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;
    const margin = 8;
    let top: number;
    let left: number;
    if (spaceBelow < menuHeight && rect.top > spaceBelow) {
      top = rect.top + window.scrollY - menuHeight + rect.height + 2;
    } else {
      top = rect.bottom + window.scrollY + margin;
    }
    if (spaceRight < menuWidth) {
      left = rect.right + window.scrollX - menuWidth;
    } else {
      left = rect.left + window.scrollX;
    }
    left = Math.max(margin, left);
    left = Math.min(window.innerWidth - menuWidth - margin, left);
    return { top: Math.max(margin, top), left };
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    if (open) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const className = CLASS_BY_PRIORITY[value] ?? CLASS_BY_PRIORITY[TaskPriority.MEDIUM];

  return (
    <>
      <button
        ref={buttonRef}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) setMenuPos(calculateMenuPosition(buttonRef.current));
          setOpen((prev) => !prev);
        }}
      >
        <PriorityIcon priority={value} />
        {/* Quitar chevron */}
      </button>
      {open && menuPos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[180px] max-w-[220px] flex flex-col"
          style={{ position: 'absolute', top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          <div className="px-4 py-2 text-xs text-gray-500 border-b">Cambiar prioridad</div>
          {Object.values(TaskPriority).map((p) => {
            const active = p === value;
            return (
              <button
                key={p}
                className={`text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${active ? 'font-semibold' : ''}`}
                onClick={() => { onChange(p as TaskPriority); setOpen(false); }}
              >
                <PriorityIcon priority={p as TaskPriority} />
                <span className="text-gray-700 capitalize">{String(p).toLowerCase()}</span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}


