"use client";

import { useRef } from 'react';
import { useAppStore } from '@/store/appStore';

interface StoreInitializerProps {
  projectName: string;
}

/**
 * Este componente no renderiza nada. Su única función es sincronizar
 * el estado del servidor con el store de cliente (Zustand) una sola vez.
 */
function StoreInitializer({ projectName }: StoreInitializerProps) {
  // Usamos useRef para asegurarnos de que el store solo se actualice una vez por carga.
  const initialized = useRef(false);

  if (!initialized.current) {
    // Llamamos a la acción de nuestro store de Zustand para establecer el nombre del proyecto.
    useAppStore.getState().setProjectName(projectName);
    initialized.current = true;
  }

  // No renderiza ningún elemento visual.
  return null;
}

export default StoreInitializer;