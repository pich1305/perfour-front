import { useState, useEffect, useCallback } from 'react';
import { VettelApiClient } from '@/lib/api/VettelApiClient';
import { TaskElement, TaskPackage } from '@/types/index';

export function useProjectTasks(projectId: string) {
  const [taskPackages, setTaskPackages] = useState<TaskPackage[]>([]);
  const [taskElements, setTaskElements] = useState<TaskElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const packagesResponse = await VettelApiClient.getTaskPackagesByProject(projectId);

      const safePackages: TaskPackage[] = Array.isArray(packagesResponse)
        ? packagesResponse
        : [];

      setTaskPackages(safePackages);

      // Estrategia alternativa: Cargar todos los elementos de manera más directa
      console.log('Cargando elementos con estrategia alternativa...');
      
      const elementsArrays = await Promise.all(
        safePackages.map(async (pkg) => {
          try {
            console.log(`Cargando elementos para package: ${pkg.name} (${pkg.id})`);
            const elements = await VettelApiClient.getTaskElementsByPackage(pkg.id);
            const safeElements = Array.isArray(elements) ? elements.filter(el => !el.isArchived) : [];
            
            console.log(`Elementos raíz obtenidos para ${pkg.name}:`, safeElements.map(e => ({ id: e.id, name: e.name, type: e.type })));
            
            // Función recursiva para obtener todos los elementos hijos (sin duplicar elementos raíz)
            const getAllElementsRecursively = async (elementList: TaskElement[]): Promise<TaskElement[]> => {
              const allElements: TaskElement[] = [];
              const processedIds = new Set<string>();
              
              const processElement = async (element: TaskElement) => {
                // Evitar procesar el mismo elemento dos veces
                if (processedIds.has(element.id)) {
                  console.log(`Elemento ${element.name} (${element.id}) ya fue procesado, saltando...`);
                  return;
                }
                
                processedIds.add(element.id);
                allElements.push(element);
                
                // Si el elemento tiene hijos, procesarlos recursivamente
                if ((element as any).children && Array.isArray((element as any).children)) {
                  console.log(`Elemento ${element.name} tiene ${(element as any).children.length} hijos`);
                  for (const child of (element as any).children) {
                    await processElement(child);
                  }
                }
              };
              
              // Procesar todos los elementos de la lista
              for (const element of elementList) {
                await processElement(element);
              }
              
              return allElements;
            };
            
            // Obtener todos los elementos incluyendo hijos
            const allElements = await getAllElementsRecursively(safeElements);
            console.log(`Package ${pkg.name}: ${safeElements.length} elementos raíz, ${allElements.length} elementos totales`);
            
            // Debug: Mostrar tipos de elementos cargados
            const elementTypes = allElements.reduce((acc, el) => {
              acc[el.type] = (acc[el.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            console.log(`Tipos de elementos en ${pkg.name}:`, elementTypes);
            
            return allElements;
          } catch (e) {
            console.error('Error al cargar elementos para package', pkg.id, e);
            return [] as TaskElement[];
          }
        })
      );

      const allElements = elementsArrays.flat();
      console.log(`Total elementos cargados antes de deduplicar: ${allElements.length}`);
      
      // Eliminar duplicados basándose en el ID
      const uniqueElements = allElements.reduce((acc, element) => {
        if (!acc.find(el => el.id === element.id)) {
          acc.push(element);
        }
        return acc;
      }, [] as TaskElement[]);
      
      console.log(`Total elementos únicos después de deduplicar: ${uniqueElements.length}`);
      
      // Debug: Mostrar distribución de tipos
      const totalElementTypes = uniqueElements.reduce((acc, el) => {
        acc[el.type] = (acc[el.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Distribución total de tipos:', totalElementTypes);
      
      setTaskElements(uniqueElements);
    } catch (err) {
      setError('Error al cargar las tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, fetchTasks]);

  // Helper recursivo para actualizar tareas anidadas
  const updateTaskRecursively = (task: TaskElement, taskId: string, updates: Partial<TaskElement>): TaskElement => {
    // Si encontramos la tarea, actualizarla
    if (task.id === taskId) {
      return { ...task, ...updates };
    }
    
    // Si tiene hijos, buscar recursivamente
    if (Array.isArray((task as any).children) && (task as any).children.length > 0) {
      return {
        ...task,
        children: (task as any).children.map((child: TaskElement) => 
          updateTaskRecursively(child, taskId, updates)
        )
      } as TaskElement;
    }
    
    // No es la tarea que buscamos y no tiene hijos, devolver sin cambios
    return task;
  };

  return {
    taskPackages,
    taskElements, 
    loading,
    error,
    refetch: fetchTasks,
    updatePackageInState: (updated: TaskPackage) => {
      setTaskPackages(prev => prev.map(p => (p.id === updated.id ? { ...p, ...updated } : p)));
    },
    updateTaskElementInState: (taskId: string, updates: Partial<TaskElement>) => {
      setTaskElements(prev => prev.map(task => updateTaskRecursively(task, taskId, updates)));
    }
  };
}