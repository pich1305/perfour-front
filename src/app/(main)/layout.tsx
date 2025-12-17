"use client";

import { ReactNode, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import BreadcrumbWrapper from "@/components/ui/Breadcrumb/BreadcrumbWrapper";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth.hook";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
  
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  
  if (!isAuthenticated) {
    return null; // importantísimo
  }

  return (
    // CONTENEDOR MAESTRO: Ocupa toda la pantalla (h-screen) y no tiene scroll general.
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. BLOQUE SUPERIOR: NAVBAR 
          No es fixed, es un bloque flex. Ocupa su espacio real.
      */}
      <div className="w-full flex-shrink-0 bg-white border-b z-50">
        <Navbar />
      </div>

      {/* 2. BLOQUE INFERIOR: SIDEBAR + CONTENIDO 
          flex-1: Toma todo el espacio restante de la pantalla.
          flex-row: Pone el Sidebar a la izquierda y el contenido a la derecha.
      */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: EL SIDEBAR 
            p-4: Le damos padding para crear ese espacio "flotante" visualmente,
            pero estructuralmente ocupa espacio real.
        */}
        <div className="flex-shrink-0 p-1">
          <Sidebar />
        </div>

        {/* COLUMNA DERECHA: EL CONTENIDO PRINCIPAL
            flex-1: Toma todo el ancho que sobre.
            overflow-y-auto: El scroll ocurre SOLO aquí adentro.
        */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-50">
           
           {/* Breadcrumb con un poco de margen */}
           <div className="px-6 py-4 flex-shrink-0">
             <BreadcrumbWrapper />
           </div>

           {/* El children (tus páginas) */}
           <div className="px-6 pb-6 flex-1">
             {children}
           </div>
        </main>

      </div>
    </div>
  );
}