// src/features/tasks/components/rows/TaskRow.tsx
import React from 'react';
import { ChevronRight, GripVertical, Share2, ArrowUpLeft, ArrowDownRight } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskElement, TaskPriority, VettelTaskStatus } from '@/types';
import { InlineNameCell } from '../InlineNameCell';
import { CommentIcon } from '../CommentIcon';
import { StatusDropdown } from '../StatusDropdown';
import { InlineDateCell } from '../InlineDateCell';
import { AssigneesCell } from '../AssigneesCell';
import { PriorityDropdown } from '../PriorityDropdown';
import { QualityControlButton } from '../QualityControlButton';

interface TaskRowProps {
  task: TaskElement;
  depth: number;
  onUpdate: (updates: Partial<TaskElement>) => void;
  assigneesCount: number;
  isAssignedToMe: boolean;
  onAssignMe: () => void;
  onUnassignMe: () => void;
  onOpenAssignees: () => void;
  onShare?: () => void;
  onOpenDependencies?: (taskId: string, position?: { x: number; y: number }) => void;
}

export function TaskRow({ task, depth, onUpdate, assigneesCount, isAssignedToMe, onAssignMe, onUnassignMe, onOpenAssignees, onShare, onOpenDependencies }: TaskRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deps: any[] = Array.isArray((task as any).dependencies) ? (task as any).dependencies : [];
  const predecessorsCount = Array.isArray((task as any).predecessorDependencies)
    ? (task as any).predecessorDependencies.length
    : deps.filter((d: any) => d && d.successorId === task.id).length;
  const successorsCount = Array.isArray((task as any).successorDependencies)
    ? (task as any).successorDependencies.length
    : deps.filter((d: any) => d && d.predecessorId === task.id).length;
  return (
    <tr ref={setNodeRef} style={style} {...attributes} key={task.id} className="border-b last:border-b-0 hover:bg-gray-50" data-task-id={task.id}>
      <td className="py-1 px-2 border-l border-r border-gray-200 last:border-r-0">
        <div className="flex items-center">
          <div style={{ width: depth * 32 }} />
          {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 mr-1" />}
          <div {...listeners} className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing mr-1" data-drag-handle>
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <InlineNameCell value={task.name || ''} onCommit={(newVal) => onUpdate({ name: newVal })} />
              <CommentIcon commentCount={task.commentsCount || 0} />
            </div>
            {depth > 0 && (
              <button
                type="button"
                className="w-4 h-4 flex items-center justify-center ml-2"
                onClick={onShare}
                title="Compartir"
              >
                <Share2 className="w-3 h-3 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <StatusDropdown value={task.status as VettelTaskStatus} onChange={(s: VettelTaskStatus) => onUpdate({ status: s })} className="w-[80%] mx-[10%] justify-center" />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
        <InlineDateCell valueISO={task.plannedStartDate} onCommit={(iso: string) => onUpdate({ plannedStartDate: iso } as any)} />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
        <InlineDateCell valueISO={task.plannedEndDate} onCommit={(iso: string) => onUpdate({ plannedEndDate: iso } as any)} />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
        <AssigneesCell count={assigneesCount} isAssignedToMe={isAssignedToMe} onAssignMe={onAssignMe} onUnassignMe={onUnassignMe} onOpenList={onOpenAssignees} />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
        <PriorityDropdown value={task.priority as TaskPriority} onChange={(p: TaskPriority) => onUpdate({ priority: p })} />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 cursor-pointer text-center" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onOpenDependencies && onOpenDependencies(task.id, { x: rect.right, y: rect.top });
      }}>
        <div className="inline-flex items-center gap-1">
          <ArrowUpLeft className="w-3 h-3 text-gray-600" />
          {predecessorsCount > 0 && <span>{predecessorsCount}</span>}
        </div>
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 cursor-pointer text-center" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onOpenDependencies && onOpenDependencies(task.id, { x: rect.right, y: rect.top });
      }}>
        <div className="inline-flex items-center gap-1">
          <ArrowDownRight className="w-3 h-3 text-gray-600" />
          {successorsCount > 0 && <span>{successorsCount}</span>}
        </div>
      </td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
        <QualityControlButton count={Array.isArray((task as any).qualityChecks) ? (task as any).qualityChecks.length : 0} />
      </td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200">
        -
      </td>
    </tr>
  );
}


