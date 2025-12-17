// src/features/tasks/components/GanttTooltip.tsx
import React from 'react';

type AnyTask = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress?: number;
  styles?: any;
};

interface GanttTooltipProps {
  task: AnyTask;
  fontSize?: string;
  fontFamily?: string;
}

export const GanttTooltip: React.FC<GanttTooltipProps> = ({ task }) => {
  const start = task.start instanceof Date ? task.start.toLocaleDateString() : '';
  const end = task.end instanceof Date ? task.end.toLocaleDateString() : '';
  return (
    <div className="bg-white text-gray-800 text-xs rounded-lg shadow-lg border border-gray-200 p-2 max-w-[220px]">
      <div className="font-semibold text-gray-900 mb-1 truncate" title={task.name}>{task.name}</div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1">
        <span className="text-gray-500">Inicio</span>
        <span className="text-gray-700">{start}</span>
        <span className="text-gray-500">Fin</span>
        <span className="text-gray-700">{end}</span>
        <span className="text-gray-500">Progreso</span>
        <span className="text-gray-700">{Math.round(task.progress ?? 0)}%</span>
      </div>
    </div>
  );
};


