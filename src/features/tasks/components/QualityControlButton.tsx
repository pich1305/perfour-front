// src/features/tasks/components/QualityControlButton.tsx
import React from 'react';

interface QualityControlButtonProps {
  count: number;
  label?: string;
  onClick?: () => void;
}

export function QualityControlButton({ count, label = 'Inspeccion Electrica', onClick }: QualityControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center px-3 py-1 rounded-2xl text-[11px] font-medium text-black"
      style={{
        background: 'linear-gradient(90deg, rgba(205,180,219,1) 0%, rgba(162,210,255,1) 100%)',
      }}
      title="Quality Control"
    >
      <span className="truncate max-w-[120px]">{label}</span>
      {Number.isFinite(count) && count > 0 && (
        <span
          className="absolute -bottom-1 -right-1 text-[10px] leading-none px-1.5 py-1 rounded-md bg-gray-200 text-gray-900 shadow"
        >
          +{count}
        </span>
      )}
    </button>
  );
}


