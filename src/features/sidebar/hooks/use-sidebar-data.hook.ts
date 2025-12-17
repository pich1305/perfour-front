// src/features/sidebar/hooks/use-sidebar-data.hook.ts
"use client";

import { useState, useEffect } from "react";
import { ProjectData } from "../../../lib/types";
import { Budget } from "../../../lib/types";
import { ProjectStatus } from "../../../lib/types";
import { BudgetTypeEnum } from "../../../lib/types";
import { BudgetStatusEnum } from "../../../lib/types";

// --- DATOS SIMULADOS (MOCK DATA) ---
const MOCK_PROJECTS: ProjectData[] = [
  { id: '1', name: 'Proyecto Casa Javier', 
    description: 'Descripción del proyecto',
    userId: 1,
    status: ProjectStatus.PROPOSAL,
    createdAt: new Date('2021-01-01'),
    workspaceId: 1
   },
  { id: '2', name: 'Edificio Corporativo Central', 
    description: 'Descripción del proyecto',
    userId: 1,
    status: ProjectStatus.PROPOSAL,
    createdAt: new Date('2021-01-01'),
    workspaceId: 1
   },
  { id: '3', name: 'Remodelación Oficina Principal', 
    description: 'Descripción del proyecto',
    userId: 1,
    status: ProjectStatus.PROPOSAL,
    createdAt: new Date('2021-01-01'),
    workspaceId: 1
   },
];

const MOCK_BUDGETS: Budget[] = [
  { id: 'b1', name: 'Presupuesto Inicial 2025', 
    description: 'Descripción del presupuesto',
    budgetType: BudgetTypeEnum.CLIENT,
    currency: 'PYG',
    versionNumber: 1,
    totalBudgetAmount: 1000000,
    status: BudgetStatusEnum.DRAFT,
    projectId: '1',
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    createdById: '1',
   },
  { id: 'b2', name: 'Gastos de Construcción', 
    description: 'Descripción del presupuesto',
    budgetType: BudgetTypeEnum.CLIENT,
    currency: 'PYG',
    versionNumber: 1,
    totalBudgetAmount: 1000000,
    status: BudgetStatusEnum.DRAFT,
    projectId: '1',
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    createdById: '1',
   },
  { id: 'b3', name: 'Acabados y Decoración', 
    description: 'Descripción del presupuesto',
    budgetType: BudgetTypeEnum.CLIENT,
    currency: 'PYG',
    versionNumber: 1,
    totalBudgetAmount: 1000000,
    status: BudgetStatusEnum.DRAFT,
    projectId: '1',
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    createdById: '1',
   },
];
// -------------------------------------

export function useSidebarData() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);

  useEffect(() => {
    // Simulamos una llamada a la API con un retraso de 1 segundo
    const timer = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoadingProjects(false);

      setBudgets(MOCK_BUDGETS);
      setIsLoadingBudgets(false);
    }, 1000); // 1000ms = 1 segundo de carga falsa

    // Función de limpieza para evitar problemas de memoria
    return () => clearTimeout(timer);
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez

  return { 
    projects, 
    isLoadingProjects,
    budgets,
    isLoadingBudgets
  };
}
// // src/features/sidebar/hooks/use-sidebar-data.hook.ts
// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { BudgetApiClient } from "@/lib/api/budget.api"; // Asumiendo nueva ubicación
// import { ProjectApiClient } from "@/lib/api/project.api";
// import { Budget } from "../../../../src_old/types/project";
// import { useAuth } from "@/features/auth/hooks/use-auth.hook";
// import { Project } from "../../../../src_old/components/projects/Projects";


// export function useSidebarData() {
//   const { user, isLoading: isAuthLoading } = useAuth();
  
//   // Estado para Proyectos
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [isLoadingProjects, setIsLoadingProjects] = useState(true);

//   // Estado para Presupuestos
//   const [budgets, setBudgets] = useState<Budget[]>([]);
//   const [isLoadingBudgets, setIsLoadingBudgets] = useState(true);

//   // Lógica de fetch para proyectos (antes en ProjectContext)
//   const fetchProjects = useCallback(async (userId: string) => {
//     setIsLoadingProjects(true);
//     try {
//       const response = await ProjectApiClient.fetchProjects(); // Asumiendo que existe este método
//       setProjects( []);
//     } catch (error) {
//       console.error("Error fetching projects for sidebar:", error);
//       setProjects([]);
//     } finally {
//       setIsLoadingProjects(false);
//     }
//   }, []);

//   // Lógica de fetch para presupuestos (antes en Sidebar)
//   const fetchBudgets = useCallback(async () => {
//     setIsLoadingBudgets(true);
//     try {
//       const res = await BudgetApiClient.getAllBudgets();
//       setBudgets(res.data || res || []);
//     } catch (e) {
//       console.error("Error fetching budgets for sidebar:", e);
//       setBudgets([]);
//     } finally {
//       setIsLoadingBudgets(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!isAuthLoading && user?.id) {
//       fetchProjects(user.id);
//       fetchBudgets();
//     } else if (!isAuthLoading && !user) {
//       // Si no hay usuario, vaciamos los datos y terminamos de cargar
//       setProjects([]);
//       setBudgets([]);
//       setIsLoadingProjects(false);
//       setIsLoadingBudgets(false);
//     }
//   }, [user, isAuthLoading, fetchProjects, fetchBudgets]);

//   return { 
//     projects, 
//     isLoadingProjects,
//     budgets,
//     isLoadingBudgets
//   };
// }