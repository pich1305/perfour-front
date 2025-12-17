import { useCallback } from 'react';
import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { TaskElement } from '@/types';

interface UseTaskDragAndDropProps {
  tasks: TaskElement[];
  onReorder: (taskId: string, newParentId: string | undefined | null, newIndex: number, allTasks?: TaskElement[]) => Promise<void>;
}

export function useTaskDragAndDrop({ tasks, onReorder }: UseTaskDragAndDropProps) {
  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Puedes agregar feedback visual aquí si quieres
    console.log('Drag started:', event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Puedes manejar el hover sobre zonas válidas aquí
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    console.log('IDs del drag:', { activeId: active.id, overId: over.id });
    console.log('IDs disponibles en tasks:', tasks.map(t => t.id));

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask) {
      console.error('Tarea activa no encontrada:', active.id);
      return;
    }
    if (!overTask) {
      console.error('Tarea destino no encontrada:', over.id);
      return;
    }

    console.log('Moviendo tarea:', {
      from: activeTask.name,
      to: overTask.name,
      activeParent: activeTask.parentId,
      overParent: overTask.parentId,
      activeType: activeTask.type,
      overType: overTask.type
    });

    // Determinar el nuevo padre
    let newParentId: string | undefined | null;
    
    // Si arrastramos sobre un grupo o subgrupo, lo hacemos hijo de ese elemento
    if (overTask.type === 'GROUP' || overTask.type === 'SUBGROUP') {
      newParentId = overTask.id;
      // Colocar al final de los hijos
      const childrenOfSameType = tasks.filter(t => 
        t.parentId === newParentId && 
        t.type === activeTask.type &&
        t.id !== activeTask.id
      );
      await onReorder(activeTask.id, newParentId, childrenOfSameType.length);
      return;
    }

    // Si arrastramos sobre una tarea del mismo nivel, usar su padre
    newParentId = overTask.parentId;

    // Obtener hermanos en el grupo de destino (sin incluir la tarea activa)
    const siblingsInTargetGroup = tasks
      .filter(t => 
        t.parentId === newParentId && 
        t.type === activeTask.type &&
        t.id !== activeTask.id
      )
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // Encontrar la posición donde insertar la tarea
    const overTaskIndex = siblingsInTargetGroup.findIndex(t => t.id === overTask.id);
    const newIndex = overTaskIndex >= 0 ? overTaskIndex : siblingsInTargetGroup.length;

    console.log('Nuevo índice calculado:', newIndex, 'Total hermanos en destino:', siblingsInTargetGroup.length);

    // Llamar a la función de reorden pasando el array completo
    await onReorder(activeTask.id, newParentId, newIndex, tasks);
  }, [tasks, onReorder]);

  return {
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}

