import { useState, useEffect, useMemo } from 'react';
import { BudgetApiClient } from '@/lib/api/budget.api';
import { budgetElementApiClient, BudgetElement, ElementLevelEnum } from '@/lib/api/budgetElement.api';
import { toast } from 'react-hot-toast';

export const useBudgetData = (isOpen: boolean, budgetId: string) => {
  const [elements, setElements] = useState<BudgetElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetInfo, setBudgetInfo] = useState<any>(null);

  // Memoizamos los elementos filtrados para evitar recálculos innecesarios
  const { categorias, subcategorias, items } = useMemo(() => {
    const allElements = elements;
    
    const allCategorias = allElements.filter(el => el.elementLevel === ElementLevelEnum.CATEGORY);
    const allSubcategorias = allElements.filter(el => el.elementLevel === ElementLevelEnum.SUBCATEGORY);
    const allItems = allElements.filter(el => el.elementLevel === ElementLevelEnum.ITEM);

    return {
      categorias: allCategorias,
      subcategorias: allSubcategorias,
      items: allItems
    };
  }, [elements]);

  // Función para calcular el total de un elemento y sus hijos
  const calculateTotal = (element: BudgetElement): number => {
    let total = 0;
    
    if (element.children && element.children.length > 0) {
      total = element.children.reduce((sum, child) => sum + calculateTotal(child), 0);
    } else {
      total = typeof element.totalAmount === 'string' ? 
        parseFloat(element.totalAmount) : 
        (element.totalAmount || 0);
    }
    
    return total;
  };

  // Memoizamos el total para evitar recálculos innecesarios
  const total = useMemo(() => {
    return elements
      .filter(el => el.elementLevel === ElementLevelEnum.CATEGORY)
      .reduce((sum, categoria) => sum + calculateTotal(categoria), 0);
  }, [elements]);

  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount) || numericAmount === null || numericAmount === undefined) {
      return '-';
    }

    let options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: budgetInfo?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    };

    if (budgetInfo?.currency === 'PYG') {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 0;
    } else if (budgetInfo?.currency === 'USD') {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
    }

    let locale = 'es-PY';
    if (budgetInfo?.currency === 'USD') {
      locale = 'en-US';
    }

    try {
      return new Intl.NumberFormat(locale, options).format(numericAmount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${budgetInfo?.currency || 'USD'} ${numericAmount.toLocaleString()}`;
    }
  };

  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!isOpen || !budgetId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const budgetResponse = await BudgetApiClient.getBudgetById(budgetId);
        // console.log('=== Debug Estructura del Presupuesto ===');
        // console.log('Budget ID:', budgetId);
        // console.log('Budget Response:', budgetResponse);
        // console.log('Currency:', budgetResponse?.currency);
        
        if (budgetResponse) {
          setBudgetInfo(budgetResponse);
        } else {
          // console.error('La respuesta del presupuesto no tiene el formato esperado:', budgetResponse);
          toast.error('Error al cargar la información del presupuesto');
          return;
        }
        
        const elementsResponse = await budgetElementApiClient.getByBudgetId(budgetId);
        const elementos = elementsResponse.data.elements || [];
        console.log('Elementos raw:', elementos);

        elementos.forEach((el: BudgetElement) => {
          // console.log(`\nElemento: ${el.name}`);
          // console.log('- ID:', el.id);
          // console.log('- Nivel:', el.elementLevel);
          // console.log('- Parent ID:', el.parentId);
          // console.log('- Budget ID:', el.budgetId);
          // console.log('- Tipo:', el.type);
        });

        const categorias = elementos.filter((el: BudgetElement) => el.elementLevel === ElementLevelEnum.CATEGORY);
        const subcategorias = elementos.filter((el: BudgetElement) => el.elementLevel === ElementLevelEnum.SUBCATEGORY);
        const items = elementos.filter((el: BudgetElement) => el.elementLevel === ElementLevelEnum.ITEM);
        
        // console.log('\n=== Resumen de Elementos ===');
        // console.log('Total elementos:', elementos.length);
        // console.log('Categorías:', categorias.length);
        // console.log('Subcategorías:', subcategorias.length);
        // console.log('Items:', items.length);

        // console.log('\n=== Verificación de Relaciones ===');
        subcategorias.forEach((sub: BudgetElement) => {
          const parentCat = categorias.find((cat: BudgetElement) => cat.id === sub.parentId);
          // console.log(`Subcategoría "${sub.name}" (${sub.id}) -> Categoría padre: ${parentCat ? parentCat.name : 'NO ENCONTRADA'}`);
        });

        setElements(elementos);
        
      } catch (error) {
        // console.error('Error fetching budget data:', error);
        toast.error('Error al cargar los datos del presupuesto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, [isOpen, budgetId]);

  const refreshElements = async () => {
    try {
      const elementsResponse = await budgetElementApiClient.getByBudgetId(budgetId);
      setElements(elementsResponse.data.elements);
    } catch (error) {
      console.error('Error refreshing elements:', error);
      toast.error('Error al actualizar los elementos');
    }
  };

  // Nueva función para refrescar la info del presupuesto
  const refreshBudgetInfo = async () => {
    try {
      const budgetResponse = await BudgetApiClient.getBudgetById(budgetId);
      if (budgetResponse) {
        setBudgetInfo(budgetResponse);
      }
    } catch (error) {
      console.error('Error refreshing budget info:', error);
      toast.error('Error al actualizar la información del presupuesto');
    }
  };

  return {
    elements,
    setElements,
    isLoading,
    budgetInfo,
    categorias,
    subcategorias,
    items,
    total,
    formatCurrency,
    calculateTotal,
    refreshElements,
    refreshBudgetInfo
  };
}; 