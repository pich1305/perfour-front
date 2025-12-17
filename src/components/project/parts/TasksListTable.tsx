// src/components/project/parts/TasksListTable.tsx
import React, { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { TaskElement, TaskElementType, TaskPriority, VettelTaskStatus } from '@/types';
import { GroupRow } from './rows/GroupRow';
import { TaskRow } from './rows/TaskRow';
import { CreateGroupIcon, CreateSubgroupIcon, CreateMilestoneIcon } from './CreateActionIcons';

interface TasksListTableProps {
  groupTree: { group: TaskElement; children: TaskElement[] }[];
  expandedGroups: Set<string>;
  toggleGroupExpand: (id: string) => void;
  handleInlineUpdate: (task: TaskElement, updates: Partial<TaskElement>) => void;
  assigneesCountByTaskId: Record<string, number>;
  myAssigneesByTaskId: Record<string, any>;
  handleAssignMe: (taskId: string) => void;
  handleUnassignMe: (taskId: string) => void;
  openAssigneesModal: (taskId: string) => void;
  onOpenGroupSidebar: (groupId: string) => void;
  createGroup: () => void;
  createSubgroup: (parentId: string) => void;
  createMilestone: (parentId: string) => void;
  quickName?: string;
  setQuickName?: (v: string) => void;
  onQuickCreate?: () => void;
  onShareTask?: (task: TaskElement) => void;
}

export function TasksListTable(props: TasksListTableProps) {
  const { groupTree, expandedGroups, toggleGroupExpand, handleInlineUpdate, assigneesCountByTaskId, myAssigneesByTaskId, handleAssignMe, handleUnassignMe, openAssigneesModal, onOpenGroupSidebar, createGroup, createSubgroup, createMilestone, quickName, setQuickName, onQuickCreate, onShareTask } = props;

  const renderTaskRow = (task: TaskElement, depth: number) => (
    <TaskRow
      key={task.id}
      task={task}
      depth={depth}
      onUpdate={(u) => handleInlineUpdate(task, u)}
      assigneesCount={assigneesCountByTaskId[task.id] ?? 0}
      isAssignedToMe={!!myAssigneesByTaskId[task.id]}
      onAssignMe={() => handleAssignMe(task.id)}
      onUnassignMe={() => handleUnassignMe(task.id)}
      onOpenAssignees={() => openAssigneesModal(task.id)}
      onShare={() => onShareTask && onShareTask(task)}
    />
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-[1400px] w-full text-left table-fixed" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <colgroup>{[
          <col key="name" style={{ width: '20%' }} />, 
          <col key="status" />, 
          <col key="start" style={{ width: '10%' }} />, 
          <col key="end" style={{ width: '10%' }} />, 
          <col key="assignee" style={{ width: '10%' }} />, 
          <col key="priority" style={{ width: '7%' }} />, 
          <col key="prede" style={{ width: '7%' }} />, 
          <col key="succe" style={{ width: '7%' }} />, 
          <col key="qc" />
        ]}</colgroup>
        <thead>
          <tr className="text-xs uppercase text-black border-b" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Name</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Status</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Start Date</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">End Date</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Assignee</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">Priority</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">prede.</th>
            <th className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">succe.</th>
            <th className="py-1 px-2 whitespace-nowrap">Quality Control</th>
          </tr>
        </thead>
        <tbody className="text-xs">
          {groupTree.length === 0 && (
            <tr>
              <td className="py-1 px-2 border-r border-gray-200 last:border-r-0">
                <input
                  type="text"
                  placeholder="Escribe un nombre de tarea y presiona Enter"
                  className="w-full border rounded px-2 py-1 text-xs"
                  value={quickName || ''}
                  onChange={(e) => setQuickName && setQuickName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && onQuickCreate) {
                      e.preventDefault();
                      onQuickCreate();
                    }
                  }}
                />
              </td>
              <td className="py-1 px-2 text-gray-400" colSpan={8}>
                Los demás campos se habilitarán al crear la primera tarea
              </td>
            </tr>
          )}
          {groupTree.map(({ group, children }) => (
            <Fragment key={group.id}>
              <GroupRow
                group={group}
                expanded={expandedGroups.has(group.id)}
                onToggleExpand={() => toggleGroupExpand(group.id)}
                onUpdate={(u) => handleInlineUpdate(group, u)}
                assigneesCount={assigneesCountByTaskId[group.id] ?? 0}
                isAssignedToMe={!!myAssigneesByTaskId[group.id]}
                onAssignMe={() => handleAssignMe(group.id)}
                onUnassignMe={() => handleUnassignMe(group.id)}
                onOpenAssignees={() => openAssigneesModal(group.id)}
                onOpenSidebar={() => onOpenGroupSidebar(group.id)}
                onCreateGroup={createGroup}
                onCreateSubgroup={() => createSubgroup(group.id)}
                onCreateMilestone={() => createMilestone(group.id)}
              />
              {expandedGroups.has(group.id) && [
                ...children.map((child) => renderTaskRow(child, 1)),
                (
                  <tr key={`${group.id}-actions`} className="border-b last:border-b-0">
                    <td className="py-1 px-2 border-r border-gray-200 last:border-r-0">
                      <div className="flex items-center gap-2 ml-8">
                        <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createGroup()} title="Crear grupo">
                          <span className="text-sm leading-none">+</span>
                          <CreateGroupIcon className="w-[19px] h-[8px]" />
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createSubgroup(group.id)} title="Crear subgrupo dentro">
                          <span className="text-sm leading-none">+</span>
                          <CreateSubgroupIcon className="w-[14px] h-[10px]" />
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createMilestone(group.id)} title="Crear hito">
                          <span className="text-sm leading-none">+</span>
                          <CreateMilestoneIcon className="w-[11px] h-[11px]" />
                        </button>
                      </div>
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0" />
                    <td className="py-1 px-2 text-gray-500 whitespace-nowrap" />
                  </tr>
                )
              ]}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}


