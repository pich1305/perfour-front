// src/components/project/parts/PriorityIcons.tsx
import React from 'react';
import { TaskPriority } from '@/types';

export function PriorityIconMedium({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1H11M1 6H11" stroke="#F7C59F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PriorityIconLow({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="6" viewBox="0 0 14 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 5L13 1" stroke="#1E6AA5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PriorityIconHigh({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="6" viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 5L6 1L1 5" stroke="#C86761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PriorityIconCritical({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4.75L6 1L1 4.75M11 10L6 6.25L1 10" stroke="#C86761" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function PriorityIcon({ priority, className = '' }: { priority: TaskPriority; className?: string }) {
  switch (priority) {
    case TaskPriority.LOW:
      return <PriorityIconLow className={className} />;
    case TaskPriority.MEDIUM:
      return <PriorityIconMedium className={className} />;
    case TaskPriority.HIGH:
      return <PriorityIconHigh className={className} />;
    case TaskPriority.CRITICAL:
      return <PriorityIconCritical className={className} />;
    default:
      return <PriorityIconMedium className={className} />;
  }
}


