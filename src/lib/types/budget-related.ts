// lib/types/budget.ts

export interface BudgetElementRelated {
    id: string;
    parentId: string | null;
    name: string;
    elementLevel: 'CATEGORY' | 'SUBCATEGORY' | 'ITEM';
    type: 'PRODUCT' | 'SERVICE';
  }
  
  export interface BudgetRelated {
    id: string;
    name: string;
    updatedAt: string;
    elements: BudgetElementRelated[];
    elementsCount: number;
  }
  
  export interface BudgetRelatedResponse {
    items: BudgetRelated[];
    itemCount: number;
    page: number;
    take: number;
  }
  
  // Para construir el árbol
  export interface BudgetElementRelatedNode extends BudgetElementRelated {
    children: BudgetElementRelatedNode[];
  }