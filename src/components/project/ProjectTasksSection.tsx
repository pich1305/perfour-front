// src/components/project/ProjectTasksSection.tsx

'use client';

import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import { TaskElement, TaskPackage, TaskElementType, TaskPriority, VettelTaskStatus } from '@/types';
import { useProjectTasks } from '@/features/tasks/hooks/useProjectTasks';
import { VettelApiClient } from '@/lib/api/VettelApiClient';
import type { TaskAssignee } from '@/lib/api/VettelApiClient';
import { TaskFormModal } from '@/features/tasks/modals/TaskFormModal';
import { DeleteTaskModal } from '@/features/tasks/modals/DeleteTaskModal';
import { TaskPackageFormModal } from '@/features/tasks/modals/TaskPackageFormModal';
import { DeletePackageModal } from '@/features/tasks/modals/DeletePackageModal';
import { Edit, Trash2, Eye, ChevronRight } from 'lucide-react';
import { ItemSidebar } from './parts/ItemSidebar';
import { useProjectTasksSection } from '@/features/tasks/hooks/useProjectTasksSection';
import { useGroupSidebar } from '@/features/tasks/hooks/useGroupSidebar';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { GanttTabIcon, ListTabIcon, BoardTabIcon } from './parts/TabsIcons';
import { CreateGroupIcon, CreateSubgroupIcon, CreateMilestoneIcon } from './parts/CreateActionIcons';
import { CommentIcon } from './parts/CommentIcon';
import { AssigneesModal } from './parts/AssigneesModal';
import { StatusDropdown } from './parts/StatusDropdown';
import { PriorityDropdown } from './parts/PriorityDropdown';
import { InlineNameCell } from './parts/InlineNameCell';
import { InlineDateCell } from './parts/InlineDateCell';
import { AssigneesCell } from './parts/AssigneesCell';
import { ProjectTasksHeader } from './parts/ProjectTasksHeader';
import { GanttLeftList } from './parts/GanttLeftList';
import { PaginationFooter } from '@/features/tasks/components/PaginationFooter';
import { TasksListTable } from './parts/TasksListTable';
import { PackagesList } from './parts/PackagesList';
import { useAssigneesState } from '@/features/tasks/hooks/useAssigneesState';
import PaginationControls from './parts/PaginationFooter';

// icons y helpers extraídos a ./parts

interface ProjectTasksSectionProps {
  projectId: string;
}

