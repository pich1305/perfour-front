// src/features/tasks/components/IntegratedGanttTable.tsx
import React, { useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Gantt, ViewMode } from 'gantt-task-react';
import { GripVertical } from 'lucide-react';
import { TaskElement } from '@/types';
import { InlineNameCell } from './InlineNameCell';
import { InlineDateCell } from './InlineDateCell';
import { CommentIcon } from './CommentIcon';
import { CreateGroupIcon, CreateSubgroupIcon, CreateMilestoneIcon, CreateTaskIcon } from './CreateActionIcons';
import { GanttTooltip } from './GanttTooltip';
import { QuickTaskInput } from './QuickTaskInput';
import { useTaskDragAndDrop } from '../hooks/useTaskDragAndDrop';
import { GroupContextMenu } from './GroupContextMenu';

interface IntegratedGanttTableProps {
  // Props de la lista
  items: { task: TaskElement; depth: number }[];
  onUpdate: (task: TaskElement, updates: Partial<TaskElement>) => void;
  createGroup: () => void;
  createSubgroup: (parentId: string) => void;
  createMilestone: (parentId: string) => void;
  createTask: (parentId: string) => void;
  createTaskQuick: (parentId: string, taskName: string) => Promise<void>;
  confirmTempGroup?: (tempId: string, groupName: string) => Promise<void>;
  confirmTempSubgroup?: (tempId: string, subgroupName: string) => Promise<void>;
  onOpenGroupSidebar?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onOpenTaskSidebar?: (task: TaskElement) => void;
  expandedGroups?: Set<string>;
  toggleGroupExpand?: (id: string) => void;
  showActionsRow?: boolean;
  openDependenciesModal?: (taskId: string, position?: { x: number; y: number }) => void;
  
  // Props del Gantt
  ganttTasks: any[];
  viewMode: ViewMode;
  ganttColumnWidth: number;
  onGanttDateChange: (task: any) => void;
  onGanttClick: (task: any) => void;
  onGanttDoubleClick: (task: any) => void;
  onProgressChange: (task: any) => void;
  rootsCount: number;
  // DnD reorder handler
  handleTaskReorder: (taskId: string, newParentId: string | undefined | null, newIndex: number, allTasks?: TaskElement[]) => Promise<void>;
}

