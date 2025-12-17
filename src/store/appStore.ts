import { create } from 'zustand';

export type ProjectTab = 'overview' | 'budgets' | 'tasks' | 'members';

// El nombre de la interfaz ahora es más genérico
interface AppState {
  budgetName: string;
  setBudgetName: (name: string) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  activeTab: ProjectTab;
  setActiveTab: (tab: ProjectTab) => void;
}

// El nombre del hook ahora es más genérico
export const useAppStore = create<AppState>((set) => ({
  budgetName: '',
  setBudgetName: (name) => set({ budgetName: name }),
  projectName: '',
  setProjectName: (name) => set({ projectName: name }),
  activeTab: 'overview', // La pestaña por defecto sigue siendo 'overview'
  setActiveTab: (tab) => set({ activeTab: tab }),
}));