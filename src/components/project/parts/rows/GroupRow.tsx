// src/components/project/parts/rows/GroupRow.tsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { TaskElement, TaskPriority, VettelTaskStatus } from '@/types/project';
import { InlineNameCell } from '../InlineNameCell';
import { CommentIcon } from '../CommentIcon';
import { StatusDropdown } from '../StatusDropdown';
import { InlineDateCell } from '../InlineDateCell';
import { AssigneesCell } from '../AssigneesCell';
import { PriorityDropdown } from '../PriorityDropdown';
import { CreateGroupIcon, CreateSubgroupIcon, CreateMilestoneIcon } from '../CreateActionIcons';

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
}

export function GroupRow({ group, expanded, onToggleExpand, onUpdate, assigneesCount, isAssignedToMe, onAssignMe, onUnassignMe, onOpenAssignees, onOpenSidebar, onCreateGroup, onCreateSubgroup, onCreateMilestone }: GroupRowProps) {
  return (
    <>
      <tr className="border-b last:border-b-0 hover:bg-gray-50">
        <td className="py-2 px-2 border-r border-gray-200 last:border-r-0">
          <div className="flex items-center gap-1">
            <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100" onClick={onToggleExpand} title={expanded ? 'Colapsar' : 'Expandir'}>
              {expanded ? (
                <svg className="w-2 h-2 text-gray-600" width="2" height="1" viewBox="0 0 6 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.3 2.775C3.12222 2.90833 2.87778 2.90833 2.7 2.775L0.2 0.9C-0.184405 0.611696 0.0194939 0 0.5 0H5.5C5.98051 0 6.1844 0.611696 5.8 0.9L3.3 2.775Z" fill="#1D1B20"/>
                </svg>
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <div className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing">
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 5.5C1.77614 5.5 2 5.27614 2 5C2 4.72386 1.77614 4.5 1.5 4.5C1.22386 4.5 1 4.72386 1 5C1 5.27614 1.22386 5.5 1.5 5.5Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 2C1.77614 2 2 1.77614 2 1.5C2 1.22386 1.77614 1 1.5 1C1.22386 1 1 1.22386 1 1.5C1 1.77614 1.22386 2 1.5 2Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 9C1.77614 9 2 8.77614 2 8.5C2 8.22386 1.77614 8 1.5 8C1.22386 8 1 8.22386 1 8.5C1 8.77614 1.22386 9 1.5 9Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.5 5.5C4.77614 5.5 5 5.27614 5 5C5 4.72386 4.77614 4.5 4.5 4.5C4.22386 4.5 4 4.72386 4 5C4 5.27614 4.22386 5.5 4.5 5.5Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.5 2C4.77614 2 5 1.77614 5 1.5C5 1.22386 4.77614 1 4.5 1C4.22386 1 4 1.22386 4 1.5C4 1.77614 4.22386 2 4.5 2Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.5 9C4.77614 9 5 8.77614 5 8.5C5 8.22386 4.77614 8 4.5 8C4.22386 8 4 8.22386 4 8.5C4 8.77614 4.22386 9 4.5 9Z" stroke="black" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
          <InlineDateCell valueISO={group.plannedStartDate} onCommit={(iso: string) => onUpdate({ plannedStartDate: iso } as any)} />
        </td>
        <td className="py-2 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
          <InlineDateCell valueISO={group.plannedEndDate} onCommit={(iso: string) => onUpdate({ plannedEndDate: iso } as any)} />
        </td>
        <td className="py-2 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
          <AssigneesCell count={assigneesCount} isAssignedToMe={isAssignedToMe} onAssignMe={onAssignMe} onUnassignMe={onUnassignMe} onOpenList={onOpenAssignees} />
        </td>
        <td className="py-2 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
          <PriorityDropdown value={group.priority as TaskPriority} onChange={(p: TaskPriority) => onUpdate({ priority: p })} />
        </td>
        <td className="py-2 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
        <td className="py-2 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
        <td className="py-2 px-2 text-gray-500 whitespace-nowrap">—</td>
      </tr>
    </>
  );
}


