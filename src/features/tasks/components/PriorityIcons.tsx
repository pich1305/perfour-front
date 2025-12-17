// src/features/tasks/components/PriorityIcons.tsx
import React from 'react';
import { Minus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { TaskPriority } from '@/types';

export function PriorityIconMedium({ className = '' }: { className?: string }) {
  return (
    <Minus className={`${className} text-orange-400`} size={16} />
  );
}

export function PriorityIconLow({ className = '' }: { className?: string }) {
  return (
    <ChevronDown className={`${className} text-blue-600`} size={16} />
  );
}

export function PriorityIconHigh({ className = '' }: { className?: string }) {
  return (
    <ChevronUp className={`${className} text-red-500`} size={16} />
  );
}

export function PriorityIconCritical({ className = '' }: { className?: string }) {
  return (
    <AlertTriangle className={`${className} text-red-600`} size={16} />
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


