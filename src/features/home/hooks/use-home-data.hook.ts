"use client";

import { useState, useEffect } from "react";

// Simulamos la estructura de un proyecto como la veríamos en el card
export interface RecentProject {
  id: string;
  name: string;
  status: 'in progress' | 'paused';
  members: number;
  tasks: number;
  rfi: number;
  lastUpdated: string;
}

// --- DATOS SIMULADOS (MOCK DATA) ---
const MOCK_RECENT_PROJECTS: RecentProject[] = [
  {
    id: '1',
    name: 'Casa Javier',
    status: 'in progress',
    members: 23,
    tasks: 123,
    rfi: 123,
    lastUpdated: '3 hours ago',
  },
  {
    id: '2',
    name: 'Museo de ciencias',
    status: 'paused',
    members: 23,
    tasks: 123,
    rfi: 123,
    lastUpdated: '3 hours ago',
  },
];
// -------------------------------------

export function useHomeData() {
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos la carga de datos
    const timer = setTimeout(() => {
      setRecentProjects(MOCK_RECENT_PROJECTS);
      setIsLoading(false);
    }, 500); // 0.5 segundos de carga

    return () => clearTimeout(timer);
  }, []);

  return { recentProjects, isLoading };
}