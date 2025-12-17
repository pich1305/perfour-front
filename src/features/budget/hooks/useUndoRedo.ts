import { useState, useCallback, useEffect } from 'react';

export const useUndoRedo = <T>(initialState: T) => {
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  // Función para guardar estado para undo/redo
  const saveStateForUndo = useCallback((currentState: T) => {
    setUndoStack(prev => [...prev, JSON.stringify(currentState)]);
    setRedoStack([]); // Limpiar redo cuando se hace una nueva acción
  }, []);

  // Función para deshacer
  const undo = useCallback((currentState: T, setState: (state: T) => void) => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, JSON.stringify(currentState)]);
      setState(JSON.parse(previousState));
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [undoStack]);

  // Función para rehacer
  const redo = useCallback((currentState: T, setState: (state: T) => void) => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, JSON.stringify(currentState)]);
      setState(JSON.parse(nextState));
      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [redoStack]);

  // Efecto para manejar atajos de teclado globales
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z - Deshacer
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Esta función se llamará desde el componente padre
      }
      // Ctrl+Y o Ctrl+Shift+Z - Rehacer
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        // Esta función se llamará desde el componente padre
      }
      // Ctrl+S - Guardar (simulado)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('Guardando cambios...');
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return {
    undoStack,
    redoStack,
    saveStateForUndo,
    undo,
    redo
  };
}; 