import { BudgetElement, ElementLevelEnum } from '@/lib/api/budgetElement.api';

/**
 * Calcula el costo total de un elemento. Si el elemento es una categoría
 * o subcategoría con hijos, suma recursivamente el total de sus hijos.
 * Si es un item, calcula cantidad * precio unitario (o usa el total_amount si ya existe).
 * * @param element - El elemento a calcular.
 * @param allElements - Opcional: El array completo de elementos, por si los hijos no están anidados.
 * @returns El costo total calculado.
 */
export function calculateTotal(element: BudgetElement, allElements?: BudgetElement[]): number {
  let total = 0;

  // Lógica de cálculo recursivo (si los hijos están anidados en la propiedad element.children)
  if (element.children && element.children.length > 0) {
    total = element.children.reduce((sum, child) => sum + calculateTotal(child), 0);
  } else if (element.elementLevel !== ElementLevelEnum.ITEM) {
      // Si es categoría/subcategoría pero los hijos no están anidados, buscarlos en allElements
      if (allElements) {
          total = allElements
              .filter(child => child.parentId === element.id)
              .reduce((sum, child) => sum + calculateTotal(child, allElements), 0);
      }
  } else {
    // Es un item: calcular PxQ. Usar total_amount como fallback si PxQ no está disponible.
    const quantity = element.quantity || 0;
    const unitPrice = element.unitPrice || 0;
    total = quantity * unitPrice > 0 ? quantity * unitPrice : (element.totalAmount || 0);
  }
  
  return total;
}

/**
 * Formatea un valor numérico a un string de moneda según la divisa (PYG o USD/otros).
 * @param amount - El valor numérico a formatear.
 * @param currencyCode - El código de moneda (ej. "PYG", "USD").
 * @returns El string formateado.
 */
export function formatCurrency(amount: number | string | null | undefined, currencyCode: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount as number) || numericAmount === null || numericAmount === undefined) {
    return '-';
  }

  const locale = currencyCode === 'PYG' ? 'es-PY' : 'en-US';
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'PYG' ? 0 : 2,
    maximumFractionDigits: currencyCode === 'PYG' ? 0 : 2,
  };

  try {
    return new Intl.NumberFormat(locale, options).format(numericAmount as number);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return `${currencyCode} ${numericAmount}`;
  }
}

/**
 * Genera el número de índice jerárquico (ej. "1.2.3").
 * @param categoryIndex - Índice base 0 de la categoría.
 * @param subcategoryIndex - Índice base 0 de la subcategoría.
 * @param itemIndex - Índice base 0 del ítem.
 * @returns String formateado del índice jerárquico.
 */
export const generateHierarchicalNumber = (categoryIndex: number, subcategoryIndex?: number, itemIndex?: number): string => {
  if (itemIndex !== undefined && subcategoryIndex !== undefined) {
    return `${categoryIndex + 1}.${subcategoryIndex + 1}.${itemIndex + 1}`;
  } else if (subcategoryIndex !== undefined) {
    return `${categoryIndex + 1}.${subcategoryIndex + 1}`;
  } else {
    return `${categoryIndex + 1}`;
  }
};

/**
 * Devuelve una clase de color de fondo de Tailwind basada en el tipo de elemento.
 * @param type - El tipo de elemento (PRODUCTO, SERVICIO, etc.).
 * @returns Clase de Tailwind CSS.
 */
export const getCategoryBackgroundColor = (type: string | undefined): string => {
  switch (type?.toUpperCase()) {
    case 'PRODUCT':
      return 'bg-blue-100';
    case 'SERVICE':
    case 'SERVICES':
      return 'bg-purple-100';
    case 'HONORARIES':
      return 'bg-indigo-100';
    case 'TAXES':
      return 'bg-red-100';
    case 'UNEXPECTED':
      return 'bg-orange-100';
    default:
      return 'bg-gray-100';
  }
};