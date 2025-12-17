// src/features/tasks/components/InlineNameCell.tsx
import React, { useRef, useState } from 'react';

interface InlineNameCellProps {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  task?: any; // Para detectar si es un grupo temporal
}

export function InlineNameCell({ value, onCommit, className = '', placeholder = '', autoFocus = false, task }: InlineNameCellProps) {
  const [editing, setEditing] = useState(autoFocus);
  const [editingValue, setEditingValue] = useState(value ?? '');
  const spanRef = useRef<HTMLSpanElement | null>(null);

  if (editing) {
    return (
      <input
        type="text"
        className={`border-0 outline-none bg-transparent px-1 py-0 text-sm placeholder:text-xs placeholder:text-gray-400 placeholder:italic ${className}`}
        style={{ width: `${Math.max(spanRef.current?.offsetWidth || 0, 100)}px` }}
        value={editingValue}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={() => {
          const newVal = editingValue.trim();
          if (newVal && newVal !== value) {
            // Si es un grupo temporal, llamar a confirmTempGroup
            if (task?.isTemp && task?.id) {
              onCommit(newVal); // Esto debería llamar a confirmTempGroup
            } else {
              onCommit(newVal);
            }
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.currentTarget as HTMLInputElement).blur();
          else if (e.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      ref={spanRef}
      className={`text-black cursor-text ${className}`}
      onClick={() => { setEditingValue(value ?? ''); setEditing(true); }}
    >
      {value || <span className="text-gray-400 italic text-xs">{placeholder}</span>}
    </span>
  );
}


