// lib/utils/budgetTreeBuilder.ts

import { BudgetElementRelated, BudgetElementRelatedNode } from '@/lib/types/budget-related';

/**
 * Construye un árbol jerárquico de elementos del presupuesto
 * basándose en parentId
 */
export function buildBudgetTree(elements: BudgetElementRelated[]): BudgetElementRelatedNode[] {
  // Crear un mapa de elementos por ID para búsqueda rápida
  const elementMap = new Map<string, BudgetElementRelatedNode>();
  
  // Inicializar todos los nodos con array de children vacío
  elements.forEach(element => {
    elementMap.set(element.id, {
      ...element,
      children: []
    });
  });

  // Array para los nodos raíz (categorías sin padre)
  const rootNodes: BudgetElementRelatedNode[] = [];

  // Construir las relaciones padre-hijo
  elements.forEach(element => {
    const node = elementMap.get(element.id)!;
    
    if (element.parentId === null) {
      // Es un nodo raíz (CATEGORY sin padre)
      rootNodes.push(node);
    } else {
      // Tiene padre, agregarlo como hijo
      const parent = elementMap.get(element.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Si no encuentra el padre, tratar como raíz (edge case)
        rootNodes.push(node);
      }
    }
  });

  return rootNodes;
}

/**
 * Ordena el árbol alfabéticamente (recursivo)
 */
export function sortBudgetTree(nodes: BudgetElementRelatedNode[]): BudgetElementRelatedNode[] {
  return nodes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(node => ({
      ...node,
      children: sortBudgetTree(node.children)
    }));
}