// src/hooks/useGroupSidebar.ts
import { useCallback, useState } from 'react';
import { VettelApiClient } from '@/lib/api/VettelApiClient';
import type { TaskElement } from '@/types/index';

export function useGroupSidebar() {
  const [isGroupSidebarOpen, setIsGroupSidebarOpen] = useState(false);
  const [groupSidebarData, setGroupSidebarData] = useState<TaskElement | null>(null);

  const openGroupSidebar = useCallback(async (groupId: string) => {
    try {
      const data = await VettelApiClient.getTaskElementById(groupId);
      setGroupSidebarData(data);
      setIsGroupSidebarOpen(true);
    } catch (e) {
      console.error('No se pudo cargar el detalle del grupo', e);
    }
  }, []);

  const closeGroupSidebar = useCallback(() => {
    setIsGroupSidebarOpen(false);
    setGroupSidebarData(null);
  }, []);

  return { isGroupSidebarOpen, groupSidebarData, openGroupSidebar, closeGroupSidebar };
}


