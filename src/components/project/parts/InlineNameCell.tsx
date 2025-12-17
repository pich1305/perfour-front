// src/components/project/parts/InlineNameCell.tsx
import React, { useRef, useState } from 'react';

interface InlineNameCellProps {
  value: string;
  onCommit: (next: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function InlineNameCell({ value, onCommit, className = '', placeholder = '', autoFocus = false }: InlineNameCellProps) {
  const [editing, setEditing] = useState(autoFocus);
  const [editingValue, setEditingValue] = useState(value ?? '');
  const spanRef = useRef<HTMLSpanElement | null>(null);

  if (editing) {
    return (
      <input
        type="text"
        className={`border rounded px-2 py-1 text-sm ${className}`}
        style={{ width: `${Math.max(spanRef.current?.offsetWidth || 0, 100)}px` }}
        value={editingValue}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setEditingValue(e.target.value)}
        onBlur={() => {
          const newVal = editingValue.trim();
          if (newVal && newVal !== value) onCommit(newVal);
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
      {value || <span className="text-gray-400 italic">{placeholder}</span>}
    </span>
  );
}


