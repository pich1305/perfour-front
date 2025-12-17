import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BudgetElement, ElementLevelEnum } from '@/lib/api/budgetElement.api';
import BudgetTable from '../components/BudgetDetailGrid';
import ModalCategoria from '../modals/ModalCategoria';
import ModalSubcategoria from '../modals/ModalSubcategoria';
import ModalItem from '../modals/ModalItem';
import AddPopup from '../components/AddPopup';
import BudgetHeader from '../components/BudgetHeader';
import BudgetFooter from '../components/BudgetFooter';
import { useBudgetData } from '../hooks/useBudgetData';
import { useBudgetActions } from '../hooks/useBudgetActions';
import { useUndoRedo } from '../hooks/useUndoRedo';
import { generateHierarchicalNumber, getCategoryBackgroundColor } from '@/utils/budgetUtils';
// import EditBudgetModal from '../modals/EditBudgetModal';
import ItemSidebar from '../modals/ItemSidebar';
import { useAppStore } from '@/store/appStore';
import EditBudgetPanel from '../components/panels/EditBudgetPanel';
import BudgetViewPanel from '../components/panels/ViewBudgetPanel';

interface ModalPresupuestoProps {
  budgetId: string;
  onUpdate?: () => void;
}

export function ModalPresupuesto({ budgetId, onUpdate }: ModalPresupuestoProps) {
  const { setBudgetName } = useAppStore();

  // Estados para modales
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [showModalSubcategoria, setShowModalSubcategoria] = useState(false);
  const [showModalItem, setShowModalItem] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  
  // Estados para edición inline
  const [editingElement, setEditingElement] = useState<{
    id: string;
    field: 'name' | 'type' | 'unitOfMeasure' | 'quantity' | 'unitPrice';
    value: string | number;
  } | null>(null);

  // Estado para el popup de agregar
  const [showAddPopup, setShowAddPopup] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    categoriaId?: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 }
  });

  // Estados para formularios inline
  const [showAddSubcategoriaInput, setShowAddSubcategoriaInput] = useState<string | null>(null);
  const [newSubcategoriaDescripcion, setNewSubcategoriaDescripcion] = useState('');
  const [showAddCategoriaInput, setShowAddCategoriaInput] = useState(false);
  const [newCategoriaDescripcion, setNewCategoriaDescripcion] = useState('');
  const [showAddItemInput, setShowAddItemInput] = useState<string | null>(null);
  const [newItemDescripcion, setNewItemDescripcion] = useState('');
  const [newItemCantidad, setNewItemCantidad] = useState(1);
  const [newItemCosto, setNewItemCosto] = useState(0);

  // Estados para Excel-like
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);

  // Estados para autocompletado
  const [showAutoComplete, setShowAutoComplete] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    suggestions: string[];
    onSelect: (value: string) => void;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    suggestions: [],
    onSelect: () => {}
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Estado para el modal de edición de presupuesto
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [isViewPanelOpen, setIsViewPanelOpen] = useState(false);

  // Estado para el sidebar de item
  const [sidebarItem, setSidebarItem] = useState<any | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Hooks personalizados
  const {
    elements,
    setElements,
    isLoading,
    budgetInfo,
    total,
    formatCurrency,
    calculateTotal,
    refreshElements,
    refreshBudgetInfo
  } = useBudgetData(true, budgetId);
  const {
    isUpdating,
    isDeleting,
    handleCreateCategoria,
    handleCreateSubcategoria,
    handleCreateItem,
    confirmDeleteElement,
    handleInlineEdit,
    handleCloneElement,
  } = useBudgetActions(budgetId, refreshElements);

  const {
    undoStack,
    redoStack,
    saveStateForUndo,
    undo,
    redo
  } = useUndoRedo<BudgetElement[]>([]);

  // Efecto para actualizar el nombre del presupuesto en el breadcrumb
  useEffect(() => {
    if (true && budgetInfo?.name) {
      setBudgetName(budgetInfo.name);
    }
    return () => {
      if (!true) {
        setBudgetName('');
      }
    };
  }, [true, budgetInfo?.name, setBudgetName]);

  // Efecto para bloquear el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (true) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [true]);



  const renderElementsTable = () => {
    return (
      <BudgetTable
        categoriasOrdenadas={elements.filter(el => el.elementLevel === ElementLevelEnum.CATEGORY).sort((a, b) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        })}
        editingElement={editingElement}
        startEditing={startEditing}
        saveEditing={saveEditing}
        cancelEditing={cancelEditing}
        handleInlineEdit={handleInlineEdit}
        confirmDeleteElement={confirmDeleteElement}
        handleCloneElement={handleCloneElement}
        formatCurrency={formatCurrency}
        calculateTotal={calculateTotal}
        generateHierarchicalNumber={generateHierarchicalNumber}
        getCategoryBackgroundColor={getCategoryBackgroundColor}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        editingCell={editingCell}
        setEditingCell={setEditingCell}
        showAddItemInput={showAddItemInput}
        setShowAddItemInput={setShowAddItemInput}
        newItemDescripcion={newItemDescripcion}
        setNewItemDescripcion={setNewItemDescripcion}
        newItemCantidad={newItemCantidad}
        setNewItemCantidad={setNewItemCantidad}
        newItemCosto={newItemCosto}
        setNewItemCosto={setNewItemCosto}
        handleAddItemSubmit={handleAddItemSubmit}
        handleOpenAddPopup={handleOpenAddPopup}
        showAddSubcategoriaInput={showAddSubcategoriaInput}
        setShowAddSubcategoriaInput={setShowAddSubcategoriaInput}
        newSubcategoriaDescripcion={newSubcategoriaDescripcion}
        setNewSubcategoriaDescripcion={setNewSubcategoriaDescripcion}
        handleAddSubcategoriaSubmit={handleAddSubcategoriaSubmit}
        showAddCategoriaInput={showAddCategoriaInput}
        setShowAddCategoriaInput={setShowAddCategoriaInput}
        newCategoriaDescripcion={newCategoriaDescripcion}
        setNewCategoriaDescripcion={setNewCategoriaDescripcion}
        handleAddCategoriaSubmit={handleAddCategoriaSubmit}
        currency={budgetInfo?.currency || 'PYG'}
        onOpenItemSidebar={handleOpenSidebar}
        isDeleting={isDeleting}
      />
    );
  };


  // Funciones para edición inline
  const startEditing = (elementId: string, field: 'name' | 'type' | 'unitOfMeasure' | 'quantity' | 'unitPrice', initialValue: string | number) => {
    setEditingElement({ id: elementId, field, value: initialValue });
  };

  const cancelEditing = () => {
    setEditingElement(null);
  };

  const saveEditing = () => {
    if (editingElement) {
      handleInlineEdit(editingElement.id, editingElement.field, editingElement.value, elements);
    }
  };

  // Funciones para formularios inline
  const handleAddSubcategoriaSubmit = async (e: React.FormEvent | React.KeyboardEvent, categoriaId: string) => {
    if (e) e.preventDefault();
    if (!newSubcategoriaDescripcion.trim()) return;
    await handleCreateSubcategoria(newSubcategoriaDescripcion, categoriaId);
    setNewSubcategoriaDescripcion('');
    setShowAddSubcategoriaInput(null);
  };

  const handleAddCategoriaSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!newCategoriaDescripcion.trim()) return;
    await handleCreateCategoria(newCategoriaDescripcion);
    setNewCategoriaDescripcion('');
    setShowAddCategoriaInput(false);
  };

  const handleAddItemSubmit = async (e: React.FormEvent | React.KeyboardEvent, subcategoriaId: string) => {
    if (e) e.preventDefault();
    if (!newItemDescripcion.trim() || !subcategoriaId) return;
    await handleCreateItem(newItemDescripcion, subcategoriaId, newItemCantidad, newItemCosto);
    setNewItemDescripcion('');
    setNewItemCantidad(1);
    setNewItemCosto(0);
    setShowAddItemInput(null);
  };

  // Función para abrir el popup de agregar
  const handleOpenAddPopup = (event: React.MouseEvent, categoriaId?: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setShowAddPopup({
      isOpen: true,
      position: { 
        x: rect.right, 
        y: rect.top 
      },
      categoriaId
    });
  };

  // Función para manejar la selección de categoría desde el popup
  const handleSelectCategoria = () => {
    setShowAddCategoriaInput(true);
    setShowAddPopup({ isOpen: false, position: { x: 0, y: 0 } });
  };

  // Función para manejar la selección de subcategoría desde el popup
  const handleSelectSubcategoria = () => {
    if (showAddPopup.categoriaId) {
      setShowAddSubcategoriaInput(showAddPopup.categoriaId);
    }
    setShowAddPopup({ isOpen: false, position: { x: 0, y: 0 } });
  };

  // Función para abrir el sidebar
  const handleOpenSidebar = (item: any) => {
    setSidebarItem(item);
    setIsSidebarOpen(true);
  };

  // Función para cerrar el sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setSidebarItem(null);
  };

  // Función para guardar el item editado desde el sidebar (persistente)
  const handleSaveSidebarItem = async (updatedItem: any) => {
    if (!sidebarItem) return;
    const editableFields = ['name', 'description', 'unitOfMeasure', 'quantity', 'unitPrice'] as const;
    for (const field of editableFields) {
      if (updatedItem[field] !== sidebarItem[field]) {
        await handleInlineEdit(updatedItem.id, field as 'name' | 'description' | 'unitOfMeasure' | 'quantity' | 'unitPrice', updatedItem[field], elements);
      }
    }
  };

  // Funciones para undo/redo
  const handleUndo = useCallback(() => {
    undo(elements, setElements);
  }, [undo, elements, setElements]);

  const handleRedo = useCallback(() => {
    redo(elements, setElements);
  }, [redo, elements, setElements]);

  // Función para refrescar el presupuesto (info y elementos)
  const refreshBudget = async () => {
    if (typeof refreshElements === 'function') {
      await refreshElements();
    }
    if (typeof refreshBudgetInfo === 'function') {
      await refreshBudgetInfo();
    }
  };

  // Función para manejar la actualización del nombre del presupuesto
  const handleBudgetUpdated = async () => {
    await refreshBudget();
    // Esta función ahora también cerrará el panel
    setShowEditBudgetModal(false);
    await refreshElements();
    await refreshBudgetInfo();
    if (onUpdate) onUpdate();
  };

  if (!true) return null;

  // Calcular totales por tipo de categoría
  const items = elements.filter(el => el.elementLevel === ElementLevelEnum.ITEM);
  const totalsByType: Record<string, number> = {};
  let totalGeneral = 0;
  items.forEach(item => {
    const type = item.type || 'OTRO';
    const subtotal = (item.unitPrice || 0) * (item.quantity || 0);
    totalsByType[type] = (totalsByType[type] || 0) + subtotal;
    totalGeneral += subtotal;
  });

  return (
    <div className="py-1 px-6 w-full h-full flex flex-col relative ">
      <BudgetHeader
        budgetInfo={budgetInfo}
        total={total}
        elementsCount={elements.length}
        formatCurrency={formatCurrency}
        undoStack={undoStack}
        redoStack={redoStack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClose={() => { }}
        onEditBudget={() => setShowEditBudgetModal(true)}
        onView={() => setIsViewPanelOpen(true)}
      />
      {isLoading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto rounded-xl border border-gray-200">
            {renderElementsTable()}
            <BudgetFooter elements={elements} formatCurrency={formatCurrency} />
          </div>
        </div>
      )}



      {/* Componente de autocompletado */}
      {showAutoComplete.isOpen && (
        <div
          className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-[90] max-h-40 overflow-y-auto"
          style={{
            left: showAutoComplete.position.x,
            top: showAutoComplete.position.y
          }}
        >
          {showAutoComplete.suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => showAutoComplete.onSelect(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}



      <ModalCategoria
        isOpen={showModalCategoria}
        onClose={() => setShowModalCategoria(false)}
        onSave={handleCreateCategoria}
      />

      <ModalSubcategoria
        isOpen={showModalSubcategoria}
        onClose={() => setShowModalSubcategoria(false)}
        categoriaId={selectedParentId}
        onSave={handleCreateSubcategoria}
      />

      <ModalItem
        isOpen={showModalItem}
        onClose={() => {
          setShowModalItem(false);
          setSelectedParentId('');
        }}
        subcategorias={elements.filter(el => el.elementLevel === ElementLevelEnum.SUBCATEGORY)}
        onSave={handleCreateItem}
        preselectedSubcategoriaId={selectedParentId}
      />

      <AddPopup
        isOpen={showAddPopup.isOpen}
        position={showAddPopup.position}
        onClose={() => setShowAddPopup({ isOpen: false, position: { x: 0, y: 0 } })}
        onSelectCategoria={handleSelectCategoria}
        onSelectSubcategoria={handleSelectSubcategoria}
      />

      {/* Modal de edición de presupuesto */}
      {showEditBudgetModal && (
        <EditBudgetPanel
          onClose={() => setShowEditBudgetModal(false)}
          budgetId={budgetId}
          onBudgetUpdated={handleBudgetUpdated}
        />
      )}

      {isViewPanelOpen && (
        <BudgetViewPanel
          isOpen={isViewPanelOpen}
          onClose={() => setIsViewPanelOpen(false)}
          budgetId={budgetId}
        />
      )}

      {/* Sidebar del item */}
      <ItemSidebar
        item={sidebarItem}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onSave={handleSaveSidebarItem}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

export default ModalPresupuesto;
