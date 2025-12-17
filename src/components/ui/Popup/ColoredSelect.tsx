// src/components/ui/ColoredSelect.tsx

'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  colorClass: string;
}

interface ColoredSelectProps {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label: string;
}

export default function ColoredSelect({
  options,
  selectedValue,
  onSelect,
  label,
}: ColoredSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  return (
    <div className="relative inline-block text-left w-full max-w-xs">
      <span className="block text-sm font-medium text-gray-600 mb-1">{label}</span>

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
      >
        <span
          className={`px-2 py-0.5 rounded-md ${selectedOption?.colorClass || 'bg-gray-200'}`}
        >
          {selectedOption?.label || 'None'}
        </span>
        <ChevronDown size={16} className="ml-2 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-md">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="px-3 py-1 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              <span className={`px-2 py-0.5 text-sm rounded-md ${opt.colorClass}`}>
                {opt.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
