// src/features/tasks/components/TabsIcons.tsx
import React from 'react';
import { BarChart3, List, Layout } from 'lucide-react';

export function GanttTabIcon({ className = '' }: { className?: string }) {
  return (
    <BarChart3 className={className} size={16} />
  );
}

export function ListTabIcon({ className = '', dim = false }: { className?: string; dim?: boolean }) {
  return (
    <List className={`${className} ${dim ? 'opacity-40' : ''}`} size={16} />
  );
}

export function BoardTabIcon({ className = '', dim = false }: { className?: string; dim?: boolean }) {
  return (
    <Layout className={`${className} ${dim ? 'opacity-40' : ''}`} size={16} />
  );
}


