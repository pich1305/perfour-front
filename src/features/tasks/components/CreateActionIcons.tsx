// src/features/tasks/components/CreateActionIcons.tsx
import React from 'react';
import { FolderPlus, Layers, Flag, CheckSquare } from 'lucide-react';

export function CreateGroupIcon({ className = '' }: { className?: string }) {
  return (
    <FolderPlus className={`${className} text-orange-400`} size={16} />
  );
}

export function CreateSubgroupIcon({ className = '' }: { className?: string }) {
  return (
    <Layers className={`${className} text-pink-400`} size={16} />
  );
}

export function CreateMilestoneIcon({ className = '' }: { className?: string }) {
  return (
    <Flag className={`${className} text-pink-400`} size={16} />
  );
}

export function CreateTaskIcon({ className = '' }: { className?: string }) {
  return (
    <CheckSquare className={`${className} text-blue-400`} size={16} />
  );
}


