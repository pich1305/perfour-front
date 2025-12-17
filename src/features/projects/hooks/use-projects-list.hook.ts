"use client";

import { useState, useEffect } from "react";
import { ProjectData, ProjectStatus } from "@/lib/types"; // Asegúrate de tener este tipo definido

// --- DATOS SIMULADOS (MOCK DATA) ---
const MOCK_PROJECTS: ProjectData[] = [
  { id: '1', name: 'Proyecto Casa Javier', status: ProjectStatus.IN_PROGRESS, description: 'Descripción del proyecto', workspaceId: 1, userId: 1, createdAt: new Date() },
  { id: '2', name: 'Museo de ciencias', status: ProjectStatus.POSTPONED, description: 'Descripción del proyecto', workspaceId: 1, userId: 1, createdAt: new Date() },
  { id: '3', name: 'Edificio Corporativo Central', status: ProjectStatus.FINISHED, description: 'Descripción del proyecto', workspaceId: 1, userId: 1, createdAt: new Date() },
  { id: '4', name: 'Campaña de Marketing Q4', status: ProjectStatus.IN_PROGRESS, description: 'Descripción del proyecto', workspaceId: 1, userId: 1, createdAt: new Date() },
];
// -------------------------------------

export function useProjectsList() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
    }, 700); // 0.7 segundos de carga falsa

    return () => clearTimeout(timer);
  }, []);

  return { projects, isLoading };
}