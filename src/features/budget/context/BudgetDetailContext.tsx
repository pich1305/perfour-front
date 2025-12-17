// "use client";

// import { BudgetApiClient } from '@/lib/api/budget.api';
// import { BudgetElement, budgetElementApiClient, ElementLevelEnum, ElementTypeEnum } from '@/lib/client/BudgetElementApiClient';
// import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';

// // --- 1. Definición del Estado Centralizado ---
// // Mapeamos todos los `useState` de tu ModalPresupuesto a una única interfaz de estado.
// interface BudgetState {
//   elements: BudgetElement[];
//   budgetInfo: any | null;
//   isLoading: boolean;
//   isUpdating: boolean;
  
//   // Estado de UI
//   editingElement: { id: string; field: string; value: any } | null;
//   selectedCell: { row: number; col: number } | null;
//   editingCell: { row: number; col: number } | null;
  
//   // Estado para los inputs de "Agregar Nuevo"
//   showAddSubcategoriaInput: string | null;
//   newSubcategoriaDescripcion: string;
//   showAddCategoriaInput: boolean;
//   newCategoriaDescripcion: string;
//   showAddItemInput: string | null;
//   newItemDescripcion: string;
//   newItemCantidad: number;
//   newItemCosto: number;
// }

// // --- 2. Definición de Acciones ---
// // Definimos todas las maneras posibles de modificar el estado.
// type Action =
//   | { type: 'SET_LOADING'; payload: boolean }
//   | { type: 'SET_UPDATING'; payload: boolean }
//   | { type: 'SET_DATA'; payload: { elements: BudgetElement[]; budgetInfo: any } }
//   | { type: 'START_EDITING'; payload: { id: string; field: string; value: any } }
//   | { type: 'UPDATE_EDIT_VALUE'; payload: any }
//   | { type: 'END_EDITING' }
//   | { type: 'SET_SELECTED_CELL'; payload: { row: number; col: number } | null }
//   | { type: 'SET_EDITING_CELL'; payload: { row: number; col: number } | null }
//   // Acciones para controlar los inputs de "Agregar Nuevo"
//   | { type: 'SET_NEW_ITEM_INPUT'; payload: { field: string; value: any } };

// // --- 3. Reducer ---
// const budgetReducer = (state: BudgetState, action: Action): BudgetState => {
//   switch (action.type) {
//     case 'SET_LOADING':
//       return { ...state, isLoading: action.payload };
//     case 'SET_UPDATING':
//       return { ...state, isUpdating: action.payload };
//     case 'SET_DATA':
//       return { ...state, elements: action.payload.elements, budgetInfo: action.payload.budgetInfo };
//     case 'START_EDITING':
//       return { ...state, editingElement: action.payload, editingCell: state.selectedCell };
//     case 'UPDATE_EDIT_VALUE':
//         if (!state.editingElement) return state;
//         return { ...state, editingElement: { ...state.editingElement, value: action.payload } };
//     case 'END_EDITING':
//       return { ...state, editingElement: null, editingCell: null };
//     case 'SET_SELECTED_CELL':
//         return { ...state, selectedCell: action.payload };
//     case 'SET_EDITING_CELL':
//         return { ...state, editingCell: action.payload };
//     case 'SET_NEW_ITEM_INPUT':
//         return { ...state, [action.payload.field]: action.payload.value };
//     default:
//       return state;
//   }
// };

// // --- 4. Contexto y Proveedor ---
// interface BudgetContextProps {
//   state: BudgetState;
//   dispatch: React.Dispatch<Action>;
//   // Funciones de acción que interactúan con la API (migradas desde useBudgetActions)
//   createCategoria: () => Promise<void>;
//   createSubcategoria: (parentId: string) => Promise<void>;
//   createItem: (parentId: string) => Promise<void>;
//   deleteElement: (elementId: string) => Promise<void>;
//   saveEditing: () => Promise<void>;
// }

// const BudgetDetailContext = createContext<BudgetContextProps | undefined>(undefined);

