// src/hooks/useProjectTasksSection.ts
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { useProjectTasks } from './useProjectTasks';
import { useGroupSidebar } from './useGroupSidebar';
import { useAssigneesState } from './useAssigneesState';
import { VettelApiClient } from '@/lib/api/VettelApiClient';
import type { TaskAssignee } from '@/lib/api/VettelApiClient';
import { TaskElement, TaskElementType, TaskPackage, TaskPriority, VettelTaskStatus } from '@/types/index';
import { Task as GanttTask, ViewMode } from 'gantt-task-react';
import { toast } from 'react-hot-toast';

export function useProjectTasksSection(projectId: string) {
  const { user } = useAuth();
  const [tempGroups, setTempGroups] = useState<Map<string, TaskElement>>(new Map());
  const [tempSubgroups, setTempSubgroups] = useState<Map<string, TaskElement>>(new Map());
  const { taskPackages, taskElements, loading, error, refetch, updatePackageInState, updateTaskElementInState } = useProjectTasks(projectId);
  const [isRefetching, setIsRefetching] = useState(false);
  const silentRefetch = useCallback(async () => {
    try { 
      setIsRefetching(true); 
      await refetch(); 
    } finally { setIsRefetching(false); }
  }, [refetch]);


  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const baseWidthByMode: Record<ViewMode, number> = {
    [ViewMode.Day]: 40,
    [ViewMode.Week]: 80,
    [ViewMode.Month]: 120,
  } as any;
  const [ganttColumnWidth, setGanttColumnWidth] = useState<number>(baseWidthByMode[ViewMode.Day]);
  // Fuerza re-render del Gantt para revertir visualmente un resize no permitido
  const [ganttRefreshCounter, setGanttRefreshCounter] = useState(0);
  
  
  useEffect(() => { setGanttColumnWidth(baseWidthByMode[ViewMode.Day]); }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  // Dependencies visibility and link mode (frontend-only helpers)
  const [showDependencies, setShowDependencies] = useState(true);
  const toggleShowDependencies = useCallback(() => setShowDependencies((v) => !v), []);
  const [linkMode, setLinkMode] = useState(false);
  const toggleLinkMode = useCallback(() => setLinkMode((v) => !v), []);
  const [selectedForLink, setSelectedForLink] = useState<string | null>(null);
  const [tempDependencies, setTempDependencies] = useState<Record<string, string[]>>({}); // successorId -> [predecessorId]
  const addTempDependency = useCallback((predecessorId: string, successorId: string) => {
    setTempDependencies((prev) => {
      const cur = prev[successorId] || [];
      if (predecessorId === successorId || cur.includes(predecessorId)) return prev;
      return { ...prev, [successorId]: [...cur, predecessorId] };
    });
  }, []);

  const createDependencyPersistent = useCallback(async (predecessorId: string, successorId: string) => {
    if (!user) { alert('Debes iniciar sesión para crear dependencias.'); return; }
    // Optimista
    addTempDependency(predecessorId, successorId);
    try {
      await VettelApiClient.createTaskDependency({
        predecessorId,
        successorId,
        type: 'FINISH_TO_START',
        lagDays: 1,
        createdBy: user.id,
      });
      await silentRefetch();
      toast.success('Dependencia creada');
    } catch (e: any) {
      console.error('Error al crear la dependencia:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      toast.error(apiMessage || e.message || 'No se pudo crear la dependencia');
      // revertir optimista
      setTempDependencies((prev) => {
        const list = prev[successorId] || [];
        const nextArr = list.filter((id) => id !== predecessorId);
        const next = { ...prev } as any;
        if (nextArr.length > 0) next[successorId] = nextArr; else delete next[successorId];
        return next;
      });
    }
  }, [user, addTempDependency, silentRefetch]);

  const handleLinkOnSelect = useCallback((taskId: string) => {
    if (!selectedForLink) {
      setSelectedForLink(taskId);
      toast.success('Seleccionado predecesor. Ahora haz click en otra tarea para sucesor');
      return;
    }
    if (selectedForLink && selectedForLink !== taskId) {
      void createDependencyPersistent(selectedForLink, taskId);
    }
    setSelectedForLink(null);
  }, [selectedForLink, createDependencyPersistent]);
  const [tasksTab, setTasksTab] = useState<'gantt' | 'list' | 'board'>('gantt');
  const [currentView, setCurrentView] = useState<'packages' | 'tasks'>('packages');
  const [selectedPackage, setSelectedPackage] = useState<TaskPackage | null>(null);

  const showTasksForPackage = useCallback((pkg: TaskPackage) => { setSelectedPackage(pkg); setCurrentView('tasks'); }, []);
  const showPackages = useCallback(() => { setSelectedPackage(null); setCurrentView('packages'); }, []);

  // Removido: Auto-selección del primer paquete para siempre mostrar la selección
  // useEffect(() => {
  //   if (taskPackages.length > 0 && !selectedPackage && currentView === 'tasks') {
  //     setSelectedPackage(taskPackages[0]);
  //   }
  // }, [taskPackages, selectedPackage, currentView]);

  // Package modals
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageModalMode, setPackageModalMode] = useState<'create' | 'edit'>('create');
  const [selectedPackageForEdit, setSelectedPackageForEdit] = useState<TaskPackage | null>(null);
  const [isDeletePackageModalOpen, setIsDeletePackageModalOpen] = useState(false);
  const [selectedPackageForDelete, setSelectedPackageForDelete] = useState<TaskPackage | null>(null);
  const openCreatePackageModal = useCallback(() => { setSelectedPackageForEdit(null); setPackageModalMode('create'); setIsPackageModalOpen(true); }, []);
  const openEditPackageModal = useCallback((pkg: TaskPackage) => { setSelectedPackageForEdit(pkg); setPackageModalMode('edit'); setIsPackageModalOpen(true); }, []);
  const openDeletePackageModal = useCallback((pkg: TaskPackage) => { setSelectedPackageForDelete(pkg); setIsDeletePackageModalOpen(true); }, []);

  const handlePackageFormSubmit = useCallback(async (data: Partial<TaskPackage>) => {
    if (!user) { alert('Debes iniciar sesión para realizar esta acción.'); return; }
    try {
      if (packageModalMode === 'create') {
        await VettelApiClient.createTaskPackage(projectId, { name: data.name, description: data.description, packageType: data.packageType, createdBy: user.id });
      } else if (selectedPackageForEdit) {
        const updatePayload = { name: data.name, description: data.description, packageType: data.packageType, updatedBy: user.id } as any;
        const updated = await VettelApiClient.updateTaskPackage(selectedPackageForEdit.id, updatePayload);
        updatePackageInState(updated as TaskPackage);
      }
      void silentRefetch();
      setIsPackageModalOpen(false);
    } catch (e: any) {
      console.error('Error al guardar el paquete:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      if (e?.response?.status === 409 && apiMessage) alert(apiMessage); else alert(e.message || 'Error al guardar el paquete');
    }
  }, [user, packageModalMode, selectedPackageForEdit, projectId, updatePackageInState, silentRefetch]);

  const handlePackageDeleteConfirm = useCallback(async () => {
    if (!selectedPackageForDelete) return;
    try {
      await VettelApiClient.deleteTaskPackage(selectedPackageForDelete.id);
      setIsDeletePackageModalOpen(false);
      setSelectedPackageForDelete(null);
      void silentRefetch();
    } catch (e: any) {
      console.error('Error al eliminar el paquete:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      alert(apiMessage || e.message || 'Error al eliminar el paquete');
    }
  }, [selectedPackageForDelete, silentRefetch]);

  // Task modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [selectedTask, setSelectedTask] = useState<TaskElement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const openCreateTaskModal = useCallback(() => { setSelectedTask(null); setTaskModalMode('create'); setIsTaskModalOpen(true); }, []);
  const openEditTaskModal = useCallback((task: TaskElement) => { setSelectedTask(task); setTaskModalMode('edit'); setIsTaskModalOpen(true); }, []);
  const openDeleteTaskModal = useCallback((task: TaskElement) => { setSelectedTask(task); setIsDeleteModalOpen(true); }, []);

  const handleTaskFormSubmit = useCallback(async (taskData: Partial<TaskElement>) => {
    if (!selectedPackage || !user) return;
    try {
      if (taskModalMode === 'create') {
        const payload: any = { tasksPackageId: selectedPackage.id, parentId: taskData.parentId || undefined, name: taskData.name, description: taskData.description, type: taskData.type ?? TaskElementType.SIMPLE_TASK, plannedStartDate: taskData.plannedStartDate, plannedEndDate: taskData.plannedEndDate, priority: taskData.priority, createdBy: user.id };
        await VettelApiClient.createTaskElement(payload);
      } else if (selectedTask) {
        await VettelApiClient.updateTaskElement(selectedTask.id, { ...taskData, updatedBy: user.id });
      }
      void silentRefetch();
      setIsTaskModalOpen(false);
    } catch (e: any) {
      console.error('Error al guardar la tarea:', e);
      if (e?.response?.status === 500) { await silentRefetch(); setIsTaskModalOpen(false); return; }
      alert(e.message);
    }
  }, [selectedPackage, user, taskModalMode, selectedTask, silentRefetch]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedTask) return;
    
    try { 
      // Verificar si la tarea tiene hijos
      const hasChildren = taskElements.some(t => t.parentId === selectedTask.id);
      
      if (hasChildren) {
        const confirmCascade = confirm(
          `⚠️ ADVERTENCIA: Esta tarea contiene elementos hijos.\n\n¿Estás seguro de que quieres eliminar "${selectedTask.name}" y todos sus elementos hijos?\n\nEsta acción no se puede deshacer.`
        );
        
        if (!confirmCascade) {
          setIsDeleteModalOpen(false);
          return;
        }
      }
      
      await VettelApiClient.deleteTaskElement(selectedTask.id); 
      void silentRefetch(); 
      setIsDeleteModalOpen(false); 
      toast.success(`Tarea "${selectedTask.name}" eliminada correctamente`);
    }
    catch (e: any) { 
      console.error('Error al eliminar la tarea:', e);
      
      // Manejo específico de errores
      let errorMessage = 'No se pudo eliminar la tarea';
      
      if (e?.response?.status === 500) {
        errorMessage = 'Error interno del servidor. La tarea podría tener dependencias que impiden su eliminación.';
      } else if (e?.response?.status === 409) {
        errorMessage = 'No se puede eliminar esta tarea porque tiene dependencias activas.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'La tarea no fue encontrada.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      toast.error(errorMessage);
    }
  }, [selectedTask, taskElements, silentRefetch]);

  // Quick create
  const [quickName, setQuickName] = useState('');
  const [isCreatingQuick, setIsCreatingQuick] = useState(false);
  const handleQuickCreate = useCallback(async () => {
    if (!selectedPackage || !user) return;
    const name = quickName.trim();
    if (!name) return;
    try {
      setIsCreatingQuick(true);
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      await VettelApiClient.createTaskElement({ tasksPackageId: selectedPackage.id, name, type: TaskElementType.SIMPLE_TASK, plannedStartDate: start.toISOString(), plannedEndDate: end.toISOString(), priority: TaskPriority.MEDIUM, createdBy: user.id } as any);
      setQuickName('');
      await silentRefetch();
    } catch (e: any) {
      console.error('Error al crear tarea rápida:', e);
      alert(e?.response?.data?.message || e.message || 'No se pudo crear la tarea');
    } finally { setIsCreatingQuick(false); }
  }, [selectedPackage, user, quickName, silentRefetch]);

  // Inline update with optimistic
  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Partial<TaskElement>>>({});
  const getEffectiveTask = useCallback((t: TaskElement): TaskElement => ({ ...(t as any), ...(optimisticTasks[t.id] as any || {}) }), [optimisticTasks]);
  const handleInlineUpdate = useCallback(async (task: TaskElement, updates: Partial<TaskElement>) => {
    if (!user) { alert('Debes iniciar sesión para editar.'); return; }
    try {
      // 1. Actualización optimista inmediata
      setOptimisticTasks((prev) => ({ ...prev, [task.id]: { ...(prev[task.id] || {}), ...updates } }));
      
      // 2. Llamada a la API
      await VettelApiClient.updateTaskElement(task.id, { ...updates, updatedBy: user.id } as any);
      
      // 3. Actualizar los datos reales en el estado y limpiar optimista
      updateTaskElementInState(task.id, updates);
      setOptimisticTasks((prev) => { const copy = { ...prev }; delete copy[task.id]; return copy; });
      
    } catch (e: any) {
      console.error('Error al actualizar la tarea:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      alert(apiMessage || e.message || 'No se pudo actualizar la tarea');
      setOptimisticTasks((prev) => { const copy = { ...prev }; delete copy[task.id]; return copy; });
    }
  }, [user, updateTaskElementInState]);

  // Helper: buscar tarea (root o anidada) por id dentro de taskElements
  const findTaskById = useCallback((id: string): TaskElement | undefined => {
    const stack: any[] = [...(taskElements as any[])];
    while (stack.length) {
      const current = stack.shift();
      if (current?.id === id) return current as TaskElement;
      if (Array.isArray(current?.children) && current.children.length > 0) {
        for (let i = 0; i < current.children.length; i += 1) stack.push(current.children[i]);
      }
    }
    return undefined;
  }, [taskElements]);

  // Gantt: permitir mover (ambos extremos cambian), bloquear extender/recortar (solo un extremo cambia)
  const handleGanttDateChange = useCallback(async (id: string, newStartISO?: string, newEndISO?: string) => {
    const original = findTaskById(id) as any;
    if (!original) return;
    const origStart = original?.plannedStartDate ? new Date(original.plannedStartDate).toISOString() : undefined;
    const origEnd = original?.plannedEndDate ? new Date(original.plannedEndDate).toISOString() : undefined;

    const startChanged = !!newStartISO && newStartISO !== origStart;
    const endChanged = !!newEndISO && newEndISO !== origEnd;

    // Movimiento válido: ambos extremos cambian
    if (startChanged && endChanged) {
      await handleInlineUpdate({ id } as any, { plannedStartDate: newStartISO as any, plannedEndDate: newEndISO as any });
      return;
    }

    // Resize (bloqueado): no aplicar cambios y forzar re-render para revertir visualmente
    if (startChanged || endChanged) {
      setGanttRefreshCounter((n) => n + 1);
      return;
    }
  }, [findTaskById, handleInlineUpdate]);

  // Assignees
  const { myAssigneesByTaskId, assigneesCountByTaskId: assigneesCountByTaskIdFromHook, handleAssignMe, handleUnassignMe } = useAssigneesState(user?.id, taskElements.map(t => t.id));
  const [isAssigneesModalOpen, setIsAssigneesModalOpen] = useState(false);
  const [assigneesModalTaskId, setAssigneesModalTaskId] = useState<string | null>(null);
  const [assigneesModalLoading, setAssigneesModalLoading] = useState(false);
  const [assigneesModalList, setAssigneesModalList] = useState<TaskAssignee[]>([]);
  const openAssigneesModal = useCallback(async (taskId: string) => {
    setIsAssigneesModalOpen(true);
    setAssigneesModalTaskId(taskId);
    setAssigneesModalLoading(true);
    try {
      const task = taskElements.find((t) => t.id === taskId) as any;
      const list = Array.isArray(task?.assignees) ? (task.assignees as TaskAssignee[]) : [];
      setAssigneesModalList(list);
    } catch (e) {
      console.error('No se pudo cargar la lista de asignados', e);
      setAssigneesModalList([]);
    } finally { setAssigneesModalLoading(false); }
  }, [taskElements]);
  const closeAssigneesModal = useCallback(() => { setIsAssigneesModalOpen(false); setAssigneesModalTaskId(null); setAssigneesModalList([]); }, []);

  // Dependencies modal
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [dependenciesModalLoading, setDependenciesModalLoading] = useState(false);
  const [dependenciesModalPredecessors, setDependenciesModalPredecessors] = useState<{ id: string; name: string; type: string }[]>([]);
  const [dependenciesModalSuccessors, setDependenciesModalSuccessors] = useState<{ id: string; name: string; type: string }[]>([]);
  const [dependenciesModalTaskId, setDependenciesModalTaskId] = useState<string | null>(null);
  const [dependenciesCandidates, setDependenciesCandidates] = useState<{ id: string; name: string }[]>([]);
  const [dependenciesPopupPosition, setDependenciesPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const openDependenciesModal = useCallback(async (taskId: string, position?: { x: number; y: number }) => {
    // Usar la posición proporcionada o centrar en la pantalla
    if (position) {
      setDependenciesPopupPosition(position);
    } else {
      setDependenciesPopupPosition({ 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });
    }
    setIsDependenciesModalOpen(true);
    setDependenciesModalLoading(true);
    try {
      setDependenciesModalTaskId(taskId);
      // Construir mapa id->tarea desde taskElements (filtrando por package si aplica)
      const baseList = Array.isArray(taskElements) ? (taskElements as any[]) : [];
      const inPackage = selectedPackage
        ? baseList.filter((t: any) => t?.tasksPackageId === selectedPackage.id)
        : baseList;
      const flattenWithChildren = (items: any[]): any[] => {
        const flat: any[] = [];
        const stack: any[] = [...items];
        while (stack.length) {
          const current = stack.shift();
          flat.push(current);
          if (current && Array.isArray(current.children) && current.children.length > 0) {
            for (let i = current.children.length - 1; i >= 0; i -= 1) stack.unshift(current.children[i]);
          }
        }
        return flat;
      };
      const allTasks = flattenWithChildren(inPackage);
      const byId = new Map(allTasks.map((t) => [t.id, t] as const));
      // Candidates: todas las tareas del paquete menos la actual
      setDependenciesCandidates(allTasks.filter((t) => t?.id && t.id !== taskId).map((t) => ({ id: t.id, name: t.name })));
      type Edge = { id?: string; predecessorId: string; successorId: string; type?: string };
      const edges: Edge[] = [];
      const seen = new Set<string>();
      for (const t of allTasks as any[]) {
        const fromPred = Array.isArray(t?.predecessorDependencies) ? (t.predecessorDependencies as any[]) : [];
        for (const d of fromPred) {
          const key = String(d?.id || `${d?.predecessorId}->${d?.successorId}:${d?.type}`);
          if (seen.has(key)) continue; seen.add(key);
          edges.push({ id: d?.id, predecessorId: d?.predecessorId, successorId: d?.successorId, type: d?.type });
        }
        const fromDeps = Array.isArray(t?.dependencies) ? (t.dependencies as any[]) : [];
        for (const d of fromDeps) {
          const key = String(d?.id || `${d?.predecessorId}->${d?.successorId}:${d?.type}`);
          if (seen.has(key)) continue; seen.add(key);
          edges.push({ id: d?.id, predecessorId: d?.predecessorId, successorId: d?.successorId, type: d?.type });
        }
      }
      const predecessors = edges.filter((e) => e.successorId === taskId).map((e) => ({ id: e.predecessorId, name: byId.get(e.predecessorId)?.name || '—', type: e.type || 'FINISH_TO_START' }));
      const successors = edges.filter((e) => e.predecessorId === taskId).map((e) => ({ id: e.successorId, name: byId.get(e.successorId)?.name || '—', type: e.type || 'FINISH_TO_START' }));
      setDependenciesModalPredecessors(predecessors);
      setDependenciesModalSuccessors(successors);
    } catch (e) {
      console.error('No se pudieron calcular las dependencias para el modal', e);
      setDependenciesModalPredecessors([]);
      setDependenciesModalSuccessors([]);
    } finally {
      setDependenciesModalLoading(false);
    }
  }, [taskElements, selectedPackage]);
  const closeDependenciesModal = useCallback(() => {
    setIsDependenciesModalOpen(false);
    setDependenciesModalTaskId(null);
    setDependenciesModalPredecessors([]);
    setDependenciesModalSuccessors([]);
  }, []);

  // Add dependency selection popup
  const [isAddDependencyPopupOpen, setIsAddDependencyPopupOpen] = useState(false);
  const [addDependencyType, setAddDependencyType] = useState<'predecessor' | 'successor'>('predecessor');
  const [addDependencyPopupPosition, setAddDependencyPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const openAddPredecessorPopup = useCallback((event?: React.MouseEvent) => {
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setAddDependencyPopupPosition({ x: rect.right, y: rect.top });
    }
    setAddDependencyType('predecessor');
    setIsAddDependencyPopupOpen(true);
  }, []);

  const openAddSuccessorPopup = useCallback((event?: React.MouseEvent) => {
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setAddDependencyPopupPosition({ x: rect.right, y: rect.top });
    }
    setAddDependencyType('successor');
    setIsAddDependencyPopupOpen(true);
  }, []);

  const closeAddDependencyPopup = useCallback(() => {
    setIsAddDependencyPopupOpen(false);
  }, []);

  // Add dependency from modal actions
  const addPredecessorFromModal = useCallback(async (predecessorId: string) => {
    if (!dependenciesModalTaskId) return;
    await createDependencyPersistent(predecessorId, dependenciesModalTaskId);
    // refrescar modal
    await openDependenciesModal(dependenciesModalTaskId);
  }, [dependenciesModalTaskId, createDependencyPersistent, openDependenciesModal]);
  
  const addSuccessorFromModal = useCallback(async (successorId: string) => {
    if (!dependenciesModalTaskId) return;
    await createDependencyPersistent(dependenciesModalTaskId, successorId);
    await openDependenciesModal(dependenciesModalTaskId);
  }, [dependenciesModalTaskId, createDependencyPersistent, openDependenciesModal]);

  // Crear grupo temporal (solo en estado local)
  const createTempGroup = useCallback(() => {
    if (!selectedPackage || !user) return;
    
    const tempId = `temp-group-${Date.now()}`;
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    
    const tempGroup: TaskElement = {
      id: tempId,
      name: '',
      type: TaskElementType.GROUP,
      tasksPackageId: selectedPackage.id,
      plannedStartDate: start.toISOString(),
      plannedEndDate: end.toISOString(),
      priority: TaskPriority.MEDIUM,
      status: VettelTaskStatus.NOT_STARTED,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: 0,
      isTemp: true
    } as any;
    
    setTempGroups(prev => new Map(prev).set(tempId, tempGroup));
    return tempId;
  }, [selectedPackage, user]);

  // Confirmar creación de grupo temporal en el servidor
  const confirmTempGroup = useCallback(async (tempId: string, groupName: string) => {
    if (!selectedPackage || !user) return;
    
    try {
      const tempGroup = tempGroups.get(tempId);
      if (!tempGroup) return;
      
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      // Crear en el servidor
      const created = await VettelApiClient.createTaskElement({ 
        tasksPackageId: selectedPackage.id, 
        name: groupName, 
        type: TaskElementType.GROUP, 
        plannedStartDate: start.toISOString(), 
        plannedEndDate: end.toISOString(), 
        priority: TaskPriority.MEDIUM, 
        createdBy: user.id 
      } as any);
      
      // Calcular y asignar sortOrder después de crear
      const rootGroups = taskElements.filter(
        t => t.tasksPackageId === selectedPackage.id && !t.parentId
      );
      const maxSortOrder = rootGroups.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0);
      const nextSortOrder = maxSortOrder + 1;
      
      // Actualizar con el sortOrder
      await VettelApiClient.updateTaskElement(created.id, { sortOrder: nextSortOrder, updatedBy: user.id } as any);
      
      // Remover grupo temporal
      setTempGroups(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
      
      await silentRefetch();
    } catch (e) { 
      console.error('Error al crear grupo:', e);
      // Remover grupo temporal en caso de error
      setTempGroups(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }
  }, [selectedPackage, user, taskElements, tempGroups, silentRefetch]);

  // Crear subgrupo temporal (solo en estado local)
  const createTempSubgroup = useCallback((parentId: string) => {
    if (!selectedPackage || !user) return;
    
    const tempId = `temp-subgroup-${Date.now()}`;
    const start = new Date();
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    
    const tempSubgroup: TaskElement = {
      id: tempId,
      name: '',
      type: TaskElementType.SUBGROUP,
      tasksPackageId: selectedPackage.id,
      parentId: parentId,
      plannedStartDate: start.toISOString(),
      plannedEndDate: end.toISOString(),
      priority: TaskPriority.MEDIUM,
      status: VettelTaskStatus.NOT_STARTED,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: 0,
      isTemp: true
    } as any;
    
    setTempSubgroups(prev => new Map(prev).set(tempId, tempSubgroup));
    return tempId;
  }, [selectedPackage, user]);

  // Confirmar creación de subgrupo temporal en el servidor
  const confirmTempSubgroup = useCallback(async (tempId: string, subgroupName: string) => {
    if (!selectedPackage || !user) return;
    
    try {
      const tempSubgroup = tempSubgroups.get(tempId);
      if (!tempSubgroup) return;
      
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      // Crear en el servidor
      const created = await VettelApiClient.createTaskElement({ 
        tasksPackageId: selectedPackage.id, 
        parentId: tempSubgroup.parentId,
        name: subgroupName, 
        type: TaskElementType.SUBGROUP, 
        plannedStartDate: start.toISOString(), 
        plannedEndDate: end.toISOString(), 
        priority: TaskPriority.MEDIUM, 
        createdBy: user.id 
      } as any);
      
      // Calcular y asignar sortOrder después de crear
      const siblingsWithSameParent = taskElements.filter(
        t => t.tasksPackageId === selectedPackage.id && t.parentId === tempSubgroup.parentId
      );
      const maxSortOrder = siblingsWithSameParent.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0);
      const nextSortOrder = maxSortOrder + 1;
      
      // Actualizar con el sortOrder
      await VettelApiClient.updateTaskElement(created.id, { sortOrder: nextSortOrder, updatedBy: user.id } as any);
      
      // Remover subgrupo temporal
      setTempSubgroups(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
      
      await silentRefetch();
    } catch (e) { 
      console.error('Error al crear subgrupo:', e);
      // Remover subgrupo temporal en caso de error
      setTempSubgroups(prev => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });
    }
  }, [selectedPackage, user, taskElements, tempSubgroups, silentRefetch]);

  // Función original para crear grupo (ahora llama a createTempGroup)
  const createGroup = useCallback(() => {
    return createTempGroup();
  }, [createTempGroup]);

  // Función original para crear subgrupo (ahora llama a createTempSubgroup)
  const createSubgroup = useCallback((parentId: string) => {
    return createTempSubgroup(parentId);
  }, [createTempSubgroup]);

  const createMilestone = useCallback(async (parentId: string) => {
    if (!selectedPackage || !user) return;
    try {
      const when = new Date();
      
      // Crear sin sortOrder
      const created = await VettelApiClient.createTaskElement({ 
        tasksPackageId: selectedPackage.id, 
        parentId, 
        name: 'Nuevo hito', 
        type: TaskElementType.MILESTONE, 
        plannedStartDate: when.toISOString(), 
        plannedEndDate: when.toISOString(), 
        priority: TaskPriority.MEDIUM, 
        createdBy: user.id 
      } as any);
      
      // Calcular y asignar sortOrder después de crear
      const siblingsWithSameParent = taskElements.filter(
        t => t.tasksPackageId === selectedPackage.id && t.parentId === parentId
      );
      const maxSortOrder = siblingsWithSameParent.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0);
      const nextSortOrder = maxSortOrder + 1;
      
      // Actualizar con el sortOrder
      await VettelApiClient.updateTaskElement(created.id, { sortOrder: nextSortOrder, updatedBy: user.id } as any);
      
      await silentRefetch();
    } catch (e) { console.error('Error al crear hito:', e); }
  }, [selectedPackage, user, taskElements, silentRefetch]);

  const createTask = useCallback(async (parentId: string) => {
    if (!selectedPackage || !user) return;
    try {
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      // Crear sin sortOrder
      const created = await VettelApiClient.createTaskElement({ 
        tasksPackageId: selectedPackage.id, 
        parentId, 
        name: 'Nueva tarea', 
        type: TaskElementType.SIMPLE_TASK, 
        plannedStartDate: start.toISOString(), 
        plannedEndDate: end.toISOString(), 
        priority: TaskPriority.MEDIUM, 
        createdBy: user.id 
      } as any);
      
      // Calcular y asignar sortOrder después de crear
      const siblingsWithSameParent = taskElements.filter(
        t => t.tasksPackageId === selectedPackage.id && t.parentId === parentId
      );
      const maxSortOrder = siblingsWithSameParent.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0);
      const nextSortOrder = maxSortOrder + 1;
      
      // Actualizar con el sortOrder
      await VettelApiClient.updateTaskElement(created.id, { sortOrder: nextSortOrder, updatedBy: user.id } as any);
      
      await silentRefetch();
    } catch (e) { console.error('Error al crear tarea:', e); }
  }, [selectedPackage, user, taskElements, silentRefetch]);

  const createTaskQuick = useCallback(async (parentId: string, taskName: string) => {
    if (!selectedPackage || !user) return;
    try {
      const start = new Date();
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      
      // Crear sin sortOrder
      const created = await VettelApiClient.createTaskElement({ 
        tasksPackageId: selectedPackage.id, 
        parentId, 
        name: taskName, 
        type: TaskElementType.SIMPLE_TASK, 
        plannedStartDate: start.toISOString(), 
        plannedEndDate: end.toISOString(), 
        priority: TaskPriority.MEDIUM, 
        createdBy: user.id 
      } as any);
      
      // Calcular y asignar sortOrder después de crear
      const siblingsWithSameParent = taskElements.filter(
        t => t.tasksPackageId === selectedPackage.id && t.parentId === parentId
      );
      const maxSortOrder = siblingsWithSameParent.reduce((max, t) => Math.max(max, t.sortOrder ?? 0), 0);
      const nextSortOrder = maxSortOrder + 1;
      
      // Actualizar con el sortOrder
      await VettelApiClient.updateTaskElement(created.id, { sortOrder: nextSortOrder, updatedBy: user.id } as any);
      
      await silentRefetch();
    } catch (e) { 
      console.error('Error al crear tarea rápida:', e);
      throw e; // Re-lanzar el error para que el componente pueda manejarlo
    }
  }, [selectedPackage, user, taskElements, silentRefetch]);

  // Eliminación simple de cualquier elemento
  const deleteElement = useCallback(async (elementId: string) => {
    if (!user) { 
      alert('Debes iniciar sesión para eliminar elementos.'); 
      return; 
    }

    const elementToDelete = taskElements.find(t => t.id === elementId);
    if (!elementToDelete) {
      console.error('Elemento no encontrado:', elementId);
      return;
    }

    try {
      // Obtener el nombre del tipo de elemento
      const getElementTypeName = (type: string) => {
        switch (type) {
          case 'GROUP': return 'Grupo';
          case 'SUBGROUP': return 'Subgrupo';
          case 'SIMPLE_TASK': return 'Tarea';
          case 'MILESTONE': return 'Hito';
          default: return 'Elemento';
        }
      };

      const elementName = elementToDelete.name || 'Elemento';
      const elementTypeName = getElementTypeName(elementToDelete.type);
      
      // Verificar si el elemento tiene hijos
      const hasChildren = taskElements.some(t => t.parentId === elementId);
      
      // Debug: Log del elemento a eliminar
      console.log('Elemento a eliminar:', {
        id: elementId,
        name: elementName,
        type: elementToDelete.type,
        hasChildren,
        children: taskElements.filter(t => t.parentId === elementId).map(t => ({ id: t.id, name: t.name, type: t.type })),
        parentId: elementToDelete.parentId,
        tasksPackageId: elementToDelete.tasksPackageId
      });
      
      // Crear mensaje de confirmación basado en si tiene hijos o no
      let confirmMessage: string;
      if (hasChildren) {
        confirmMessage = `¿Estás seguro de que quieres eliminar "${elementName}"?\n\n⚠️ ADVERTENCIA: Este ${elementTypeName.toLowerCase()} contiene elementos hijos que también serán eliminados.\n\nEsta acción no se puede deshacer.`;
      } else {
        confirmMessage = `¿Estás seguro de que quieres eliminar "${elementName}"?\n\nEsto eliminará permanentemente el ${elementTypeName.toLowerCase()}.\n\nEsta acción no se puede deshacer.`;
      }
      
      if (!confirm(confirmMessage)) {
        return;
      }

      // Debug: Verificar si el elemento existe en el servidor antes de eliminar
      try {
        console.log('Verificando elemento en servidor antes de eliminar...');
        const serverElement = await VettelApiClient.getTaskElementById(elementId);
        console.log('Elemento encontrado en servidor:', serverElement);
        
        // Verificar si hay relaciones problemáticas
        if ((serverElement as any).children && (serverElement as any).children.length > 0) {
          console.log('Elemento tiene hijos en servidor:', (serverElement as any).children);
        }
        if ((serverElement as any).assignees && (serverElement as any).assignees.length > 0) {
          console.log('Elemento tiene asignados en servidor:', (serverElement as any).assignees);
        }
        if ((serverElement as any).predecessorDependencies && (serverElement as any).predecessorDependencies.length > 0) {
          console.log('Elemento tiene dependencias predecesoras en servidor:', (serverElement as any).predecessorDependencies);
        }
        if ((serverElement as any).successorDependencies && (serverElement as any).successorDependencies.length > 0) {
          console.log('Elemento tiene dependencias sucesoras en servidor:', (serverElement as any).successorDependencies);
        }
        
      } catch (verifyError: any) {
        console.error('Error al verificar elemento en servidor:', verifyError);
        if (verifyError?.response?.status === 404) {
          toast.error('El elemento no existe en el servidor. Puede que ya haya sido eliminado.');
          await silentRefetch(); // Refrescar para sincronizar
          return;
        }
        // Si hay error en la verificación pero no es 404, continuar con la eliminación
        console.log('Error en verificación, pero continuando con eliminación...');
      }

      // Eliminar el elemento
      console.log('Iniciando eliminación del elemento...');
      await VettelApiClient.deleteTaskElement(elementId);
      
      await silentRefetch();
      toast.success(`${elementTypeName} "${elementName}" eliminado correctamente`);
      
    } catch (e: any) {
      console.error('Error al eliminar elemento:', e);
      console.error('Error details:', {
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        message: e?.message,
        elementId,
        elementName: elementToDelete?.name || 'Desconocido',
        elementType: elementToDelete?.type || 'Desconocido'
      });
      
      // Manejo específico de errores
      let errorMessage = 'No se pudo eliminar el elemento';
      
      if (e?.response?.status === 500) {
        // Intentar obtener más detalles del error del servidor
        const serverMessage = e?.response?.data?.message || e?.response?.data?.error;
        if (serverMessage) {
          errorMessage = `Error del servidor: ${serverMessage}`;
        } else {
          errorMessage = 'Error interno del servidor. El elemento podría tener dependencias que impiden su eliminación.';
        }
      } else if (e?.response?.status === 409) {
        errorMessage = 'No se puede eliminar este elemento porque tiene dependencias activas.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'El elemento no fue encontrado.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      toast.error(errorMessage);
    }
  }, [user, taskElements, silentRefetch]);

  // Función de debug temporal para eliminar sin verificación previa
  const deleteElementDirect = useCallback(async (elementId: string) => {
    if (!user) { 
      alert('Debes iniciar sesión para eliminar elementos.'); 
      return; 
    }

    const elementToDelete = taskElements.find(t => t.id === elementId);
    if (!elementToDelete) {
      console.error('Elemento no encontrado:', elementId);
      return;
    }

    try {
      console.log('Eliminación directa sin verificación previa:', {
        id: elementId,
        name: elementToDelete.name,
        type: elementToDelete.type
      });

      await VettelApiClient.deleteTaskElement(elementId);
      await silentRefetch();
      toast.success(`Elemento "${elementToDelete.name}" eliminado correctamente`);
      
    } catch (e: any) {
      console.error('Error en eliminación directa:', e);
      console.error('Error details:', {
        status: e?.response?.status,
        statusText: e?.response?.statusText,
        data: e?.response?.data,
        message: e?.message,
        elementId
      });
      
      // Log detallado del error del servidor
      if (e?.response?.data) {
        console.error('Datos del error del servidor:', JSON.stringify(e.response.data, null, 2));
      }
      
      let errorMessage = 'No se pudo eliminar el elemento';
      if (e?.response?.data?.message) {
        errorMessage = `Error del servidor: ${e.response.data.message}`;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      toast.error(errorMessage);
    }
  }, [user, taskElements, silentRefetch]);

  // Función temporal para probar eliminación con diferentes estrategias
  const deleteElementWithRetry = useCallback(async (elementId: string) => {
    if (!user) { 
      alert('Debes iniciar sesión para eliminar elementos.'); 
      return; 
    }

    const elementToDelete = taskElements.find(t => t.id === elementId);
    
    // Debug: Verificar por qué no se encuentra el elemento
    console.log('Debug - Buscando elemento:', {
      elementId,
      totalTaskElements: taskElements.length,
      taskElementIds: taskElements.map(t => t.id),
      foundElement: !!elementToDelete,
      selectedPackage: selectedPackage?.id,
      selectedPackageName: selectedPackage?.name,
      currentView
    });
    
    // Debug adicional: Verificar si el elemento está en otro paquete
    const allTaskElements = taskElements; // Esto debería incluir todos los elementos
    const elementInAnyPackage = allTaskElements.find(t => t.id === elementId);
    if (elementInAnyPackage) {
      console.log('Elemento encontrado en otro contexto:', {
        element: elementInAnyPackage,
        elementPackageId: elementInAnyPackage.tasksPackageId,
        currentPackageId: selectedPackage?.id
      });
    }
    
    if (!elementToDelete) {
      console.error('Elemento no encontrado en taskElements:', elementId);
      console.log('IDs disponibles en taskElements:', taskElements.map(t => ({ id: t.id, name: t.name, type: t.type })));
      
      // Debug: Verificar si el elemento está en el paquete correcto
      console.log('Verificando paquetes disponibles:', taskPackages.map(p => ({ id: p.id, name: p.name })));
      
      // Intentar obtener el elemento directamente del servidor
      try {
        console.log('Intentando obtener elemento directamente del servidor...');
        const serverElement = await VettelApiClient.getTaskElementById(elementId);
        console.log('Elemento encontrado en servidor:', serverElement);
        
        // Verificar si el paquete del elemento está en nuestros paquetes cargados
        const elementPackage = taskPackages.find(p => p.id === serverElement.tasksPackageId);
        if (!elementPackage) {
          console.error('El paquete del elemento no está cargado:', serverElement.tasksPackageId);
          toast.error('El elemento pertenece a un paquete que no está cargado. Refrescando datos...');
          await silentRefetch();
          return;
        }
        
        // Usar los datos del servidor para la eliminación
        console.log('Usando datos del servidor para eliminación');
        await VettelApiClient.deleteTaskElement(elementId);
        await silentRefetch();
        toast.success(`Elemento "${serverElement.name}" eliminado correctamente`);
        return;
        
      } catch (serverError: any) {
        console.error('Error al obtener elemento del servidor:', serverError);
        toast.error('No se pudo encontrar el elemento ni en el frontend ni en el servidor');
        return;
      }
    }

    console.log('Intentando eliminación con diferentes estrategias:', {
      id: elementId,
      name: elementToDelete.name,
      type: elementToDelete.type
    });

    // Estrategia 1: Eliminación directa
    try {
      console.log('Estrategia 1: Eliminación directa');
      await VettelApiClient.deleteTaskElement(elementId);
      await silentRefetch();
      toast.success(`Elemento "${elementToDelete.name}" eliminado correctamente`);
      return;
    } catch (e: any) {
      console.error('Estrategia 1 falló:', e?.response?.data);
    }

    // Estrategia 2: Intentar actualizar el elemento primero (soft delete)
    try {
      console.log('Estrategia 2: Soft delete - marcando como archivado');
      await VettelApiClient.updateTaskElement(elementId, { 
        isArchived: true, 
        updatedBy: user.id 
      } as any);
      await silentRefetch();
      toast.success(`Elemento "${elementToDelete.name}" archivado correctamente (eliminación temporal)`);
      return;
    } catch (e: any) {
      console.error('Estrategia 2 falló:', e?.response?.data);
    }

    // Estrategia 3: Intentar eliminar con headers adicionales
    try {
      console.log('Estrategia 3: Eliminación con headers adicionales');
      // Esta estrategia requeriría modificar el cliente API temporalmente
      toast.error('No se pudo eliminar el elemento con ninguna estrategia');
    } catch (e: any) {
      console.error('Estrategia 3 falló:', e?.response?.data);
    }

    toast.error('No se pudo eliminar el elemento. Revisa la consola para más detalles.');
  }, [user, taskElements, silentRefetch]);

  // Función para forzar recarga completa de datos
  const forceRefreshData = useCallback(async () => {
    console.log('Forzando recarga completa de datos...');
    try {
      await silentRefetch();
      console.log('Recarga completada. Elementos disponibles:', taskElements.length);
    } catch (e) {
      console.error('Error al recargar datos:', e);
    }
  }, [silentRefetch, taskElements.length]);

  // Drag and Drop: Reordenar tareas
  const handleTaskReorder = useCallback(async (
    taskId: string,
    newParentId: string | undefined | null,
    newIndex: number,
    allTasks?: TaskElement[] // Array completo de tareas para buscar
  ) => {
    if (!user) return;
    
    try {
      // Obtener la tarea que se está moviendo
      const task = (allTasks || taskElements).find(t => t.id === taskId);
      if (!task) {
        console.error('Tarea no encontrada:', taskId);
        console.error('IDs disponibles en taskElements:', taskElements.map(t => t.id));
        console.error('Total taskElements:', taskElements.length);
        if (allTasks) {
          console.error('IDs disponibles en allTasks:', allTasks.map(t => t.id));
          console.error('Total allTasks:', allTasks.length);
        }
        return;
      }

      console.log('Reordenando tarea:', {
        taskName: task.name,
        taskId,
        currentParent: task.parentId,
        newParent: newParentId,
        newIndex,
        taskType: task.type
      });

      // Construir la nueva lista de orden en el destino (incluyendo la tarea movida)
      const destSiblings = (allTasks || taskElements)
        .filter(t => t.tasksPackageId === task.tasksPackageId && t.parentId === newParentId && t.type === task.type)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      // Quitar la tarea si está incluida
      const filtered = destSiblings.filter(t => t.id !== taskId);
      // Insertar en la posición deseada
      const clampedIndex = Math.max(0, Math.min(newIndex, filtered.length));
      const reordered = [...filtered.slice(0, clampedIndex), task, ...filtered.slice(clampedIndex)];
      // Reindexar a 1..n
      const patchQueue: Array<Promise<any>> = [];
      for (let i = 0; i < reordered.length; i += 1) {
        const el = reordered[i];
        const desiredParent = newParentId ?? null;
        const desiredOrder = i + 1;
        const needsParentUpdate = (el.id === task.id) ? (task.parentId !== desiredParent) : false;
        if (el.sortOrder !== desiredOrder || needsParentUpdate) {
          patchQueue.push(
            VettelApiClient.updateTaskElement(el.id, {
              sortOrder: desiredOrder,
              ...(el.id === task.id ? { parentId: desiredParent as any } : {}),
              updatedBy: user.id,
            } as any)
          );
        }
      }
      await Promise.all(patchQueue);
      console.log('✅ Reindexación aplicada');
      
      await silentRefetch();
      console.log('✅ Refetch completado');
      
      toast.success('Tarea reordenada correctamente');
    } catch (e: any) {
      console.error('Error al reordenar tarea:', e);
      toast.error('No se pudo reordenar la tarea');
    }
  }, [user, taskElements, silentRefetch]);

  // Mappings
  const groupTree = useMemo(() => {
    if (!selectedPackage) return [] as { group: TaskElement; children: TaskElement[] }[];
    const hasTasksPackageId = taskElements.some((t: any) => t && 'tasksPackageId' in t && t.tasksPackageId);
    const baseList = hasTasksPackageId ? (taskElements as any[]).filter((t: any) => t.tasksPackageId === selectedPackage.id) : (taskElements as any[]);
    
    // Función de ordenamiento por tipo y luego por fecha de actualización descendente
    const sortByUpdatedAtDesc = (a: TaskElement, b: TaskElement) => {
      // Primero: Ordenar por tipo de tarea para respetar jerarquía
      const typeOrder: Record<string, number> = {
        'GROUP': 0,
        'SUBGROUP': 1,
        'SIMPLE_TASK': 2,
        'MILESTONE': 2,
      };
      
      const aTypeOrder = typeOrder[a.type] ?? 3;
      const bTypeOrder = typeOrder[b.type] ?? 3;
      
      if (aTypeOrder !== bTypeOrder) return aTypeOrder - bTypeOrder;
      
      // Segundo: Ordenar por updatedAt (fecha de última modificación)
      const getEffectiveDate = (element: TaskElement): number => {
        const updatedAt = element.updatedAt;
        const createdAt = element.createdAt;
        
        const dateToUse = updatedAt || createdAt;
        if (!dateToUse) return Date.now();
        
        const date = new Date(dateToUse);
        const timestamp = isNaN(date.getTime()) ? Date.now() : date.getTime();
        
        return timestamp;
      };
      
      const aTime = getEffectiveDate(a);
      const bTime = getEffectiveDate(b);
      
      // Ordenar por fecha descendente (más reciente primero)
      if (aTime !== bTime) return bTime - aTime;
      
      // Tercero: Si las fechas son iguales, usar sortOrder como fallback
      const ao = a.sortOrder ?? 0; 
      const bo = b.sortOrder ?? 0; 
      if (ao !== bo) return ao - bo; 
      
      // Finalmente, ordenar por nombre
      return a.name.localeCompare(b.name);
    };
    
    if (baseList.some((t: any) => Array.isArray(t?.children))) {
      const roots = (baseList as TaskElement[]).filter((t) => !t.parentId);
      roots.sort(sortByUpdatedAtDesc);
      return roots.map((r) => {
        const children = ((r as any).children as TaskElement[]) || [];
        children.sort(sortByUpdatedAtDesc);
        return { group: r, children };
      });
    }
    const inPackage = baseList as TaskElement[];
    const childrenMap = new Map<string, TaskElement[]>();
    inPackage.forEach((t) => { if (t.parentId) { const arr = childrenMap.get(t.parentId) ?? []; arr.push(t); childrenMap.set(t.parentId, arr); } });
    const roots = inPackage.filter((t) => !t.parentId);
    roots.sort(sortByUpdatedAtDesc);
    
    // Ordenar también los children de cada grupo
    childrenMap.forEach((arr) => arr.sort(sortByUpdatedAtDesc));
    
    return roots.map((r) => ({ group: r, children: childrenMap.get(r.id) ?? [] }));
  }, [selectedPackage, taskElements]);

  // Paginated groupTree - paginate by individual tasks, not groups
  const { paginatedGroupTree, totalTasks } = useMemo(() => {
    // First, flatten all tasks to count them properly
    const allTasks: TaskElement[] = [];
    groupTree.forEach(({ group, children }) => {
      allTasks.push(group);
      allTasks.push(...children);
    });
    
    const totalTasks = allTasks.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Get the tasks for this page
    const tasksForPage = allTasks.slice(startIndex, endIndex);
    
    // Reconstruct the group tree structure for only the tasks on this page
    const paginatedGroups: { group: TaskElement; children: TaskElement[] }[] = [];
    const taskIds = new Set(tasksForPage.map(t => t.id));
    
    groupTree.forEach(({ group, children }) => {
      const groupIncluded = taskIds.has(group.id);
      const includedChildren = children.filter(child => taskIds.has(child.id));
      
      if (groupIncluded || includedChildren.length > 0) {
        paginatedGroups.push({
          group: groupIncluded ? group : { ...group, name: `${group.name} (...)` }, // Show partial indicator if group not included
          children: includedChildren
        });
      }
    });
    
    return { paginatedGroupTree: paginatedGroups, totalTasks };
  }, [groupTree, currentPage, rowsPerPage]);

  // Reset to page 1 when rowsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  useEffect(() => { if (groupTree.length === 0) return; setExpandedGroups((prev) => { const next = new Set(prev); for (const { group } of groupTree) next.add(group.id); return next; }); }, [groupTree]);
  const toggleGroupExpand = useCallback((id: string) => { setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; }); }, []);

  const orderedHierarchical: { task: TaskElement; depth: number }[] = useMemo(() => {
    if (!selectedPackage) return [];
    const flattenWithChildren = (items: any[]): TaskElement[] => {
      const flat: TaskElement[] = []; const stack: any[] = [...items];
      while (stack.length) { const current = stack.shift(); flat.push(getEffectiveTask(current as TaskElement)); if (current && Array.isArray(current.children) && current.children.length > 0) { for (let i = current.children.length - 1; i >= 0; i -= 1) stack.unshift(current.children[i]); } }
      return flat;
    };
    const hasTasksPackageId = taskElements.some((t: any) => t && 'tasksPackageId' in t && t.tasksPackageId);
    const baseList = hasTasksPackageId ? (taskElements as any[]).filter((t: any) => t.tasksPackageId === selectedPackage.id) : (taskElements as any[]);
    
    // Agregar grupos y subgrupos temporales al final de la lista
    const tempGroupsList = Array.from(tempGroups.values());
    const tempSubgroupsList = Array.from(tempSubgroups.values());
    const allElements = [...baseList, ...tempGroupsList, ...tempSubgroupsList];
    
    const inPackage = allElements.some((t) => Array.isArray((t as any)?.children))
      ? flattenWithChildren(allElements)
      : (allElements as TaskElement[]).map(getEffectiveTask);
    
    // Eliminar duplicados por ID
    const uniqueInPackage = inPackage.reduce((acc, element) => {
      if (!acc.find(existing => existing.id === element.id)) {
        acc.push(element);
      }
      return acc;
    }, [] as TaskElement[]);
    
    console.log(`orderedHierarchical: ${inPackage.length} elementos procesados, ${uniqueInPackage.length} únicos`);
    const childrenMap = new Map<string, TaskElement[]>();
    uniqueInPackage.forEach((t) => { if (t.parentId) { const arr = childrenMap.get(t.parentId) ?? []; arr.push(t); childrenMap.set(t.parentId, arr); } });
    const roots = uniqueInPackage.filter((t) => !t.parentId);
    const sortFn = (a: TaskElement, b: TaskElement) => { 
      // Primero: Ordenar por tipo de tarea para respetar jerarquía
      const typeOrder: Record<string, number> = {
        'GROUP': 0,
        'SUBGROUP': 1,
        'SIMPLE_TASK': 2,
        'MILESTONE': 2,
      };
      
      const aTypeOrder = typeOrder[a.type] ?? 3;
      const bTypeOrder = typeOrder[b.type] ?? 3;
      
      if (aTypeOrder !== bTypeOrder) return aTypeOrder - bTypeOrder;
      
      // Segundo: Si son del mismo tipo, ordenar por sortOrder
      const ao = a.sortOrder ?? 999999; 
      const bo = b.sortOrder ?? 999999; 
      if (ao !== bo) return ao - bo;
      
      // Tercero: Si el sortOrder es igual, ordenar por fecha de actualización
      const getEffectiveDate = (element: TaskElement): number => {
        const updatedAt = element.updatedAt;
        const createdAt = element.createdAt;
        
        const dateToUse = updatedAt || createdAt;
        if (!dateToUse) return Date.now();
        
        const date = new Date(dateToUse);
        const timestamp = isNaN(date.getTime()) ? Date.now() : date.getTime();
        
        return timestamp;
      };
      
      const aTime = getEffectiveDate(a);
      const bTime = getEffectiveDate(b);
      
      // Ordenar por fecha ascendente (más antiguo primero) para que los nuevos aparezcan al final
      if (aTime !== bTime) return aTime - bTime;
      
      // Finalmente: Ordenar por nombre
      return a.name.localeCompare(b.name); 
    };
    roots.sort(sortFn); childrenMap.forEach((arr) => arr.sort(sortFn));
    const result: { task: TaskElement; depth: number }[] = [];
    
    // Calcular depth basado en la jerarquía real parent-child
    const getDepthByHierarchy = (task: TaskElement, currentDepth: number = 0): number => {
      return currentDepth;
    };
    
    const walk = (node: TaskElement, depth: number = 0) => { 
      result.push({ task: getEffectiveTask(node), depth: depth }); 
      const kids = childrenMap.get(node.id) ?? []; 
      for (const k of kids) {
        // Calcular depth basado en el tipo de elemento
        let childDepth = depth + 1;
        
        // Si el padre es un grupo y el hijo es una tarea (no subgrupo), 
        // la tarea debe tener depth = 2 para estar al nivel de las tareas
        if (node.type === 'GROUP' && (k.type === 'SIMPLE_TASK' || k.type === 'MILESTONE')) {
          childDepth = 2;
        }
        // Si el padre es un subgrupo, los hijos mantienen depth + 1
        else if (node.type === 'SUBGROUP') {
          childDepth = depth + 1;
        }
        
        walk(k, childDepth); 
      }
    };
    for (const r of roots) walk(r);
    return result;
  }, [selectedPackage, taskElements, tempGroups, tempSubgroups, getEffectiveTask]);

  const ganttTasks: GanttTask[] = useMemo(() => {
    if (!selectedPackage) return [];
    const parseDate = (d?: string | Date): Date | undefined => (d ? new Date(d) : undefined);
    const safeDate = (d?: string | Date): Date => { const parsed = parseDate(d) ?? new Date(); return isNaN(parsed.getTime()) ? new Date() : parsed; };
    const toGanttType = (t: TaskElement['type']): GanttTask['type'] => { switch (t) { case 'MILESTONE': return 'milestone'; case 'GROUP': case 'SUBGROUP': return 'task'; default: return 'task'; } };
    const byId = new Map(orderedHierarchical.map(({ task }) => [task.id, task] as const));
    const statusColors: Record<string, { bg: string; progress: string; selected: string }> = {
      not_started: { bg: '#E5E7EB', progress: '#9CA3AF', selected: '#D1D5DB' },
      in_progress: { bg: '#BFDBFE', progress: '#2563EB', selected: '#93C5FD' },
      paused: { bg: '#FDE68A', progress: '#D97706', selected: '#FCD34D' },
      completed: { bg: '#BBF7D0', progress: '#22C55E', selected: '#86EFAC' },
      overdue: { bg: '#FECACA', progress: '#EF4444', selected: '#FCA5A5' },
      cancelled: { bg: '#E5E7EB', progress: '#9CA3AF', selected: '#D1D5DB' },
    };

    const mapped = orderedHierarchical.map(({ task }) => {
      const type = toGanttType(task.type);
      const start = safeDate(task.plannedStartDate);
      let end = type === 'milestone' ? start : safeDate(task.plannedEndDate);
      if (end.getTime() <= start.getTime()) end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      const parent = task.parentId ? byId.get(task.parentId) : undefined;
      const colors = statusColors[(task.status as unknown as string) ?? 'not_started'] ?? statusColors.not_started;
      // Preferimos predecessorDependencies; si no viene, derivamos desde 'dependencies' (entrantes al task)
      const predecessorList: any[] = Array.isArray((task as any).predecessorDependencies)
        ? (task as any).predecessorDependencies
        : Array.isArray((task as any).dependencies)
          ? (task as any).dependencies.filter((d: any) => d?.successorId === (task as any).id)
          : [];
      const dependencies: string[] = predecessorList
        .map((d: any) => d?.predecessorId || d?.predecessor?.id)
        .filter((id: any) => typeof id === 'string');
      const temp = tempDependencies[task.id] || [];
      const allDeps = Array.from(new Set([...
        dependencies,
        ...temp,
      ]));
      const isSelectedForLink = selectedForLink === task.id;
      const row: GanttTask = {
        id: String(task.id),
        name: task.name || 'Tarea',
        start,
        end,
        type,
        progress: Math.max(0, Math.min(100, task.progressPercentage ?? 0)),
        project: parent && (parent.type === 'GROUP' || parent.type === 'SUBGROUP') ? String(parent.id) : undefined,
        hideChildren: type === 'project' ? false : undefined,
        dependencies: showDependencies ? (allDeps as any) : ([] as any),
        styles: {
          backgroundColor: colors.bg,
          backgroundSelectedColor: colors.selected,
          progressColor: colors.progress,
          progressSelectedColor: colors.progress,
          stroke: 'rgba(0,0,0,0.08)',
          strokeWidth: 1,
          backgroundTextColor: '#111827',
          strokeSelectedColor: isSelectedForLink ? '#2563EB' : 'rgba(0,0,0,0.12)'
        } as any,
      } as any;
      return row;
    });
    return mapped.filter((t) => t && t.start instanceof Date && t.end instanceof Date && !isNaN(t.start.getTime()) && !isNaN(t.end.getTime()));
  }, [selectedPackage, orderedHierarchical, showDependencies, tempDependencies, selectedForLink, ganttRefreshCounter]);

  const parentCandidates = useMemo(() => {
    if (!selectedPackage) return [] as { id: string; name: string }[];
    return taskElements
      .filter((t) => t.tasksPackageId === selectedPackage.id && (t.type === TaskElementType.GROUP || t.type === TaskElementType.SUBGROUP))
      .map((t) => ({ id: t.id, name: t.name }));
  }, [selectedPackage, taskElements]);

  const groupSidebar = useGroupSidebar();

  // Evitar abrir sidebar cuando viene de un drag (onDateChange)
  const ganttClickSuppressRef = useRef(false);
  const markSuppressGanttClick = useCallback(() => {
    ganttClickSuppressRef.current = true;
    setTimeout(() => { ganttClickSuppressRef.current = false; }, 250);
  }, []);

  // Asegurar que cualquier onDateChange marque la supresión (drag end)
  useEffect(() => {
    // no-op, el marker se usa dentro de handleGanttDateChange
  }, [markSuppressGanttClick]);

  // Sobrescribir handleGanttDateChange para marcar supresión al inicio
  const _prevHandleGanttDateChange = handleGanttDateChange;
  const handleGanttDateChangeGuarded = useCallback(async (id: string, s?: string, e?: string) => {
    markSuppressGanttClick();
    await _prevHandleGanttDateChange(id, s, e);
  }, [_prevHandleGanttDateChange, markSuppressGanttClick]);

  const handleGanttBarClick = useCallback((id: string, forceOpen: boolean = false) => {
    if (!id) return;
    if (forceOpen) {
      setSelectedForLink(null);
      groupSidebar.openGroupSidebar(id);
      return;
    }
    if (ganttClickSuppressRef.current) return;
    if (selectedForLink) return; // en modo link, solo costados o doble click (force)
    groupSidebar.openGroupSidebar(id);
  }, [groupSidebar.openGroupSidebar, selectedForLink]);

  const assigneesCountByTaskId = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of taskElements as any[]) {
      const id = (t as any)?.id as string | undefined;
      if (!id) continue;
      const count = Array.isArray((t as any)?.assignees) ? (t as any).assignees.length : 0;
      if (count > 0) map[id] = count;
    }
    for (const id of Object.keys(myAssigneesByTaskId || {})) {
      map[id] = Math.max(map[id] ?? 0, 1);
    }
    return map;
  }, [taskElements, myAssigneesByTaskId]);

  return {
    user,
    // data
    taskPackages, taskElements, loading, error,
    // refresh
    isRefetching, silentRefetch,
    // views
    viewMode, setViewMode, tasksTab, setTasksTab, currentView, setCurrentView, selectedPackage,
    ganttColumnWidth,
    showTasksForPackage, showPackages,
    // dependencies & link mode (frontend only)
    showDependencies, toggleShowDependencies, linkMode, toggleLinkMode, handleLinkOnSelect,
    // package modals
    isPackageModalOpen, setIsPackageModalOpen, packageModalMode, setPackageModalMode, selectedPackageForEdit,
    openCreatePackageModal, openEditPackageModal, openDeletePackageModal, isDeletePackageModalOpen, setIsDeletePackageModalOpen, selectedPackageForDelete,
    handlePackageFormSubmit, handlePackageDeleteConfirm,
    // task modals
    isTaskModalOpen, setIsTaskModalOpen, taskModalMode, setTaskModalMode, selectedTask,
    openCreateTaskModal, openEditTaskModal, openDeleteTaskModal, handleTaskFormSubmit, handleDeleteConfirm,
    // quick create
    quickName, setQuickName, isCreatingQuick, handleQuickCreate,
    // inline update
    handleInlineUpdate, getEffectiveTask, handleGanttDateChange: handleGanttDateChangeGuarded,
    handleGanttBarClick,
    isLinking: Boolean(selectedForLink),
    // assignees
    myAssigneesByTaskId, assigneesCountByTaskId, handleAssignMe, handleUnassignMe,
    isAssigneesModalOpen, setIsAssigneesModalOpen, assigneesModalTaskId, assigneesModalLoading, assigneesModalList,
    openAssigneesModal, closeAssigneesModal,
    // dependencies modal
    isDependenciesModalOpen, dependenciesModalLoading, dependenciesModalPredecessors, dependenciesModalSuccessors,
    openDependenciesModal, closeDependenciesModal,
    dependenciesModalTaskId, dependenciesCandidates,
    addPredecessorFromModal, addSuccessorFromModal,
    dependenciesPopupPosition,
    // add dependency popup
    isAddDependencyPopupOpen, addDependencyType, addDependencyPopupPosition,
    openAddPredecessorPopup, openAddSuccessorPopup, closeAddDependencyPopup,
    // mappings
    groupTree, paginatedGroupTree, expandedGroups, toggleGroupExpand, orderedHierarchical, ganttTasks, parentCandidates,
    // pagination
    currentPage, setCurrentPage, rowsPerPage, setRowsPerPage, totalTasks,
    // quick creators
    createGroup, createSubgroup, createMilestone, createTask, createTaskQuick, confirmTempGroup, confirmTempSubgroup,
    // element management
    deleteElement,
    deleteElementDirect, // Función de debug temporal
    deleteElementWithRetry, // Función con múltiples estrategias
    forceRefreshData, // Función para forzar recarga
    // drag and drop
    handleTaskReorder,
    // group sidebar
    ...groupSidebar,
  };
}