export function ProjectTasksSection({ projectId }: ProjectTasksSectionProps) {
  const state = useProjectTasksSection(projectId);
  const { user } = state;
  const { taskPackages, taskElements, loading, error } = state;
  const { isRefetching, silentRefetch, viewMode, setViewMode, tasksTab, setTasksTab } = state as any;
  
  // --- VISTA PRINCIPAL: 'packages' o 'tasks' ---
  const { currentView, setCurrentView, selectedPackage } = state as any;

  // --- ESTADOS PARA MODALES DE PAQUETES ---
  const { isPackageModalOpen, setIsPackageModalOpen, packageModalMode, setPackageModalMode, selectedPackageForEdit } = state as any;

  // --- ESTADOS PARA MODALES DE TAREAS (reutilizados) ---
  const { isTaskModalOpen, setIsTaskModalOpen, taskModalMode, setTaskModalMode, selectedTask, isDeleteModalOpen, setIsDeleteModalOpen } = state as any;
  const [isDeletePackageModalOpen, setIsDeletePackageModalOpen] = useState(false);
  const [selectedPackageForDelete, setSelectedPackageForDelete] = useState<TaskPackage | null>(null);
  const { isGroupSidebarOpen, groupSidebarData, openGroupSidebar, closeGroupSidebar } = useGroupSidebar();

  // (commentsCount viene desde la API por cada TaskElement)

  // --- UI: estado optimista para evitar parpadeo en actualizaciones inline ---
  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Partial<TaskElement>>>({});
  const getEffectiveTask = (t: TaskElement): TaskElement => ({ ...(t as any), ...(optimisticTasks[t.id] as any || {}) });

  // --- ASSIGNEES (solo del usuario actual para esta vista) ---
  const { myAssigneesByTaskId, assigneesCountByTaskId, handleAssignMe, handleUnassignMe } = state as any;
  const { isAssigneesModalOpen, setIsAssigneesModalOpen, assigneesModalTaskId, assigneesModalLoading, assigneesModalList } = state as any;

  // --- MANEJO DE VISTAS ---
  const { showTasksForPackage, showPackages } = state as any;

  // --- MANEJO DE PAQUETES ---
  const { openCreatePackageModal, openEditPackageModal } = state as any;

  

  const { openDeletePackageModal } = state as any;

  const { handlePackageFormSubmit } = state as any;

  const { handlePackageDeleteConfirm } = state as any;

  // (sincronización de commentsCount ya viene en taskElements)
  
  // --- MANEJO DE TAREAS (adaptado) ---
  const { openCreateTaskModal, openEditTaskModal, openDeleteTaskModal } = state as any;

  const { handleTaskFormSubmit } = state as any;

  // --- LIST VIEW: creación rápida cuando no hay tareas ---
  const [quickName, setQuickName] = useState('');
  const [isCreatingQuick, setIsCreatingQuick] = useState(false);

  const handleQuickCreate = async () => {
    if (!selectedPackage || !user) return;
    const name = quickName.trim();
    if (!name) return;
    try {
      setIsCreatingQuick(true);
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      await VettelApiClient.createTaskElement({
        tasksPackageId: selectedPackage.id,
        name,
        type: TaskElementType.SIMPLE_TASK,
        plannedStartDate: start.toISOString(),
        plannedEndDate: end.toISOString(),
        priority: TaskPriority.MEDIUM,
        //status: VettelTaskStatus.NOT_STARTED,
        createdBy: user.id,
      } as any);
      setQuickName('');
      await silentRefetch();
      // Una vez creada la primera tarea, mantenemos el tab de lista
    } catch (e: any) {
      console.error('Error al crear tarea rápida:', e);
      alert(e?.response?.data?.message || e.message || 'No se pudo crear la tarea');
    } finally {
      setIsCreatingQuick(false);
    }
  };

  // --- LIST VIEW: edición en línea (migrada a componentes atomizados) ---

  // --- LIST VIEW: paginación ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  // Menús de estado y prioridad fueron atomizados en componentes

  // Helpers de fecha movidos a InlineDateCell

  //

  //

  // inline date editor movido a InlineDateCell

  const handleInlineUpdate = async (task: TaskElement, updates: Partial<TaskElement>) => {
    if (!user) {
      alert('Debes iniciar sesión para editar.');
      return;
    }
    try {
      // Optimista: aplicar cambios en memoria sin refetch inmediato
      setOptimisticTasks((prev) => ({ ...prev, [task.id]: { ...(prev[task.id] || {}), ...updates } }));
      await VettelApiClient.updateTaskElement(task.id, { ...updates, updatedBy: user.id } as any);
      // Refetch diferido y silencioso para sincronizar, sin borrar optimistas
      void silentRefetch();
    } catch (e: any) {
      console.error('Error al actualizar la tarea:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      alert(apiMessage || e.message || 'No se pudo actualizar la tarea');
      // Revertir optimista en caso de error
      setOptimisticTasks((prev) => {
        const copy = { ...prev };
        delete copy[task.id];
        return copy;
      });
    }
  };

  // ASSIGNEE handlers migrados a useAssigneesState

  const { openAssigneesModal, closeAssigneesModal } = state as any;

  // --- LIST VIEW: crear grupo/subgrupo/hito ---
  const createGroup = async () => {
    if (!selectedPackage || !user) return;
    try {
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      await VettelApiClient.createTaskElement({
        tasksPackageId: selectedPackage.id,
        name: 'Nuevo grupo',
        type: TaskElementType.SIMPLE_TASK,
        plannedStartDate: start.toISOString(),
        plannedEndDate: end.toISOString(),
        priority: TaskPriority.MEDIUM,
        createdBy: user.id,
      } as any);
      await silentRefetch();
    } catch (e: any) {
      console.error('Error al crear grupo:', e);
      alert(e?.response?.data?.message || e.message || 'No se pudo crear el grupo');
    }
  };

  const createSubgroup = async (parentId: string) => {
    if (!selectedPackage || !user) return;
    try {
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      await VettelApiClient.createTaskElement({
        tasksPackageId: selectedPackage.id,
        parentId,
        name: 'Nuevo subgrupo',
        type: TaskElementType.SIMPLE_TASK,
        plannedStartDate: start.toISOString(),
        plannedEndDate: end.toISOString(),
        priority: TaskPriority.MEDIUM,
        createdBy: user.id,
      } as any);
      (state as any).toggleGroupExpand(parentId);
      await silentRefetch();
    } catch (e: any) {
      console.error('Error al crear subgrupo:', e);
      alert(e?.response?.data?.message || e.message || 'No se pudo crear el subgrupo');
    }
  };

  const createMilestone = async (parentId: string) => {
    if (!selectedPackage || !user) return;
    try {
      const when = new Date();
      await VettelApiClient.createTaskElement({
        tasksPackageId: selectedPackage.id,
        parentId,
        name: 'Nuevo hito',
        type: TaskElementType.MILESTONE,
        plannedStartDate: when.toISOString(),
        plannedEndDate: when.toISOString(),
        priority: TaskPriority.MEDIUM,
        createdBy: user.id,
      } as any);
      await silentRefetch();
    } catch (e: any) {
      console.error('Error al crear hito:', e);
      alert(e?.response?.data?.message || e.message || 'No se pudo crear el hito');
    }
  };

  // --- LIST VIEW: árbol de grupos/subgrupos (1 nivel) ---
  const groupTree = useMemo(() => {
    if (!selectedPackage) return [] as { group: TaskElement; children: TaskElement[] }[];

    const hasTasksPackageId = taskElements.some((t: any) => t && 'tasksPackageId' in t && t.tasksPackageId);
    const baseList = hasTasksPackageId
      ? (taskElements as any[]).filter((t: any) => t.tasksPackageId === selectedPackage.id)
      : (taskElements as any[]);
    // Si vienen anidados, usamos ese orden; si no, construimos con parentId
    if (baseList.some((t: any) => Array.isArray(t?.children))) {
      const roots = (baseList as TaskElement[]).filter((t) => !t.parentId);
      return roots.map((r) => ({ group: r, children: ((r as any).children as TaskElement[]) || [] }));
    }

    const inPackage = baseList as TaskElement[];
    const childrenMap = new Map<string, TaskElement[]>();
    inPackage.forEach((t) => {
      if (t.parentId) {
        const arr = childrenMap.get(t.parentId) ?? [];
        arr.push(t);
        childrenMap.set(t.parentId, arr);
      }
    });
    const roots = inPackage.filter((t) => !t.parentId);
    return roots.map((r) => ({ group: r, children: childrenMap.get(r.id) ?? [] }));
  }, [selectedPackage, taskElements]);

  // Estado de expansión de grupos
  const { expandedGroups, toggleGroupExpand } = state as any;
  useEffect(() => { setCurrentPage(1); }, [selectedPackage]);

  // Renderer reutilizable para filas de tarea (grupo o subgrupo)
  const renderTaskRow = (rawTask: TaskElement, depth: number) => {
    const task = getEffectiveTask(rawTask);
    return (
    <tr key={task.id} className="border-b last:border-b-0 hover:bg-gray-50">
             <td className="py-1 px-2 border-r border-gray-200 last:border-r-0">
         <div className="flex items-center">
           <div style={{ width: depth * 16 }} />
           {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 mr-1" />}
           {/* Icono de drag handle para sort order */}
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
               <InlineNameCell
                 value={task.name || ''}
                 onCommit={(newVal) => { void handleInlineUpdate(task, { name: newVal }); }}
               />
               <CommentIcon commentCount={task.commentsCount || 0} />
             </div>
             {/* Icono de editar para subgrupos (solo visual) */}
             <div
               className="w-4 h-4 flex items-center justify-center ml-8"
               title="Editar nombre"
             >
               <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                 <path d="M7 4.33333V6.33333C7 6.51014 6.92976 6.67971 6.80474 6.80474C6.67971 6.92976 6.51014 7 6.33333 7H1.66667C1.48986 7 1.32029 6.92976 1.19526 6.80474C1.07024 6.67971 1 6.51014 1 6.33333V1.66667C1 1.48986 1.07024 1.32029 1.19526 1.19526C1.32029 1.07024 1.48986 1 1.66667 1H3.66667M7 1L4 4M7 1H5M7 1V3" stroke="black" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
             </div>
           </div>
        </div>
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <StatusDropdown
          value={task.status}
          onChange={(s) => { void handleInlineUpdate(task, { status: s }); }}
          className="w-[80%] mx-[10%] justify-center"
        />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <InlineDateCell
          valueISO={task.plannedStartDate}
          onCommit={(iso) => { void handleInlineUpdate(task, { plannedStartDate: iso } as any); }}
        />
      </td>
      <td className="py-1 px-2 text-gray-700 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <InlineDateCell
          valueISO={task.plannedEndDate}
          onCommit={(iso) => { void handleInlineUpdate(task, { plannedEndDate: iso } as any); }}
        />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <AssigneesCell
          count={assigneesCountByTaskId[task.id] ?? 0}
          isAssignedToMe={!!myAssigneesByTaskId[task.id]}
          onAssignMe={() => { void handleAssignMe(task.id); }}
          onUnassignMe={() => { void handleUnassignMe(task.id); }}
          onOpenList={() => { void openAssigneesModal(task.id); }}
        />
      </td>
      <td className="py-1 px-2 whitespace-nowrap border-r border-gray-200 last:border-r-0">
        <PriorityDropdown
          value={task.priority}
          onChange={(p) => { void handleInlineUpdate(task, { priority: p }); }}
        />
      </td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap border-r border-gray-200 last:border-r-0">—</td>
      <td className="py-1 px-2 text-gray-500 whitespace-nowrap">—</td>
    </tr>
  ); };

  // --- MAPEO PARA GANTT ---
  // Lista jerárquica ordenada para alinear lista izquierda y Gantt
  const orderedHierarchical = (state as any).orderedHierarchical as { task: TaskElement; depth: number }[];

  const ganttTasks = (state as any).ganttTasks as GanttTask[];

  const parentCandidates = useMemo(() => {
    if (!selectedPackage) return [] as { id: string; name: string }[];
    return taskElements
      .filter(
        (t) =>
          t.tasksPackageId === selectedPackage.id &&
          (t.type === TaskElementType.GROUP || t.type === TaskElementType.SUBGROUP)
      )
      .map((t) => ({ id: t.id, name: t.name }));
  }, [selectedPackage, taskElements]); 
  
  const { handleDeleteConfirm } = state as any;


  // --- RENDERIZADO ---
  if (loading && !isRefetching) return <div className="p-6">Cargando datos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm">
        {currentView === 'packages' ? (
          <PackagesList
            items={taskPackages}
            onCreate={openCreatePackageModal}
            onShowTasks={showTasksForPackage}
            onEdit={openEditPackageModal}
            onDelete={openDeletePackageModal}
          />
        ) : (
          // --- VISTA DE TAREAS (con tabs) ---
          <div className="h-[70vh] flex flex-col">
            <ProjectTasksHeader
              packageName={selectedPackage?.name}
              tasksTab={tasksTab}
              setTasksTab={setTasksTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onBack={showPackages}
              onNewTask={openCreateTaskModal}
            />

            {/* Contenido por tab */}
            {tasksTab === 'gantt' && (
              <div className="flex flex-1 overflow-hidden">
                <GanttLeftList
                  items={orderedHierarchical}
                  onEdit={openEditTaskModal}
                  onDelete={openDeleteTaskModal}
                />

                {/* Gantt derecha */}
                <div className="flex-1 overflow-auto p-2">
                  {ganttTasks.length > 0 ? (
                    <Gantt
                      tasks={ganttTasks}
                      viewMode={viewMode}
                      listCellWidth="" // Oculta la lista integrada del lib; usamos la nuestra a la izquierda
                      columnWidth={56}
                      rowHeight={36}
                      barCornerRadius={6}
                      barFill={55}
                      fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                      fontSize="12px"
                      todayColor="#f3f4f6"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm text-gray-500">
                      No hay tareas en este paquete todavía
                    </div>
                  )}
                </div>
              </div>
            )}

            {tasksTab === 'list' && (
              <div className="flex-1 overflow-auto p-6">
                <TasksListTable
                  groupTree={groupTree}
                  expandedGroups={expandedGroups}
                  toggleGroupExpand={toggleGroupExpand}
                  handleInlineUpdate={(t, u) => { void handleInlineUpdate(t, u); }}
                  assigneesCountByTaskId={assigneesCountByTaskId}
                  myAssigneesByTaskId={myAssigneesByTaskId}
                  handleAssignMe={(id) => { void handleAssignMe(id); }}
                  handleUnassignMe={(id) => { void handleUnassignMe(id); }}
                  openAssigneesModal={(id) => { void openAssigneesModal(id); }}
                  onOpenGroupSidebar={(id) => { void openGroupSidebar(id); }}
                  createGroup={() => { void createGroup(); }}
                  createSubgroup={(id) => { void createSubgroup(id); }}
                  createMilestone={(id) => { void createMilestone(id); }}
                  quickName={quickName}
                  setQuickName={(v) => setQuickName(v)}
                  onQuickCreate={() => { void handleQuickCreate(); }}
                />
                <PaginationControls
                  totalPages={Math.ceil(groupTree.reduce((total, { group, children }) => total + 1 + children.length, 0) / rowsPerPage)}
                  totalItems={groupTree.reduce((total, { group, children }) => total + 1 + children.length, 0)}
                  itemsPerPage={rowsPerPage}
                  onItemsPerPageChange={(n: number) => setRowsPerPage(n)}
                  currentPage={currentPage as number}
                  onPageChange={(n: number) => setCurrentPage(n)}
                />
              </div>
            )}

            {tasksTab === 'board' && (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Board próximamente
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODALES --- */}
      <AssigneesModal
        isOpen={isAssigneesModalOpen}
        loading={assigneesModalLoading}
        items={assigneesModalList}
        onClose={closeAssigneesModal}
      />
      <TaskPackageFormModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onSubmit={handlePackageFormSubmit}
        initialData={selectedPackageForEdit}
        mode={packageModalMode}
      />
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskFormSubmit}
        initialData={selectedTask}
        mode={taskModalMode}
        parentCandidates={parentCandidates}
      />
      <DeleteTaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        taskName={selectedTask?.name}
      />
      <DeletePackageModal
        isOpen={isDeletePackageModalOpen}
        onClose={() => setIsDeletePackageModalOpen(false)}
        onConfirm={handlePackageDeleteConfirm}
        packageName={selectedPackageForDelete?.name}
      />

      {/* Sidebar de detalles del grupo (Framer Motion) */}
      <ItemSidebar
        task={groupSidebarData}
        isOpen={isGroupSidebarOpen}
        onClose={closeGroupSidebar}
        onSave={() => { /* Por ahora, solo cierre sin guardar cambios */ }}
      />
    </>
  );
}

// Badges migradas a parts/Badges si se necesitan importar