// export const BudgetDetailProvider = ({ children, budgetId }: { children: ReactNode; budgetId: string }) => {
  
//   const initialState: BudgetState = {
//     elements: [], budgetInfo: null, isLoading: true, isUpdating: false,
//     editingElement: null, selectedCell: null, editingCell: null,
//     showAddSubcategoriaInput: null, newSubcategoriaDescripcion: '',
//     showAddCategoriaInput: false, newCategoriaDescripcion: '',
//     showAddItemInput: null, newItemDescripcion: '', newItemCantidad: 1, newItemCosto: 0,
//   };

//   const [state, dispatch] = useReducer(budgetReducer, initialState);

//   // --- Lógica de API (Migrada desde tus hooks) ---
//   const refreshElements = useCallback(async () => {
//     const response = await budgetElementApiClient.getByBudgetId(budgetId);
//     const budgetInfo = await BudgetApiClient.getBudgetById(budgetId);
//     dispatch({ type: 'SET_DATA', payload: { elements: response.data.elements || [], budgetInfo } });
//   }, [budgetId]);

//   useEffect(() => {
//     dispatch({ type: 'SET_LOADING', payload: true });
//     refreshElements().finally(() => dispatch({ type: 'SET_LOADING', payload: false }));
//   }, [budgetId, refreshElements]);

//   // --- Funciones de Acción (API Calls + Dispatch) ---
//   const saveEditing = useCallback(async () => {
//     if (!state.editingElement) return;
//     dispatch({ type: 'SET_UPDATING', payload: true });
//     try {
//       const { id, field, value } = state.editingElement;
//       await budgetElementApiClient.update(id, { [field]: value });
//       await refreshElements(); // Refresca para obtener totales recalculados del backend
//       toast.success('Guardado');
//     } catch (error: any) { toast.error(error.message || "Error al guardar"); } 
//     finally {
//       dispatch({ type: 'END_EDITING' });
//       dispatch({ type: 'SET_UPDATING', payload: false });
//     }
//   }, [state.editingElement, refreshElements]);

//   const createCategoria = useCallback(async () => {
//     if (!state.newCategoriaDescripcion.trim()) return;
//     dispatch({ type: 'SET_UPDATING', payload: true });
//     try {
//       await budgetElementApiClient.create({
//         name: state.newCategoriaDescripcion,
//         budgetId,
//         elementLevel: ElementLevelEnum.CATEGORY,
//         // ...otros campos por defecto de tu legacy code
//         status: 'Active', type: ElementTypeEnum.PRODUCTO, total_amount: 0,
//       });
//       dispatch({ type: 'SET_NEW_ITEM_INPUT', payload: { field: 'newCategoriaDescripcion', value: '' } });
//       dispatch({ type: 'SET_NEW_ITEM_INPUT', payload: { field: 'showAddCategoriaInput', value: false } });
//       await refreshElements();
//       toast.success('Categoría creada');
//     } catch (error: any) { toast.error(error.message || 'Error al crear'); }
//     dispatch({ type: 'SET_UPDATING', payload: false });
//   }, [budgetId, state.newCategoriaDescripcion, refreshElements]);
  
//   // Implementar createSubcategoria y createItem de la misma manera...
//   const createSubcategoria = async (parentId: string) => { /* ... */ };
//   const createItem = async (parentId: string) => { /* ... */ };
//   const deleteElement = async (elementId: string) => { /* ... */ };

//   return (
//     <BudgetDetailContext.Provider value={{ state, dispatch, saveEditing, createCategoria, createSubcategoria, createItem, deleteElement }}>
//       {children}
//     </BudgetDetailContext.Provider>
//   );
// };

// // Hook personalizado para consumir el contexto fácilmente
// export const useBudgetGrid = () => {
//   const context = useContext(BudgetDetailContext);
//   if (!context) throw new Error('useBudgetGrid debe usarse dentro de un BudgetDetailProvider');
//   return context;
// };