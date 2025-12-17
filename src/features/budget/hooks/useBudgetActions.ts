import { useState, useCallback } from 'react';
import { budgetElementApiClient, BudgetElement, ElementLevelEnum, ElementTypeEnum } from '@/lib/api/budgetElement.api';
import { toast } from 'react-hot-toast';

export const useBudgetActions = (budgetId: string, refreshElements: () => Promise<void>) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateCategoria = useCallback(async (nombre: string) => {
    try {
      const newElement: Omit<BudgetElement, 'id'> = {
        name: nombre,
        description: '',
        elementLevel: ElementLevelEnum.CATEGORY,
        type: ElementTypeEnum.PRODUCT,
        unitOfMeasure: 'unidad',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        status: 'Active',
        budgetId: budgetId
      };

      console.log('\n=== Creando Nueva Categoría ===');
      console.log('Datos de nueva categoría:', newElement);

      const response = await budgetElementApiClient.create(newElement);
      if (response) {
        console.log('Categoría creada exitosamente:', response);
        await refreshElements();
        toast.success('Categoría creada exitosamente');
      }
    } catch (error: any) {
      console.error('Error creating category:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error al crear la categoría');
    }
  }, [budgetId, refreshElements]);

  const handleCreateSubcategoria = useCallback(async (nombre: string, categoryId: string) => {
    try {
      console.log('\n=== Validando ID de Categoría ===');
      console.log('ID recibido:', categoryId);
      console.log('Tipo de ID:', typeof categoryId);
      console.log('Longitud del ID:', categoryId.length);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isValidUUID = uuidRegex.test(categoryId);
      
      console.log('¿Es un UUID válido?:', isValidUUID);
      
      if (!isValidUUID) {
        console.error('ID de categoría inválido:', categoryId);
        throw new Error('ID de categoría inválido');
      }

      console.log('\n=== Creando Subcategoría ===');
      console.log('Categoría padre ID:', categoryId);
      console.log('Nombre de subcategoría:', nombre);
      
      const newSubcategoria: Omit<BudgetElement, 'id'> = {
        name: nombre,
        description: '',
        elementLevel: ElementLevelEnum.SUBCATEGORY,
        type: ElementTypeEnum.PRODUCT,
        unitOfMeasure: 'unidad',
        quantity: 1,
        unitPrice: 0,
        totalAmount: 0,
        status: 'Active',
        budgetId: budgetId,
        parentId: categoryId
      };

      console.log('Datos a enviar:', JSON.stringify(newSubcategoria, null, 2));

      const createdSubcategoria = await budgetElementApiClient.create(newSubcategoria);
      console.log('Respuesta del servidor:', JSON.stringify(createdSubcategoria, null, 2));

      // El backend ya maneja la actualización de totales
      await refreshElements();
      toast.success('Subcategoría creada exitosamente');
    } catch (error: any) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Estado de la respuesta:', error.response?.status);
      console.error('Headers de la respuesta:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear subcategoría';
      toast.error(errorMessage);
    }
  }, [budgetId, refreshElements]);

  const handleCreateItem = useCallback(async (nombre: string, subcategoryId: string, cantidad: number, precioUnitario: number) => {
    try {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subcategoryId)) {
        throw new Error('ID de subcategoría inválido');
      }

      const newItem: Omit<BudgetElement, 'id'> = {
        name: nombre,
        description: '',
        elementLevel: ElementLevelEnum.ITEM,
        type: ElementTypeEnum.PRODUCT,
        unitOfMeasure: 'unidad',
        quantity: cantidad,
        unitPrice: precioUnitario,
        totalAmount: 0, // El backend calculará el totalAmount
        status: 'Active',
        budgetId: budgetId,
        parentId: subcategoryId
      };

      console.log('Creando item:', {
        ...newItem,
        budgetId: newItem.budgetId,
        parentId: newItem.parentId
      });

      const createdItem = await budgetElementApiClient.create(newItem);
      console.log('Item creado:', createdItem);

      // El backend ya maneja la actualización de totales de subcategoría y categoría
      await refreshElements();
      toast.success('Item creado exitosamente');
    } catch (error: any) {
      console.error('Error al crear item:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error al crear item');
    }
  }, [budgetId, refreshElements]);

  const confirmDeleteElement = useCallback(async (elementId: string) => {
    try {
      setIsDeleting(true);
      await budgetElementApiClient.delete(elementId);
      await refreshElements();
      toast.success('Elemento eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting element:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el elemento');
    } finally {
      setIsDeleting(false);
    }
  }, [refreshElements]);

  const handleCloneElement = useCallback(async (elementId: string) => {
    try {
      setIsUpdating(true);
      await budgetElementApiClient.cloneElement(elementId);
      await refreshElements();
      toast.success('Elemento duplicado exitosamente');
    } catch (error: any) {
      console.error('Error cloning element:', error);
      toast.error(error.response?.data?.message || 'Error al duplicar el elemento');
    } finally {
      setIsUpdating(false);
    }
  }, [refreshElements]);

  // Función auxiliar para calcular el total de una subcategoría
  function calcularTotalSubcategoria(subcatId: string, elements: BudgetElement[], itemEditadoId?: string, nuevoTotalItem?: number) {
    const items = elements.filter(el => el.elementLevel === ElementLevelEnum.ITEM && el.parentId === subcatId);
    return items.reduce((sum, item) => {
      if (itemEditadoId && item.id === itemEditadoId && nuevoTotalItem !== undefined) {
        return sum + nuevoTotalItem;
      }
      return sum + (item.totalAmount || 0);
    }, 0);
  }

  // Función auxiliar para calcular el total de una categoría
  function calcularTotalCategoria(catId: string, elements: BudgetElement[], subcatEditadaId?: string, nuevoTotalSubcat?: number) {
    const subcategorias = elements.filter(el => el.elementLevel === ElementLevelEnum.SUBCATEGORY && el.parentId === catId);
    return subcategorias.reduce((sum, subcat) => {
      if (subcatEditadaId && subcat.id === subcatEditadaId && nuevoTotalSubcat !== undefined) {
        return sum + nuevoTotalSubcat;
      }
      return sum + (subcat.totalAmount || 0);
    }, 0);
  }

  const handleInlineEdit = useCallback(async (
    elementId: string,
    field: 'name' | 'type' | 'unitOfMeasure' | 'quantity' | 'unitPrice' | 'description',
    value: string | number,
    elements?: BudgetElement[]
  ) => {
    try {
      setIsUpdating(true);
      const updateData: Partial<BudgetElement> = {
        [field]: value
      };

      let subcategoryIdToUpdate: string | null = null;
      let newSubcategoryTotal = 0;
      let categoryIdToUpdate: string | null = null;
      let newCategoryTotal = 0;

      // --- NUEVO: Si se edita el tipo de una categoría, actualizar en cascada en el frontend ---
      if (field === 'type' && elements) {
        const categoria = elements.find(el => el.id === elementId && el.elementLevel === ElementLevelEnum.CATEGORY);
        if (categoria) {
          categoria.type = value as ElementTypeEnum;
          // Actualizar subcategorías e items hijos
          elements.forEach(subcat => {
            if (subcat.parentId === categoria.id && subcat.elementLevel === ElementLevelEnum.SUBCATEGORY) {
              subcat.type = value as ElementTypeEnum;
              elements.forEach(item => {
                if (item.parentId === subcat.id && item.elementLevel === ElementLevelEnum.ITEM) {
                  item.type = value as ElementTypeEnum;
                }
              });
            }
          });
        }
      }

      if ((field === 'unitPrice' || field === 'quantity') && elements) {
        const currentElement = elements.find(el => el.id === elementId);
        if (currentElement) {



          // 1. SUBCATEGORÍA: sumar los total_amount de todos los items hijos
          const subcat = elements.find(el => el.id === currentElement.parentId);
          if (subcat) {
            subcategoryIdToUpdate = subcat.id;
            newSubcategoryTotal = calcularTotalSubcategoria(subcat.id, elements, elementId, updateData.totalAmount);

            // 2. CATEGORÍA: sumar los total_amount de todas las subcategorías hijas
            const cat = elements.find(el => el.id === subcat.parentId);
            if (cat) {
              categoryIdToUpdate = cat.id;
              newCategoryTotal = calcularTotalCategoria(cat.id, elements, subcategoryIdToUpdate, newSubcategoryTotal);
            }
          }
        }
      }

      // 1. Actualiza el item
      await budgetElementApiClient.update(elementId, updateData);

      // 2. Actualiza la subcategoría
      if (subcategoryIdToUpdate) {
        await budgetElementApiClient.update(subcategoryIdToUpdate, { totalAmount: newSubcategoryTotal });
      }

      // 3. Actualiza la categoría
      if (categoryIdToUpdate) {
        await budgetElementApiClient.update(categoryIdToUpdate, { totalAmount: newCategoryTotal });
      }

      await refreshElements();
      toast.success('Elemento actualizado exitosamente');
    } catch (error: any) {
      console.error('Error updating element:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el elemento');
    } finally {
      setIsUpdating(false);
    }
  }, [refreshElements]);

  return {
    isUpdating,
    isDeleting,
    handleCreateCategoria,
    handleCreateSubcategoria,
    handleCreateItem,
    confirmDeleteElement,
    handleInlineEdit,
    handleCloneElement,
  };
}; 