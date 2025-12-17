// src/components/project/parts/ProjectTasksHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ViewMode } from 'gantt-task-react';
import { GanttTabIcon, ListTabIcon, BoardTabIcon } from './TabsIcons';

interface ProjectTasksHeaderProps {
  packageName?: string;
  tasksTab: 'gantt' | 'list' | 'board';
  setTasksTab: (tab: 'gantt' | 'list' | 'board') => void;
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;
  onBack: () => void;
  onNewTask: () => void;
}

export function ProjectTasksHeader({ packageName, tasksTab, setTasksTab, viewMode, setViewMode, onBack, onNewTask }: ProjectTasksHeaderProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl text-black font-semibold">Tareas de: {packageName}</h2>
        </div>
        {tasksTab === 'gantt' && (
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
            >
              <option value={ViewMode.Day}>Día</option>
              <option value={ViewMode.Week}>Semana</option>
              <option value={ViewMode.Month}>Mes</option>
            </select>
            <button
              onClick={onNewTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nueva Tarea
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-4 border-b border-gray-200">
        {(['gantt','list','board'] as const).map(tab => {
          const isActive = tasksTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setTasksTab(tab)}
              className={`relative text-sm inline-flex items-center gap-2 px-1 pb-1 focus:outline-none border-b-2 ${isActive ? 'text-black border-black' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
            >
              {tab === 'gantt' && <GanttTabIcon className="w-4 h-4" />}
              {tab === 'list' && <ListTabIcon className="w-4 h-4" />}
              {tab === 'board' && <BoardTabIcon className="w-4 h-4" />}
              {tab === 'gantt' ? 'Gantt' : tab === 'list' ? 'List' : 'Board'}
            </button>
          );
        })}
      </div>
    </div>
  );
}


