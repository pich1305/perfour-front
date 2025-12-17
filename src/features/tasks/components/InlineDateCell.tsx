// src/features/tasks/components/InlineDateCell.tsx
import React, { useRef, useState } from 'react';
import { Calendar } from 'lucide-react';

interface InlineDateCellProps {
  valueISO?: string;
  onCommit: (nextISO: string) => void;
  className?: string;
}

const toDateInputValue = (value?: string | Date) => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const dateInputToISOString = (value: string) => {
  const localMidnight = new Date(value + 'T00:00:00');
  return localMidnight.toISOString();
};

export function InlineDateCell({ valueISO, onCommit, className = '' }: InlineDateCellProps) {
  const [editing, setEditing] = useState(false);
  const [editingValue, setEditingValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="date"
        className={`border rounded px-2 py-1 text-sm w-full ${className}`}
        value={editingValue}
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={() => {
          const v = editingValue;
          if (v) {
            const iso = dateInputToISOString(v);
            if (iso !== valueISO) onCommit(iso);
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          if (e.key === 'Escape') setEditing(false);
        }}
        autoFocus
      />
    );
  }

  return (
    <span
      className={`cursor-text inline-flex items-center ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
        setEditingValue(valueISO ? toDateInputValue(valueISO) : '');
        requestAnimationFrame(() => {
          const ref = inputRef.current;
          if (ref) {
            try {
              // @ts-ignore
              if (typeof ref.showPicker === 'function') ref.showPicker(); else ref.focus();
            } catch { ref.focus(); }
          }
        });
      }}
    >
      <Calendar className="w-4 h-4 text-black mr-1" />
      {valueISO ? new Date(valueISO).toLocaleDateString() : ''}
    </span>
  );
}


