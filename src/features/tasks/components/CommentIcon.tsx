// src/features/tasks/components/CommentIcon.tsx
import React from 'react';
import { MessageCircle } from 'lucide-react';

export function CommentIcon({ className = '', commentCount = 0 }: { className?: string; commentCount?: number }) {
  if (commentCount <= 0) return null;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md border border-gray-200 ${className}`}>
      <MessageCircle className="w-3 h-3 text-gray-500" />
      <span className="text-xs text-gray-700 font-medium">{commentCount}</span>
    </div>
  );
}


