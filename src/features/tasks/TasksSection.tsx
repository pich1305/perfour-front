"use client";

import React from 'react';
import { ViewMode } from 'gantt-task-react';
import { ProjectTasksHeader } from '@/features/tasks/components/ProjectTasksHeader';
import { IntegratedGanttTable } from '@/features/tasks/components/IntegratedGanttTable';
import { TasksListTable } from '@/features/tasks/components/TasksListTable';
import { PaginationFooter } from '@/features/tasks/components/PaginationFooter';
import { AssigneesModal } from '@/features/tasks/components/AssigneesModal';
import { DependenciesPopup } from '@/features/tasks/components/DependenciesPopup';
import { AddDependencyPopup } from '@/features/tasks/components/AddDependencyPopup';
import ItemSidebar from '@/features/tasks/components/ItemSidebar';
import { TaskPackageFormModal } from '@/features/tasks/modals/TaskPackageFormModal';
import { TaskFormModal } from '@/features/tasks/modals/TaskFormModal';
import { DeleteTaskModal } from '@/features/tasks/modals/DeleteTaskModal';
import { DeletePackageModal } from '@/features/tasks/modals/DeletePackageModal';
import { useProjectTasksSection } from './hooks/useProjectTasksSection';

interface TasksSectionProps {
  projectId: string;
}

