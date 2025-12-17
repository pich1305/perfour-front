// src/components/project/parts/GanttLeftList.tsx
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { TaskElement } from '@/types/project';

interface GanttLeftListProps {
  items: { task: TaskElement; depth: number }[];
  onEdit: (task: TaskElement) => void;
  onDelete: (task: TaskElement) => void;
}

export function GanttLeftList({ items, onEdit, onDelete }: GanttLeftListProps) {
  return (
    <div className="w-[360px] min-w-[300px] max-w-[420px] border-r overflow-y-auto p-4 space-y-2">
      {items.map(({ task, depth }) => (
        <div key={task.id} className="border p-3 rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-black" style={{ paddingLeft: depth * 12 }}>
                {task.name}
              </h3>
              {task.description && (
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-1">
                {new Date(task.plannedStartDate).toLocaleDateString()} –{' '}
                {new Date(task.plannedEndDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(task)}
                className="p-1 hover:text-blue-600"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1 hover:text-red-600"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


