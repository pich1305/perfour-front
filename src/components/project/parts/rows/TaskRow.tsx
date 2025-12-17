// src/components/project/parts/rows/TaskRow.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { TaskElement, TaskPriority, VettelTaskStatus } from '@/types';
import { InlineNameCell } from '../InlineNameCell';
import { CommentIcon } from '../CommentIcon';
import { StatusDropdown } from '../StatusDropdown';
import { InlineDateCell } from '../InlineDateCell';
import { AssigneesCell } from '../AssigneesCell';
import { PriorityDropdown } from '../PriorityDropdown';

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
}

export function TaskRow({ task, depth, onUpdate, assigneesCount, isAssignedToMe, onAssignMe, onUnassignMe, onOpenAssignees, onShare }: TaskRowProps) {
  return (
    <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50">
      <td className="py-1 px-2 border-r border-gray-200 last:border-r-0">
        <div className="flex items-center">
          <div style={{ width: depth * 16 }} />
          {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 mr-1" />}
          <div className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing mr-1">
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 5.5C1.77614 5.5 2 5.27614 2 5C2 4.72386 1.77614 4.5 1.5 4.5C1.22386 4.5 1 4.72386 1 5C1 5.27614 1.22386 5.5 1.5 5.5Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 2C1.77614 2 2 1.77614 2 1.5C2 1.22386 1.77614 1 1.5 1C1.22386 1 1 1.22386 1 1.5C1 1.77614 1.22386 2 1.5 2Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 9C1.77614 9 2 8.77614 2 8.5C2 8.22386 1.77614 8 1.5 8C1.22386 8 1 8.22386 1 8.5C1 8.77614 1.22386 9 1.5 9Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 5.5C4.77614 5.5 5 5.27614 5 5C5 4.72386 4.77614 4.5 4.5 4.5C4.22386 4.5 4 4.72386 4 5C4 5.27614 4.22386 5.5 4.5 5.5Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 2C4.77614 2 5 1.77614 5 1.5C5 1.22386 4.77614 1 4.5 1C4.22386 1 4 1.22386 4 1.5C4 1.77614 4.22386 2 4.5 2Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.5 9C4.77614 9 5 8.77614 5 8.5C5 8.22386 4.77614 8 4.5 8C4.22386 8 4 8.22386 4 8.5C4 8.77614 4.22386 9 4.5 9Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 4.33333V6.33333C7 6.51014 6.92976 6.67971 6.80474 6.80474C6.67971 6.92976 6.51014 7 6.33333 7H1.66667C1.48986 7 1.32029 6.92976 1.19526 6.80474C1.07024 6.67971 1 6.51014 1 6.33333V1.66667C1 1.48986 1.07024 1.32029 1.19526 1.19526C1.32029 1.07024 1.48986 1 1.66667 1H3.66667M7 1L4 4M7 1H5M7 1V3" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <StatusDropdown value={task.status as VettelTaskStatus} onChange={(s: VettelTaskStatus) => onUpdate({ status: s })} className="w-[80%] mx-[10%] justify-center" />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <InlineDateCell valueISO={task.plannedStartDate} onCommit={(iso: string) => onUpdate({ plannedStartDate: iso } as any)} />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <InlineDateCell valueISO={task.plannedEndDate} onCommit={(iso: string) => onUpdate({ plannedEndDate: iso } as any)} />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <AssigneesCell count={assigneesCount} isAssignedToMe={isAssignedToMe} onAssignMe={onAssignMe} onUnassignMe={onUnassignMe} onOpenList={onOpenAssignees} />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <PriorityDropdown value={task.priority as TaskPriority} onChange={(p: TaskPriority) => onUpdate({ priority: p })} />
      </td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap">—</td>
    </tr>
  );
}


