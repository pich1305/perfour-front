// src/components/project/parts/Badges.tsx
import React from 'react';
import { TaskPriority, VettelTaskStatus } from '@/types/project';

export function StatusBadge({ status }: { status: VettelTaskStatus }) {
  const map: Record<VettelTaskStatus, { label: string; className: string }> = {
    [VettelTaskStatus.NOT_STARTED]: { label: 'not started', className: 'bg-gray-200 text-gray-700' },
    [VettelTaskStatus.IN_PROGRESS]: { label: 'in progress', className: 'bg-blue-100 text-blue-700' },
    [VettelTaskStatus.PAUSED]: { label: 'paused', className: 'bg-orange-100 text-orange-700' },
    [VettelTaskStatus.COMPLETED]: { label: 'completed', className: 'bg-emerald-100 text-emerald-700' },
    [VettelTaskStatus.OVERDUE]: { label: 'overdue', className: 'bg-red-100 text-red-700' },
    [VettelTaskStatus.CANCELLED]: { label: 'cancelled', className: 'bg-purple-100 text-purple-700' },
  };
  const cfg = map[status] ?? map[VettelTaskStatus.NOT_STARTED];
  return <span className={`px-2 py-1 rounded text-[11px] font-medium ${cfg.className}`}>{cfg.label}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; className: string }> = {
    [TaskPriority.LOW]: { label: 'low', className: 'text-gray-600' },
    [TaskPriority.MEDIUM]: { label: 'medium', className: 'text-gray-800' },
    [TaskPriority.HIGH]: { label: 'high', className: 'text-amber-700' },
    [TaskPriority.CRITICAL]: { label: 'critical', className: 'text-red-700' },
  };
  const cfg = map[priority] ?? map[TaskPriority.MEDIUM];
  return <span className={`px-2 py-1 rounded text-[11px] font-medium bg-gray-100 ${cfg.className}`}>{cfg.label}</span>;
}