export default function TasksSection({ projectId }: TasksSectionProps) {
  // Usar el mismo projectId temporal que BudgetListView hasta integrar UUID real desde params
  const fixedProjectId = "550e8400-e29b-41d4-a716-446655440000";
  const state = useProjectTasksSection(fixedProjectId);
  const singleClickTimerRef = React.useRef<any>(null);
  const { user } = state;
  const { taskPackages, taskElements, loading, error } = state;
  const { isRefetching, viewMode, setViewMode, tasksTab, setTasksTab } = state as any;
  const { ganttColumnWidth } = state as any;
  const { toggleShowDependencies, toggleLinkMode } = state as any;
  const { linkMode, showDependencies } = state as any;
  const { handleLinkOnSelect, handleGanttDateChange, handleGanttBarClick, isLinking } = state as any;

  const { currentView, selectedPackage } = state as any;
  const { openCreatePackageModal, openEditPackageModal, openDeletePackageModal } = state as any;
  const { showTasksForPackage, showPackages } = state as any;

  const { openCreateTaskModal, openEditTaskModal, openDeleteTaskModal } = state as any;
  const { handleInlineUpdate } = state as any;
  const { groupTree, paginatedGroupTree, expandedGroups, toggleGroupExpand } = state as any;
  const { currentPage, setCurrentPage, rowsPerPage, setRowsPerPage, totalTasks } = state as any;
  const { assigneesCountByTaskId, myAssigneesByTaskId, handleAssignMe, handleUnassignMe } = state as any;
  const { openAssigneesModal, closeAssigneesModal, isAssigneesModalOpen, assigneesModalLoading, assigneesModalList } = state as any;
  const { isDependenciesModalOpen, dependenciesModalLoading, dependenciesModalPredecessors, dependenciesModalSuccessors, openDependenciesModal, closeDependenciesModal, dependenciesCandidates, addPredecessorFromModal, addSuccessorFromModal, dependenciesPopupPosition } = state as any;
  const { isAddDependencyPopupOpen, addDependencyType, addDependencyPopupPosition, openAddPredecessorPopup, openAddSuccessorPopup, closeAddDependencyPopup } = state as any;
  const { orderedHierarchical, ganttTasks, parentCandidates } = state as any;
  const { isGroupSidebarOpen, groupSidebarData, openGroupSidebar, closeGroupSidebar } = state as any;
  // Copia local para reflejar cambios inmediatos en el sidebar de grupo
  const [groupSidebarLocal, setGroupSidebarLocal] = React.useState<any>(null);
  React.useEffect(() => {
    if (isGroupSidebarOpen) setGroupSidebarLocal(groupSidebarData);
    else setGroupSidebarLocal(null);
  }, [isGroupSidebarOpen, groupSidebarData]);
  
  // Estado para el sidebar de tareas individuales
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = React.useState(false);
  const [taskSidebarData, setTaskSidebarData] = React.useState<any>(null);
  const [taskSidebarLoading, setTaskSidebarLoading] = React.useState(false);

  // Función para abrir el sidebar de tareas
  const openTaskSidebar = async (task: any) => {
    setTaskSidebarLoading(true);
    setIsTaskSidebarOpen(true);
    
    try {
      // Hacer llamada a la API para obtener detalles completos de la tarea
      const response = await fetch(`/api/task-elements/${task.id}`);
      if (response.ok) {
        const taskDetails = await response.json();
        setTaskSidebarData(taskDetails);
      } else {
        // Si falla la API, usar los datos básicos de la tarea
        setTaskSidebarData(task);
      }
    } catch (error) {
      console.error('Error al obtener detalles de la tarea:', error);
      // En caso de error, usar los datos básicos de la tarea
      setTaskSidebarData(task);
    } finally {
      setTaskSidebarLoading(false);
    }
  };

  // Función para cerrar el sidebar de tareas
  const closeTaskSidebar = () => {
    setIsTaskSidebarOpen(false);
    setTaskSidebarData(null);
  };
  const { isTaskModalOpen, setIsTaskModalOpen, taskModalMode, selectedTask, isDeleteModalOpen, setIsDeleteModalOpen } = state as any;
  const { isPackageModalOpen, setIsPackageModalOpen, packageModalMode, selectedPackageForEdit } = state as any;
  const { isDeletePackageModalOpen, setIsDeletePackageModalOpen, selectedPackageForDelete } = state as any;
  const { handlePackageFormSubmit, handlePackageDeleteConfirm } = state as any;
  const { handleTaskFormSubmit, handleDeleteConfirm } = state as any;
  const { quickName, setQuickName, handleQuickCreate } = state as any;
  const { createGroup, createSubgroup, createMilestone, createTask, createTaskQuick, deleteElement, deleteElementDirect, deleteElementWithRetry, confirmTempGroup, confirmTempSubgroup } = state as any;
  const { handleTaskReorder } = state as any;
  const rootsCount = Array.isArray(orderedHierarchical)
    ? (orderedHierarchical as any[]).filter((it: any) => it && it.depth === 0).length
    : 0;

  if (loading && !isRefetching) return <div className="p-6">Cargando datos...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  // Mostrar vista de paquetes cuando currentView es 'packages' o cuando no hay paquetes
  const shouldShowPackagesView = currentView === 'packages' || taskPackages.length === 0;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-2xl h-full overflow-hidden">
        {shouldShowPackagesView ? (
          <div className="p-6">
            {React.createElement(require('@/features/tasks/components/PackagesList').PackagesList, {
              items: taskPackages,
              onCreate: openCreatePackageModal,
              onShowTasks: showTasksForPackage,
              onEdit: openEditPackageModal,
              onDelete: openDeletePackageModal,
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <ProjectTasksHeader
              packageName={selectedPackage?.name}
              tasksTab={tasksTab}
              setTasksTab={setTasksTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onBack={showPackages}
              hasElements={orderedHierarchical && orderedHierarchical.length > 0}
            />

            {selectedPackage?.id && (
              <div className="px-6 -mt-3 text-xs text-gray-500">
                ID del paquete: <span className="font-mono">{selectedPackage.id}</span>
              </div>
            )}

            {tasksTab === 'gantt' && (
              <div className="flex-1 overflow-hidden px-6 pt-6 pb-4">
                <IntegratedGanttTable
                  items={orderedHierarchical}
                  onUpdate={(task, updates) => handleInlineUpdate(task, updates)}
                  createGroup={() => createGroup()}
                  createSubgroup={(id) => createSubgroup(id)}
                  createMilestone={(id) => createMilestone(id)}
                  createTask={(id) => createTask(id)}
                  createTaskQuick={(id, name) => createTaskQuick(id, name)}
                  confirmTempGroup={confirmTempGroup}
                  confirmTempSubgroup={confirmTempSubgroup}
                  onOpenGroupSidebar={openGroupSidebar}
                  onDeleteGroup={(id) => deleteElementWithRetry(id)} // Usando función con múltiples estrategias
                  onOpenTaskSidebar={openTaskSidebar}
                  expandedGroups={expandedGroups}
                  toggleGroupExpand={toggleGroupExpand}
                  showActionsRow={true}
                  openDependenciesModal={(id) => openDependenciesModal(id)}
                  ganttTasks={ganttTasks}
                  viewMode={viewMode}
                  ganttColumnWidth={ganttColumnWidth}
                  onGanttDateChange={(task) => {
                    const id = (task as any).id as string;
                    const s = (task as any).start?.toISOString?.() ?? undefined;
                    const e = (task as any).end?.toISOString?.() ?? undefined;
                    if (id && (s || e)) {
                      void handleGanttDateChange(id, s as any, e as any);
                    }
                  }}
                  onGanttClick={(task: any) => {
                    const id = (task as any).id as string;
                    if (!id) return;
                    if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
                    singleClickTimerRef.current = setTimeout(() => {
                      handleGanttBarClick(id);
                      singleClickTimerRef.current = null;
                    }, 220);
                  }}
                  onGanttDoubleClick={(task: any) => {
                    const id = (task as any).id as string;
                    if (!id) return;
                    if (singleClickTimerRef.current) {
                      clearTimeout(singleClickTimerRef.current);
                      singleClickTimerRef.current = null;
                    }
                    handleLinkOnSelect(id);
                  }}
                  onProgressChange={(task) => {
                    const id = (task as any).id as string;
                    const progress = (task as any).progress as number | undefined;
                    if (id && typeof progress === 'number') {
                      handleInlineUpdate({ id } as any, { progressPercentage: progress } as any);
                    }
                  }}
                  rootsCount={rootsCount}
                handleTaskReorder={handleTaskReorder}
                />
              </div>
            )}

            {tasksTab === 'list' && (
              <div className="flex-1 overflow-auto px-6 pt-2 pb-4">
                <TasksListTable
                  items={orderedHierarchical}
                  onUpdate={handleInlineUpdate}
                  createGroup={() => createGroup()}
                  createSubgroup={(id) => createSubgroup(id)}
                  createMilestone={(id) => createMilestone(id)}
                  createTask={(id) => createTask(id)}
                  createTaskQuick={(id, name) => createTaskQuick(id, name)}
                  confirmTempGroup={confirmTempGroup}
                  confirmTempSubgroup={confirmTempSubgroup}
                  onOpenGroupSidebar={openGroupSidebar}
                  onDeleteGroup={openDeleteTaskModal}
                  onOpenTaskSidebar={openTaskSidebar}
                  expandedGroups={expandedGroups}
                  toggleGroupExpand={toggleGroupExpand}
                  showActionsRow={true}
                  openDependenciesModal={(id, position) => openDependenciesModal(id)}
                  handleTaskReorder={handleTaskReorder}
                />
                {/* Solo mostrar paginación cuando hay tareas */}
                {orderedHierarchical && orderedHierarchical.length > 0 && (
                  <PaginationFooter
                    totalRows={totalTasks}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                )}
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
        taskType={selectedTask?.type}
        hasChildren={selectedTask ? taskElements.some(t => t.parentId === selectedTask.id) : false}
      />
      <DeletePackageModal
        isOpen={isDeletePackageModalOpen}
        onClose={() => setIsDeletePackageModalOpen(false)}
        onConfirm={handlePackageDeleteConfirm}
        packageName={selectedPackageForDelete?.name}
      />

      <DependenciesPopup
        isOpen={isDependenciesModalOpen}
        loading={dependenciesModalLoading}
        predecessors={dependenciesModalPredecessors}
        successors={dependenciesModalSuccessors}
        onOpenAddPredecessor={(e?: any) => openAddPredecessorPopup(e)}
        onOpenAddSuccessor={(e?: any) => openAddSuccessorPopup(e)}
        onClose={closeDependenciesModal}
        position={dependenciesPopupPosition}
        isAddPopupOpen={isAddDependencyPopupOpen}
        onCloseAddPopup={closeAddDependencyPopup}
      />

      <AddDependencyPopup
        isOpen={isAddDependencyPopupOpen}
        title={addDependencyType === 'predecessor' ? 'Add Predecessor' : 'Add Successor'}
        candidates={dependenciesCandidates}
        onSelect={(id) => {
          if (addDependencyType === 'predecessor') {
            addPredecessorFromModal(id);
          } else {
            addSuccessorFromModal(id);
          }
        }}
        onClose={closeAddDependencyPopup}
        position={addDependencyPopupPosition}
        onCloseBoth={() => {
          closeAddDependencyPopup();
          closeDependenciesModal();
        }}
      />

      {/* Omite modales de creación/edición de tareas y paquetes por ahora si no existen en v2 */}
      {/* Sidebar de detalles para grupos */}
      <ItemSidebar
        task={groupSidebarLocal ?? groupSidebarData}
        isOpen={isGroupSidebarOpen}
        onClose={closeGroupSidebar}
        onSave={(updates) => {
          const current = groupSidebarLocal ?? groupSidebarData;
          if (current) {
            setGroupSidebarLocal({ ...current, ...(updates as any) });
            handleInlineUpdate(current, updates);
          }
        }}
        allTasks={taskElements}
      />

      {/* Sidebar de detalles para tareas individuales */}
      <ItemSidebar
        task={taskSidebarData}
        isOpen={isTaskSidebarOpen}
        onClose={closeTaskSidebar}
        onSave={(updates) => {
          if (taskSidebarData) {
            // Actualización optimista local del sidebar
            setTaskSidebarData({ ...taskSidebarData, ...(updates as any) });
            handleInlineUpdate(taskSidebarData, updates);
          }
        }}
        allTasks={taskElements}
      />
    </>
  );
}


