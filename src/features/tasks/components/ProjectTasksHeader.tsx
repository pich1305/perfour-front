// src/features/tasks/components/ProjectTasksHeader.tsx
import React, { useRef, useEffect } from 'react';
import { Search, Filter, Download, Users, Circle, FileText, ChevronRight } from 'lucide-react';
import { ViewMode } from 'gantt-task-react';
import { GanttTabIcon, ListTabIcon, BoardTabIcon } from './TabsIcons';
import { VettelTaskStatus } from '@/types';

interface ProjectTasksHeaderProps {
  packageName?: string;
  tasksTab: 'gantt' | 'list' | 'board';
  setTasksTab: (tab: 'gantt' | 'list' | 'board') => void;
  viewMode: ViewMode;
  setViewMode: (vm: ViewMode) => void;
  onBack: () => void;
  onNewTask?: () => void;
  hasElements?: boolean;
}

export function ProjectTasksHeader({ packageName, tasksTab, setTasksTab, viewMode, setViewMode, onBack, hasElements = true }: ProjectTasksHeaderProps) {
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [selectedSubmenu, setSelectedSubmenu] = React.useState<'people' | 'status' | 'rfi' | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<VettelTaskStatus>(VettelTaskStatus.NOT_STARTED);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
        setSelectedSubmenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="px-6 py-4">
      <div className="mt-2 flex justify-between items-end border-b border-gray-200">
        <div className="flex gap-4">
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
        {/* Botón Export con el mismo diseño que Filter */}
        <button
          className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 w-24 mb-1"
          onClick={() => {/* TODO: implementar funcionalidad de export */}}
        >
          <span className="text-sm">Export</span>
          <Download size={14} />
        </button>
      </div>
      {hasElements && (
        <div className="mt-2 flex items-center justify-between">
          {/* Botones de Search y Filter en el lado izquierdo */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 w-32"
              onClick={() => {/* TODO: implementar funcionalidad de search */}}
            >
              <span className="text-sm">Search</span>
              <Search size={14} />
            </button>
            <div className="relative">
              <button
                ref={filterButtonRef}
                className="flex items-center justify-between px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-600 w-24"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <span className="text-sm">Filter</span>
                <Filter size={14} />
              </button>
              
              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div 
                  ref={filterDropdownRef}
                  className="absolute mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 py-1 z-50"
                  style={{ top: '100%', left: 0 }}
                >
                  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-500">Filter</span>
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        // TODO: limpiar filtros
                        setIsFilterOpen(false);
                      }}
                    >
                      clear
                    </button>
                  </div>
                  {selectedSubmenu === null && (
                    <>
                      <button 
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left"
                        onClick={() => setSelectedSubmenu('people')}
                      >
                        <Users className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">People</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left"
                        onClick={() => setSelectedSubmenu('status')}
                      >
                        <Circle className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">Status</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left"
                        onClick={() => setSelectedSubmenu('rfi')}
                      >
                        <FileText className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">RFI</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    </>
                  )}
                  
                  {selectedSubmenu === 'status' && (
                    <div className="w-full">
                      <button
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left border-b border-gray-200"
                        onClick={() => setSelectedSubmenu(null)}
                      >
                        <Circle className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">Status</span>
                      </button>
                      <div className="py-2">
                        {Object.values(VettelTaskStatus).map((status) => {
                          const cfg = {
                            [VettelTaskStatus.NOT_STARTED]: { label: 'not started', bg: '#E5E7EB', text: '#374151' },
                            [VettelTaskStatus.IN_PROGRESS]: { label: 'in progress', bg: '#A8D8EA', text: '#1E3A8A' },
                            [VettelTaskStatus.PAUSED]: { label: 'paused', bg: '#F7C59F', text: '#92400E' },
                            [VettelTaskStatus.COMPLETED]: { label: 'completed', bg: '#529256', text: '#0F5132' },
                            [VettelTaskStatus.OVERDUE]: { label: 'overdue', bg: '#F4A7A1', text: '#991B1B' },
                            [VettelTaskStatus.CANCELLED]: { label: 'cancelled', bg: '#A8D8EA', text: '#1E3A8A' },
                          }[status];
                          
                          return (
                            <button
                              key={status}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                              style={{ backgroundColor: cfg.bg, color: cfg.text }}
                              onClick={() => {
                                setSelectedStatus(status);
                                // TODO: Aplicar filtro de status
                                setIsFilterOpen(false);
                                setSelectedSubmenu(null);
                              }}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmenu === 'people' && (
                    <div className="w-full">
                      <button
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left border-b border-gray-200"
                        onClick={() => setSelectedSubmenu(null)}
                      >
                        <Users className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">People</span>
                      </button>
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {/* TODO: Implementar filtro de personas asignadas */}
                      </div>
                    </div>
                  )}
                  
                  {selectedSubmenu === 'rfi' && (
                    <div className="w-full">
                      <button
                        className="w-full flex items-center px-4 py-2 hover:bg-gray-50 text-left border-b border-gray-200"
                        onClick={() => setSelectedSubmenu(null)}
                      >
                        <FileText className="w-4 h-4 text-gray-600 mr-3" />
                        <span className="text-sm text-gray-700 flex-1">RFI</span>
                      </button>
                      <div className="px-4 py-2 text-sm text-gray-500">
                        {/* TODO: Implementar filtro de RFI */}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Selector de viewMode eliminado - siempre vista de días */}
        </div>
      )}
    </div>
  );
}


