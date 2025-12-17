// src/features/tasks/components/rows/GroupRow.tsx
import React from 'react';
import { ChevronRight, ChevronDown, GripVertical, ArrowUpLeft, ArrowDownRight } from 'lucide-react';
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

interface GroupRowProps {
  group: TaskElement;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<TaskElement>) => void;
  assigneesCount: number;
  isAssignedToMe: boolean;
  onAssignMe: () => void;
  onUnassignMe: () => void;
  onOpenAssignees: () => void;
  onOpenSidebar: () => void;
  onCreateGroup: () => void;
  onCreateSubgroup: () => void;
  onCreateMilestone: () => void;
  onCreateTask: () => void;
  onOpenDependencies?: (taskId: string, position?: { x: number; y: number }) => void;
}

export function GroupRow({ group, expanded, onToggleExpand, onUpdate, assigneesCount, isAssignedToMe, onAssignMe, onUnassignMe, onOpenAssignees, onOpenSidebar, onCreateGroup, onCreateSubgroup, onCreateMilestone, onCreateTask, onOpenDependencies }: GroupRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const deps: any[] = Array.isArray((group as any).dependencies) ? (group as any).dependencies : [];
  const predecessorsCount = Array.isArray((group as any).predecessorDependencies)
    ? (group as any).predecessorDependencies.length
    : deps.filter((d: any) => d && d.successorId === group.id).length;
  const successorsCount = Array.isArray((group as any).successorDependencies)
    ? (group as any).successorDependencies.length
    : deps.filter((d: any) => d && d.predecessorId === group.id).length;
  return (
    <>
      <tr ref={setNodeRef} style={style} {...attributes} className="border-b last:border-b-0 hover:bg-gray-50" data-task-id={group.id}>
        <td className="py-2 px-2 border-l border-r border-gray-200 last:border-r-0">
          <div className="flex items-center gap-1">
            {/* Solo mostrar botón de expansión para grupos */}
            {group.type === 'GROUP' && (
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100" onClick={onToggleExpand} title={expanded ? 'Colapsar' : 'Expandir'}>
                {expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
            <div {...listeners} className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing" data-drag-handle>
              <GripVertical className="w-3 h-3 text-gray-400" />
            </div>
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <InlineNameCell value={group.name || ''} onCommit={(newVal: string) => onUpdate({ name: newVal })} className="truncate" />
                  <CommentIcon commentCount={group.commentsCount || 0} />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="text-gray-700 hover:text-gray-900 text-lg px-1" title="Crear grupo" onClick={onCreateGroup}>+</button>
                <button className="text-gray-700 hover:text-gray-900 text-lg px-1" title="Más opciones" onClick={onOpenSidebar}>⋯</button>
              </div>
            </div>
          </div>
        </td>
        <td className="py-5 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
          <StatusDropdown value={group.status as VettelTaskStatus} onChange={(s: VettelTaskStatus) => onUpdate({ status: s })} className="w-[80%] mx-[10%] justify-center" />
        </td>
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
          <InlineDateCell valueISO={group.plannedStartDate} onCommit={(iso: string) => onUpdate({ plannedStartDate: iso } as any)} />
        </td>
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
          <InlineDateCell valueISO={group.plannedEndDate} onCommit={(iso: string) => onUpdate({ plannedEndDate: iso } as any)} />
        </td>
        <td className="py-2 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
          <AssigneesCell count={assigneesCount} isAssignedToMe={isAssignedToMe} onAssignMe={onAssignMe} onUnassignMe={onUnassignMe} onOpenList={onOpenAssignees} />
        </td>
        <td className="py-2 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
          <PriorityDropdown value={group.priority as TaskPriority} onChange={(p: TaskPriority) => onUpdate({ priority: p })} />
        </td>
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 cursor-pointer text-center" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onOpenDependencies && onOpenDependencies(group.id, { x: rect.right, y: rect.top });
        }}>
          <div className="inline-flex items-center gap-1">
            <ArrowUpLeft className="w-3 h-3 text-gray-600" />
            {predecessorsCount > 0 && <span>{predecessorsCount}</span>}
          </div>
        </td>
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0 cursor-pointer text-center" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onOpenDependencies && onOpenDependencies(group.id, { x: rect.right, y: rect.top });
        }}>
          <div className="inline-flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-gray-600" />
            {successorsCount > 0 && <span>{successorsCount}</span>}
          </div>
        </td>
        <td className="py-2 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0 text-center">
          <QualityControlButton count={Array.isArray((group as any).qualityChecks) ? (group as any).qualityChecks.length : 0} />
        </td>
        <td className="py-2 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200">
          -
        </td>
      </tr>
    </>
  );
}