export function IntegratedGanttTable({
  items,
  onUpdate,
  createGroup,
  createSubgroup,
  createMilestone,
  createTask,
  createTaskQuick,
  confirmTempGroup,
  confirmTempSubgroup,
  onOpenGroupSidebar,
  onDeleteGroup,
  onOpenTaskSidebar,
  expandedGroups,
  toggleGroupExpand,
  showActionsRow = true,
  openDependenciesModal,
  ganttTasks,
  viewMode,
  ganttColumnWidth,
  onGanttDateChange,
  onGanttClick,
  onGanttDoubleClick,
  onProgressChange,
  rootsCount,
  handleTaskReorder
}: IntegratedGanttTableProps) {
  const [contextMenu, setContextMenu] = React.useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    elementId: string;
    elementName: string;
    elementType: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    elementId: '',
    elementName: '',
    elementType: '',
  });

  const idToTask = React.useMemo(() => {
    const map = new Map<string, TaskElement>();
    items.forEach(({ task }) => map.set(task.id, task));
    return map;
  }, [items]);

  const getRootGroupId = (task: TaskElement): string => {
    let current: TaskElement | undefined = task;
    while (current && current.parentId) {
      const parent = idToTask.get(current.parentId);
      if (!parent) break;
      current = parent;
    }
    return current?.id || task.id;
  };

  // Función para obtener el contenedor correcto para nuevas tareas
  const getTaskContainerId = (task: TaskElement): string => {
    // Si la tarea es un grupo o subgrupo, usar su propio ID
    if (task.type === 'GROUP' || task.type === 'SUBGROUP') {
      return task.id;
    }
    
    // Si la tarea es una tarea simple o hito, encontrar su contenedor directo
    if (task.parentId) {
      const parent = idToTask.get(task.parentId);
      if (parent) {
        // Si el padre es un grupo o subgrupo, usar su ID
        if (parent.type === 'GROUP' || parent.type === 'SUBGROUP') {
          return parent.id;
        }
        // Si el padre es otra tarea, buscar el grupo/subgrupo contenedor
        return getRootGroupId(parent);
      }
    }
    
    // Fallback al grupo raíz
    return getRootGroupId(task);
  };

  // Función para obtener el grupo padre (solo grupos, no subgrupos)
  const getGroupParentId = (task: TaskElement): string => {
    // Si la tarea es un grupo, usar su propio ID
    if (task.type === 'GROUP') {
      return task.id;
    }
    
    // Si la tarea es un subgrupo, buscar su grupo padre
    if (task.type === 'SUBGROUP' && task.parentId) {
      const parent = idToTask.get(task.parentId);
      if (parent && parent.type === 'GROUP') {
        return parent.id;
      }
    }
    
    // Para tareas simples o hitos, encontrar el grupo contenedor
    let current: TaskElement | undefined = task;
    while (current && current.parentId) {
      const parent = idToTask.get(current.parentId);
      if (!parent) break;
      
      // Si encontramos un grupo, usarlo
      if (parent.type === 'GROUP') {
        return parent.id;
      }
      
      // Si encontramos un subgrupo, buscar su grupo padre
      if (parent.type === 'SUBGROUP' && parent.parentId) {
        const groupParent = idToTask.get(parent.parentId);
        if (groupParent && groupParent.type === 'GROUP') {
          return groupParent.id;
        }
      }
      
      current = parent;
    }
    
    // Fallback al grupo raíz
    return getRootGroupId(task);
  };

  // Función para obtener el contenedor correcto para tareas (grupo o subgrupo)
  const getTaskParentId = (task: TaskElement): string => {
    // Si la tarea es un grupo o subgrupo, usar su propio ID
    if (task.type === 'GROUP' || task.type === 'SUBGROUP') {
      return task.id;
    }
    
    // Si la tarea es una tarea simple o hito, encontrar su contenedor directo
    if (task.parentId) {
      const parent = idToTask.get(task.parentId);
      if (parent) {
        // Si el padre es un grupo o subgrupo, usar su ID
        if (parent.type === 'GROUP' || parent.type === 'SUBGROUP') {
          return parent.id;
        }
        // Si el padre es otra tarea, buscar el grupo/subgrupo contenedor
        return getRootGroupId(parent);
      }
    }
    
    // Fallback al grupo raíz
    return getRootGroupId(task);
  };

  const hasChildren = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach(({ task }) => { if (task.parentId) set.add(task.parentId); });
    return set;
  }, [items]);

  const isVisible = (task: TaskElement): boolean => {
    let current: TaskElement | undefined = task;
    while (current && current.parentId) {
      const parent = idToTask.get(current.parentId);
      if (!parent) break;
      // Solo verificar expansión si el padre es un grupo
      if (parent.type === 'GROUP' && expandedGroups && !expandedGroups.has(parent.id)) return false;
      current = parent;
    }
    return true;
  };

  const visibleItems = React.useMemo(() => {
    // Filtrar elementos visibles y eliminar duplicados por ID
    const filtered = items.filter(({ task }) => isVisible(task));
    const uniqueItems = filtered.reduce((acc, item) => {
      if (!acc.find(existing => existing.task.id === item.task.id)) {
        acc.push(item);
      }
      return acc;
    }, [] as typeof filtered);
    
    console.log(`VisibleItems: ${filtered.length} filtrados, ${uniqueItems.length} únicos`);
    return uniqueItems;
  }, [items, expandedGroups]);

  // Tareas planas visibles (para DnD)
  const allRenderedTasks = useMemo(() => visibleItems.map(({ task }) => task), [visibleItems]);

  // Sensores DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Hook DnD
  const { handleDragStart, handleDragOver, handleDragEnd } = useTaskDragAndDrop({
    tasks: allRenderedTasks,
    onReorder: handleTaskReorder,
  });

  const isEndOfGroup = (visibleIndex: number): boolean => {
    const current = visibleItems[visibleIndex];
    const next = visibleItems[visibleIndex + 1];
    return !next || next.depth === 0;
  };

  // Función para detectar el final de cualquier contenedor (grupo o subgrupo)
  const isEndOfContainer = (visibleIndex: number): boolean => {
    const current = visibleItems[visibleIndex];
    const next = visibleItems[visibleIndex + 1];
    
    // Si no hay siguiente elemento, es el final
    if (!next) return true;
    
    // Si el siguiente elemento tiene depth menor, es el final del contenedor actual
    if (next.depth < current.depth) return true;
    
    // Si el siguiente elemento tiene depth igual pero es un contenedor diferente, es el final
    if (next.depth === current.depth) {
      const currentIsContainer = current.task.type === 'GROUP' || current.task.type === 'SUBGROUP';
      const nextIsContainer = next.task.type === 'GROUP' || next.task.type === 'SUBGROUP';
      
      if (currentIsContainer && nextIsContainer) return true;
    }
    
    return false;
  };

  // Función para detectar si estamos al final de un grupo específicamente
  const isEndOfGroupContainer = (visibleIndex: number): boolean => {
    const current = visibleItems[visibleIndex];
    const next = visibleItems[visibleIndex + 1];
    
    // Si no hay siguiente elemento, es el final
    if (!next) return true;
    
    // Si el siguiente elemento tiene depth 0 (es un grupo), es el final del grupo actual
    if (next.depth === 0) return true;
    
    return false;
  };

  const handleGroupMenuClick = (event: React.MouseEvent, elementId: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const element = idToTask.get(elementId);
    if (!element) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenu({
      isOpen: true,
      position: {
        x: rect.left,
        y: rect.bottom + 4,
      },
      elementId,
      elementName: element.name || 'Elemento',
      elementType: element.type,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      isOpen: false,
      position: { x: 0, y: 0 },
      elementId: '',
      elementName: '',
      elementType: '',
    });
  };

  const handleDeleteElement = () => {
    if (onDeleteGroup && contextMenu.elementId) {
      onDeleteGroup(contextMenu.elementId);
    }
  };

  const handleUpdate = (task: TaskElement, updates: Partial<TaskElement>) => {
    // Si es un grupo temporal y se está actualizando el nombre, usar confirmTempGroup
    if ((task as any).isTemp && updates.name && task.type === 'GROUP' && confirmTempGroup) {
      confirmTempGroup(task.id, updates.name);
    }
    // Si es un subgrupo temporal y se está actualizando el nombre, usar confirmTempSubgroup
    else if ((task as any).isTemp && updates.name && task.type === 'SUBGROUP' && confirmTempSubgroup) {
      confirmTempSubgroup(task.id, updates.name);
    } else {
      onUpdate(task, updates);
    }
  };

  // Crear tareas del Gantt que coincidan exactamente con las filas de la lista
  const ganttTasksWithSpacers = React.useMemo(() => {
    const result: any[] = [];
    const taskMap = new Map(ganttTasks.map(task => [task.id, task]));
    let spacerCounter = 0; // Contador para IDs únicos
    
    visibleItems.forEach(({ task }, idx) => {
      // Agregar la tarea normal
      const ganttTask = taskMap.get(task.id);
      if (ganttTask) {
        result.push(ganttTask);
      } else {
        // Si no hay tarea del Gantt para este elemento, crear una fila vacía
        const emptyTask = {
          id: `empty-${task.id}-${++spacerCounter}`,
          name: '',
          start: new Date(),
          end: new Date(),
          type: 'project' as const,
          progress: 0,
          styles: {
            backgroundColor: 'white',
            backgroundSelectedColor: 'white',
            progressColor: 'transparent',
            progressSelectedColor: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            backgroundTextColor: 'transparent',
            strokeSelectedColor: 'transparent'
          },
          isDisabled: true,
          hideChildren: true
        };
        result.push(emptyTask);
      }
      
      // Si es el final de un contenedor y showActionsRow está activado, agregar filas vacías
      if (showActionsRow && isEndOfContainer(idx)) {
        // Fila vacía para input (siempre se muestra al final de contenedores)
        const emptyInputTask = {
          id: `empty-input-${task.id}-${idx}-${++spacerCounter}`,
          name: '',
          start: new Date(),
          end: new Date(),
          type: 'project' as const,
          progress: 0,
          styles: {
            backgroundColor: 'white',
            backgroundSelectedColor: 'white',
            progressColor: 'transparent',
            progressSelectedColor: 'transparent',
            stroke: 'transparent',
            strokeWidth: 0,
            backgroundTextColor: 'transparent',
            strokeSelectedColor: 'transparent'
          },
          isDisabled: true,
          hideChildren: true
        };
        
        result.push(emptyInputTask);
        
        // Fila vacía para botones (solo al final de grupos)
        if (isEndOfGroupContainer(idx)) {
          const emptyButtonsTask = {
            id: `empty-buttons-${task.id}-${idx}-${++spacerCounter}`,
            name: '',
            start: new Date(),
            end: new Date(),
            type: 'project' as const,
            progress: 0,
            styles: {
              backgroundColor: 'white',
              backgroundSelectedColor: 'white',
              progressColor: 'transparent',
              progressSelectedColor: 'transparent',
              stroke: 'transparent',
              strokeWidth: 0,
              backgroundTextColor: 'transparent',
              strokeSelectedColor: 'transparent'
            },
            isDisabled: true,
            hideChildren: true
          };
          
          result.push(emptyButtonsTask);
        }
      }
    });
    
    return result;
  }, [ganttTasks, visibleItems, showActionsRow]);

  // Determinar si hay tareas reales (no solo elementos vacíos)
  const hasRealTasks = React.useMemo(() => {
    return ganttTasks.some(task => 
      task.id && 
      !task.id.startsWith('empty-') && 
      task.name && 
      task.name.trim() !== ''
    );
  }, [ganttTasks]);

  // Fila sortable (lista izquierda)
  const SortableRow: React.FC<{ task: TaskElement; depth: number }> = ({ task, depth }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };
    const deps: any[] = Array.isArray((task as any).dependencies) ? (task as any).dependencies : [];
    const predecessorsCount = Array.isArray((task as any).predecessorDependencies)
      ? (task as any).predecessorDependencies.length
      : deps.filter((d: any) => d && d.successorId === task.id).length;
    const successorsCount = Array.isArray((task as any).successorDependencies)
      ? (task as any).successorDependencies.length
      : deps.filter((d: any) => d && d.predecessorId === task.id).length;
    return (
      <tr ref={setNodeRef} {...attributes} className="border-b last:border-b-0" style={{ height: '40px', ...style }}>
        <td className="py-1 px-2 border-l border-r border-gray-200">
          <div className="flex items-center justify-between" style={{ paddingLeft: depth * 32 }}>
            <div className="flex items-center gap-2 min-w-0">
              {(hasChildren.has(task.id) && task.type === 'GROUP') && (
                <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-100" onClick={() => toggleGroupExpand && toggleGroupExpand(task.id)} title={(expandedGroups && expandedGroups.has(task.id)) ? 'Colapsar' : 'Expandir'}>
                  {expandedGroups && expandedGroups.has(task.id) ? (
                    <svg className="w-2 h-2 text-gray-600" width="2" height="1" viewBox="0 0 6 3" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.3 2.775C3.12222 2.90833 2.87778 2.90833 2.7 2.775L0.2 0.9C-0.184405 0.611696 0.0194939 0 0.5 0H5.5C5.98051 0 6.1844 0.611696 5.8 0.9L3.3 2.775Z" fill="#1D1B20"/></svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18l6-6-6-6" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              )}
              <div className="w-4 h-4 flex items-center justify-center cursor-grab active:cursor-grabbing" {...listeners}>
                <GripVertical className="w-3 h-3 text-gray-400" />
              </div>
              <InlineNameCell value={task.name || ''} onCommit={(newVal) => handleUpdate(task, { name: newVal })} placeholder={task.type === 'GROUP' ? "Nombre de grupo" : task.type === 'SUBGROUP' ? "Nombre de subgrupo" : ""} autoFocus={!task.name && (task.type === 'GROUP' || task.type === 'SUBGROUP')} task={task} />
              <CommentIcon commentCount={task.commentsCount || 0} />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {depth > 0 && (
                <button type="button" className="w-4 h-4 flex items-center justify-center ml-2" onClick={() => onOpenTaskSidebar && onOpenTaskSidebar(task)} title="Ver detalles">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4.33333V6.33333C7 6.51014 6.92976 6.67971 6.80474 6.80474C6.67971 6.92976 6.51014 7 6.33333 7H1.66667C1.48986 7 1.32029 6.92976 1.19526 6.80474C1.07024 6.67971 1 6.51014 1 6.33333V1.66667C1 1.48986 1.07024 1.32029 1.19526 1.19526C1.32029 1.07024 1.48986 1 1.66667 1H3.66667M7 1L4 4M7 1H5M7 1V3" stroke="black" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              {task.type === 'GROUP' && (
                <button type="button" className="w-4 h-4 flex items-center justify-center ml-2" onClick={() => onOpenTaskSidebar && onOpenTaskSidebar(task)} title="Ver detalles">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 4.33333V6.33333C7 6.51014 6.92976 6.67971 6.80474 6.80474C6.67971 6.92976 6.51014 7 6.33333 7H1.66667C1.48986 7 1.32029 6.92976 1.19526 6.80474C1.07024 6.67971 1 6.51014 1 6.33333V1.66667C1 1.48986 1.07024 1.32029 1.19526 1.19526C1.32029 1.07024 1.48986 1 1.66667 1H3.66667M7 1L4 4M7 1H5M7 1V3" stroke="black" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              {depth === 0 && (
                <button className="text-gray-700 hover:text-gray-900 text-lg px-1" title="Crear grupo" onClick={createGroup}>+</button>
              )}
            </div>
          </div>
        </td>
        <td className="py-1 px-2 whitespace-nowrap text-gray-700 border-r border-gray-200 text-center">
          <InlineDateCell valueISO={task.plannedStartDate} onCommit={(iso: string) => handleUpdate(task, { plannedStartDate: iso } as any)} />
        </td>
        <td className="py-1 px-2 whitespace-nowrap text-gray-700 border-r border-gray-200 text-center">
          <InlineDateCell valueISO={task.plannedEndDate} onCommit={(iso: string) => handleUpdate(task, { plannedEndDate: iso } as any)} />
        </td>
        <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 text-center">
          {(task.type === 'GROUP' || task.type === 'SUBGROUP') ? (
            <div></div>
          ) : (
            <div className="inline-flex items-center gap-1 justify-center cursor-pointer" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); openDependenciesModal && openDependenciesModal(task.id, { x: rect.right, y: rect.top }); }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.25 4.125L4.125 1M4.125 1L1 4.125M4.125 1V8.5C4.125 9.16304 4.38839 9.79893 4.85723 10.2678C5.32607 10.7366 5.96196 11 6.625 11H11" stroke="black" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {predecessorsCount > 0 && (<span>{predecessorsCount}</span>)}
            </div>
          )}
        </td>
        <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 text-center">
          {(task.type === 'GROUP' || task.type === 'SUBGROUP') ? (
            <div></div>
          ) : (
            <div className="inline-flex items-center gap-1 justify-center cursor-pointer" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); openDependenciesModal && openDependenciesModal(task.id, { x: rect.right, y: rect.top }); }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.75 7.875L7.875 11M7.875 11L11 7.875M7.875 11V3.5C7.875 2.83696 7.61161 2.20107 7.14277 1.73223C6.67393 1.26339 6.03804 1 5.375 1H1" stroke="black" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {successorsCount > 0 && (<span>{successorsCount}</span>)}
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="flex h-full w-full min-w-0">
      {/* Lista izquierda fija */}
      <div className={`${hasRealTasks ? 'w-[640px] min-w-[560px] max-w-[720px]' : 'w-full'} flex-shrink-0 ${hasRealTasks ? 'border-r' : ''} bg-white sticky left-0 z-10 -mt-4`}>
        {visibleItems.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
          <SortableContext items={allRenderedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr className="text-[11px] uppercase text-black border-b">
                <th className="py-1 px-2">Name</th>
                <th className="py-1 px-2">Start Date</th>
                <th className="py-1 px-2">End Date</th>
                <th className="py-1 px-2">Prede.</th>
                <th className="py-1 px-2">Succe.</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {visibleItems.map(({ task, depth }, idx) => (
              <React.Fragment key={task.id}>
                {(() => {
                  const deps: any[] = Array.isArray((task as any).dependencies) ? (task as any).dependencies : [];
                  const predecessorsCount = Array.isArray((task as any).predecessorDependencies)
                    ? (task as any).predecessorDependencies.length
                    : deps.filter((d: any) => d && d.successorId === task.id).length;
                  const successorsCount = Array.isArray((task as any).successorDependencies)
                    ? (task as any).successorDependencies.length
                    : deps.filter((d: any) => d && d.predecessorId === task.id).length;
                  return (<SortableRow task={task} depth={depth} />);
                })()}
                {showActionsRow && isEndOfContainer(idx) && (
                  <>
                    {/* Input de creación rápida de tareas - PRIMERO */}
                    <QuickTaskInput
                      parentId={getTaskParentId(task)}
                      onCreateTask={createTaskQuick}
                      placeholder="Crear nueva tarea"
                      depth={depth}
                      variant="gantt"
                    />
                    {/* Fila de botones - SEGUNDO - Solo mostrar si hay botones */}
                    {isEndOfGroupContainer(idx) && (
                      <tr className="border-b last:border-b-0" style={{ height: '40px' }}>
                        <td className="py-1 px-2 border-l border-gray-200">
                          <div className="flex items-center gap-2" style={{ paddingLeft: 64 }}>
                            <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createGroup()} title="Crear grupo">
                              <span className="text-sm leading-none">+</span>
                              <CreateGroupIcon className="w-[19px] h-[8px]" />
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createSubgroup(getGroupParentId(task))} title="Crear subgrupo dentro">
                              <span className="text-sm leading-none">+</span>
                              <CreateSubgroupIcon className="w-[14px] h-[10px]" />
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6]" onClick={() => createMilestone(getGroupParentId(task))} title="Crear hito">
                              <span className="text-sm leading-none">+</span>
                              <CreateMilestoneIcon className="w-[11px] h-[11px]" />
                            </button>
                          </div>
                        </td>
                        <td className="py-1 px-2 text-center" />
                        <td className="py-1 px-2 text-center" />
                        <td className="py-1 px-2 text-center" />
                        <td className="py-1 px-2 text-center" />
                      </tr>
                    )}
                  </>
                )}
              </React.Fragment>
              ))}
            </tbody>
          </table>
          </SortableContext>
          </DndContext>
        ) : (
          /* Cuando no hay elementos, mostrar solo un botón de crear grupo centrado */
          <div className="w-full h-full flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600 mb-4">
              No tienes ninguna tarea creada, empezar:
            </p>
            <button 
              className="flex items-center gap-2 px-4 py-2 border rounded-full bg-[#EFEFEF] hover:bg-[#E6E6E6] transition-colors" 
              onClick={() => createGroup()} 
              title="Crear grupo"
            >
              <span className="text-lg leading-none">+</span>
              <CreateGroupIcon className="w-[19px] h-[8px]" />
              <span className="text-sm font-medium">Crear grupo</span>
            </button>
          </div>
        )}
      </div>

      {/* Contenedor del Gantt que usa todo el ancho restante - solo se muestra si hay tareas reales */}
      {hasRealTasks && (
        <div className="flex-1 min-w-0 bg-white relative">
          <div className="w-full h-full" style={{ minWidth: '2000px' }}>
            {ganttTasksWithSpacers.length > 0 ? (
              <div className="gantt-container w-full" style={{ marginTop: '-41px', width: '100%' }}>
                  <Gantt
                    tasks={ganttTasksWithSpacers}
                    viewMode={viewMode}
                    listCellWidth=""
                    columnWidth={ganttColumnWidth}
                    rowHeight={40}
                    barCornerRadius={5}
                    barFill={70}
                    fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                    fontSize="11px"
                    todayColor="#f9fafb"
                    onSelect={() => { /* no-op */ }}
                    onDateChange={onGanttDateChange}
                    onClick={onGanttClick}
                    onDoubleClick={onGanttDoubleClick}
                    onProgressChange={onProgressChange}
                    TooltipContent={GanttTooltip as any}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-gray-500 w-full">
                  No hay tareas en este paquete todavía
                </div>
              )}
          </div>
        </div>
      )}

      {/* Menú contextual para elementos */}
      <GroupContextMenu
        isOpen={contextMenu.isOpen}
        onClose={handleCloseContextMenu}
        position={contextMenu.position}
        onDeleteGroup={handleDeleteElement}
        elementName={contextMenu.elementName}
        elementType={contextMenu.elementType}
      />
    </div>
  );
}
