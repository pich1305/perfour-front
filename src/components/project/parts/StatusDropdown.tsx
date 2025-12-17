// src/components/project/parts/StatusDropdown.tsx
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { VettelTaskStatus } from '@/types';

interface StatusDropdownProps {
  value: VettelTaskStatus;
  onChange: (next: VettelTaskStatus) => void;
  className?: string;
  style?: React.CSSProperties;
}

const STATUS_STYLE: Record<VettelTaskStatus, { label: string; bg: string; text: string }> = {
  [VettelTaskStatus.NOT_STARTED]: { label: 'not started', bg: '#E5E7EB', text: '#374151' },
  [VettelTaskStatus.IN_PROGRESS]: { label: 'in progress', bg: '#A8D8EA', text: '#1E3A8A' },
  [VettelTaskStatus.PAUSED]: { label: 'paused', bg: '#F7C59F', text: '#92400E' },
  [VettelTaskStatus.COMPLETED]: { label: 'completed', bg: '#529256', text: '#0F5132' },
  [VettelTaskStatus.OVERDUE]: { label: 'overdue', bg: '#F4A7A1', text: '#991B1B' },
  [VettelTaskStatus.CANCELLED]: { label: 'cancelled', bg: '#A8D8EA', text: '#1E3A8A' },
} as const;

export function StatusDropdown({ value, onChange, className = '', style }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number; opensUpward?: boolean } | null>(null);
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
    let top;
    let left;
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
    const opensUpward = spaceBelow < menuHeight && rect.top > spaceBelow;
    return { top: Math.max(margin, top), left, opensUpward };
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && buttonRef.current.contains(target)) return;
      if (menuRef.current && menuRef.current.contains(target)) return;
      setOpen(false);
    };
    const handleScroll = (e: Event) => {
      if (menuRef.current && e.target && menuRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };
    if (open) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  const cfg = STATUS_STYLE[value] ?? STATUS_STYLE[VettelTaskStatus.NOT_STARTED];

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${className}`}
        style={{ backgroundColor: cfg.bg, color: cfg.text, ...style }}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) setMenuPos(calculateMenuPosition(buttonRef.current));
          setOpen((prev) => !prev);
        }}
      >
        {cfg.label}
        <ChevronDown className="h-3 w-3" style={{ color: cfg.text }} />
      </button>
      {open && menuPos && ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[180px] max-w-[220px] flex flex-col"
          style={{ position: 'absolute', top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
        >
          <div className="px-4 py-2 text-xs text-gray-500 border-b">Cambiar estado</div>
          {Object.values(VettelTaskStatus).map((s) => {
            const cfg2 = STATUS_STYLE[s as VettelTaskStatus] ?? STATUS_STYLE[VettelTaskStatus.NOT_STARTED];
            const active = s === value;
            return (
              <button
                type="button"
                key={s}
                className={`text-left px-4 py-2 text-sm ${active ? 'font-semibold' : ''}`}
                style={{ backgroundColor: cfg2.bg, color: cfg2.text }}
                onClick={(e) => { e.preventDefault(); onChange(s as VettelTaskStatus); setOpen(false); }}
              >
                {cfg2.label}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}


