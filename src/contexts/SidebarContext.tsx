"use client";

import { useState, ReactNode, createContext, useContext } from "react";

// 1. Definimos el tipo para el contexto
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

// 2. Creamos el Context
const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 3. Creamos el Provider, que manejará el estado
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// 4. Creamos el hook personalizado para consumir el contexto
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};