// src/hooks/useAssigneesState.ts
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { VettelApiClient } from '@/lib/api/VettelApiClient';

export function useAssigneesState(userId?: string, taskElementIds: string[] = []) {
  const [myAssigneesByTaskId, setMyAssigneesByTaskId] = useState<Record<string, any>>({});
  const [assigneesCountByTaskId, setAssigneesCountByTaskId] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) return;
    VettelApiClient.listTaskAssigneesByUser(userId)
      .then((list) => {
        const map: Record<string, any> = {};
        for (const a of list) {
          if (a && a.taskElementId) map[a.taskElementId] = a;
        }
        setMyAssigneesByTaskId(map);
      })
      .catch((e) => console.error('Error cargando mis assignees:', e));
  }, [userId]);

  // Desactivar conteo por tarea para evitar múltiples llamadas hasta que el backend lo soporte con un endpoint optimizado
  useEffect(() => {
    setAssigneesCountByTaskId({});
  }, [taskElementIds.length]);

  const handleAssignMe = useCallback(async (taskId: string) => {
    if (!userId) return;
    try {
      const created = await VettelApiClient.createTaskAssignee({
        taskElementId: taskId,
        userId,
        role: 'RESPONSIBLE',
        createdBy: userId,
      });
      setMyAssigneesByTaskId((prev) => ({ ...prev, [taskId]: created }));
      setAssigneesCountByTaskId((prev) => ({ ...prev, [taskId]: (prev[taskId] ?? 0) + 1 }));
      toast.success('Te asignaste a la tarea');
    } catch (e: any) {
      console.error('No se pudo asignar la tarea:', e);
      const apiMessage: string | undefined = e?.response?.data?.message;
      toast.error(apiMessage || e?.message || 'No se pudo asignar la tarea');
    }
  }, [userId]);

  const handleUnassignMe = useCallback(async (taskId: string) => {
    const current = myAssigneesByTaskId[taskId];
    if (!current) return;
    await VettelApiClient.deleteTaskAssignee(current.id);
    setMyAssigneesByTaskId((prev) => { const copy = { ...prev }; delete copy[taskId]; return copy; });
    setAssigneesCountByTaskId((prev) => ({ ...prev, [taskId]: Math.max(0, (prev[taskId] ?? 0) - 1) }));
    toast.success('Te quitaste de la tarea');
  }, [myAssigneesByTaskId]);

  return { myAssigneesByTaskId, assigneesCountByTaskId, handleAssignMe, handleUnassignMe };
}


