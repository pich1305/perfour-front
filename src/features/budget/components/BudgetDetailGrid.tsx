import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import CategoryRow from './CategoryRow';
import SubcategoryRow from './SubcategoryRow';
import ItemRow from './ItemRow';
import NewItemRow from './NewItemRow';
import NewSubcategoryRow from './NewSubcategoryRow';
import NewCategoryRow from './NewCategoryRow';
import { FileText, Info } from 'lucide-react';
import { ElementLevelEnum } from '@/lib/api/budgetElement.api';

const columns = [
  { key: 'name', label: 'Item' },
  { key: 'unitOfMeasure', label: 'Unidad' },
  { key: 'quantity', label: 'Cantidad' },
  { key: 'unitPrice', label: 'Precio Unit.' },
];

function getEditableCellsForRow(rowType: any) {
  if (rowType === ElementLevelEnum.CATEGORY) return ['name', 'type'];
  if (rowType === ElementLevelEnum.SUBCATEGORY) return ['name'];
  if (rowType === ElementLevelEnum.ITEM) return ['name', 'unitOfMeasure', 'quantity', 'unitPrice'];
  return [];
}

interface BudgetTableProps {
  categoriasOrdenadas: any[];
  editingElement: any;
  startEditing: (...args: any[]) => void;
  saveEditing: (...args: any[]) => void;
  cancelEditing: (...args: any[]) => void;
  handleInlineEdit: (...args: any[]) => void;
  confirmDeleteElement: (elementId: string) => void;
  handleCloneElement: (elementId: string) => void;
  formatCurrency: (...args: any[]) => string;
  calculateTotal: (...args: any[]) => number;
  generateHierarchicalNumber: (...args: any[]) => string;
  getCategoryBackgroundColor: (...args: any[]) => string;
  selectedCell: any;
  setSelectedCell: (...args: any[]) => void;
  editingCell: any;
  setEditingCell: (...args: any[]) => void;
  showAddItemInput: string | null;
  setShowAddItemInput: (...args: any[]) => void;
  newItemDescripcion: string;
  setNewItemDescripcion: (...args: any[]) => void;
  newItemCantidad: number;
  setNewItemCantidad: (...args: any[]) => void;
  newItemCosto: number;
  setNewItemCosto: (...args: any[]) => void;
  handleAddItemSubmit: (...args: any[]) => void;
  handleOpenAddPopup: (...args: any[]) => void;
  showAddSubcategoriaInput: string | null;
  setShowAddSubcategoriaInput: (...args: any[]) => void;
  newSubcategoriaDescripcion: string;
  setNewSubcategoriaDescripcion: (...args: any[]) => void;
  handleAddSubcategoriaSubmit: (...args: any[]) => void;
  showAddCategoriaInput: boolean;
  setShowAddCategoriaInput: (...args: any[]) => void;
  newCategoriaDescripcion: string;
  setNewCategoriaDescripcion: (...args: any[]) => void;
  handleAddCategoriaSubmit: (...args: any[]) => void;
  currency: string;
  onOpenItemSidebar?: (item: any) => void;
  isDeleting?: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
  categoriasOrdenadas,
  editingElement,
  startEditing,
  saveEditing,
  cancelEditing,
  handleInlineEdit,
  confirmDeleteElement,
  handleCloneElement,
  formatCurrency,
  calculateTotal,
  generateHierarchicalNumber,
  getCategoryBackgroundColor,
  selectedCell,
  setSelectedCell,
  editingCell,
  setEditingCell,
  showAddItemInput,
  setShowAddItemInput,
  newItemDescripcion,
  setNewItemDescripcion,
  newItemCantidad,
  setNewItemCantidad,
  newItemCosto,
  setNewItemCosto,
  handleAddItemSubmit,
  handleOpenAddPopup,
  showAddSubcategoriaInput,
  setShowAddSubcategoriaInput,
  newSubcategoriaDescripcion,
  setNewSubcategoriaDescripcion,
  handleAddSubcategoriaSubmit,
  showAddCategoriaInput,
  setShowAddCategoriaInput,
  newCategoriaDescripcion,
  setNewCategoriaDescripcion,
  handleAddCategoriaSubmit,
  currency,
  onOpenItemSidebar,
  isDeleting,
}) => {
  // refs para inputs
  const cellRefs = useRef<Record<string, any>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  
  // Estados para funcionalidad Excel-like
  const [selectionRange, setSelectionRange] = useState<{
    start: { row: number; col: number };
    end: { row: number; col: number };
  } | null>(null);
  const [clipboard, setClipboard] = useState<string[][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [showDocsInfo, setShowDocsInfo] = useState(false);
  const [infoPopupPosition, setInfoPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);

  const categoriasConHijos = categoriasOrdenadas.map(c => ({
    ...c,
    children: (c.children || []).sort((a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
  }));

  const calculateTotalRows = () => {
    let count = categoriasConHijos.reduce((acc, categoria) => {
        let catCount = 1; // Fila de la categoría
        const subcategorias = (categoria.children || []).filter((el: any) => el.elementLevel === ElementLevelEnum.SUBCATEGORY);
        catCount += subcategorias.length; // Filas de subcategorías
        catCount += subcategorias.reduce((sum: number, subcat: any) => sum + (subcat.children || []).filter((el: any) => el.elementLevel === ElementLevelEnum.ITEM).length, 0); // Filas de ítems
        catCount += subcategorias.length; // Filas para nuevos ítems
        catCount += 1; // Fila para nueva subcategoría
        return acc + catCount;
    }, 0);
  
    if (categoriasConHijos.length > 0) {
        count += 1; // Fila para nueva categoría al final
    } else {
        count = 1; // Fila para la primera categoría si no hay ninguna
    }
    return count;
  };

  const totalRows = calculateTotalRows();
  const maxRowIdx = totalRows > 0 ? totalRows - 1 : 0;
  let globalRowIdx = 0;

  // Efecto para enfocar la celda seleccionada
  useEffect(() => {
    if (editingCell && cellRefs.current) {
      const key = `${editingCell.row}-${editingCell.col}`;
      if (cellRefs.current[key]) {
        cellRefs.current[key].focus();
      }
    }
  }, [editingCell]);

  // Efecto para sincronizar la selección de una sola celda con el rango de selección
  useEffect(() => {
    if (selectedCell && !isSelecting) {
      setSelectionRange({
        start: { row: selectedCell.row, col: selectedCell.col },
        end: { row: selectedCell.row, col: selectedCell.col }
      });
    }
  }, [selectedCell, isSelecting]);

  // Efecto para cerrar el popup de información al hacer click fuera
  useEffect(() => {
    if (!showDocsInfo) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (infoButtonRef.current && !infoButtonRef.current.contains(event.target as Node)) {
        setShowDocsInfo(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDocsInfo]);

  // Función para calcular la posición del popup de información
  const calculateInfoPopupPosition = () => {
    if (!infoButtonRef.current) return null;
    const rect = infoButtonRef.current.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY - 80, // Posicionar arriba del botón
      left: rect.left + window.scrollX + (rect.width / 2) // Centro del botón, usaremos transform para centrar el popup
    };
  };

  // Función para manejar el inicio de selección
  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCell({ row, col });
    setSelectionRange({
      start: { row, col },
      end: { row, col }
    });
  }, [setSelectedCell]);

  // Función para manejar el arrastre de selección
  const handleMouseEnter = useCallback((row: number, col: number) => {
    if (isSelecting && selectionRange) {
      setSelectionRange({
        start: selectionRange.start,
        end: { row, col }
      });
    }
  }, [isSelecting, selectionRange]);

  // Función para manejar el fin de selección
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, []);

  // Función para manejar atajos de teclado globales
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ctrl+C - Copiar
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      if (selectionRange) {
        copySelection();
      }
    }
    // Ctrl+V - Pegar
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      if (selectionRange && clipboard.length > 0) {
        pasteSelection();
      }
    }
    // Ctrl+A - Seleccionar todo
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      selectAll();
    }
    // Delete - Borrar contenido
    if (e.key === 'Delete') {
      e.preventDefault();
      if (selectionRange) {
        clearSelection();
      }
    }
    // Escape - Cancelar selección
    if (e.key === 'Escape') {
      setSelectionRange(null);
      setSelectedCell(null);
    }
  }, [selectionRange, clipboard]);

  // Efecto para agregar/remover event listeners globales
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown, handleMouseUp]);

  // Función para copiar selección
  const copySelection = useCallback(() => {
    if (!selectionRange) return;

    const { start, end } = selectionRange;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const copiedData: string[][] = [];
    
    // Obtener todos los elementos de la tabla
    const allRows = getAllTableRows();
    
    for (let row = minRow; row <= maxRow; row++) {
      const rowData: string[] = [];
      for (let col = minCol; col <= maxCol; col++) {
        const cellValue = getCellValue(allRows, row, col);
        rowData.push(cellValue);
      }
      copiedData.push(rowData);
    }

    setClipboard(copiedData);
    
    // Copiar al portapapeles del sistema
    const textToCopy = copiedData.map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(textToCopy);
  }, [selectionRange]);

  // Función para pegar selección
  const pasteSelection = useCallback(() => {
    if (!selectionRange || clipboard.length === 0) return;

    const { start } = selectionRange;
    const allRows = getAllTableRows();
    
    clipboard.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        const targetRow = start.row + rowIndex;
        const targetCol = start.col + colIndex;
        const element = getElementAtPosition(allRows, targetRow, targetCol);
        
        if (element && isEditableCell(targetCol)) {
          const field = getFieldForColumn(targetCol);
          if (field) {
            handleInlineEdit(element.id, field, value);
          }
        }
      });
    });
  }, [selectionRange, clipboard, handleInlineEdit]);

  // Función para seleccionar todo
  const selectAll = useCallback(() => {
    const allRows = getAllTableRows();
    if (allRows.length > 0) {
      setSelectionRange({
        start: { row: 0, col: 0 },
        end: { row: allRows.length - 1, col: 8 }
      });
    }
  }, []);

  // Función para limpiar selección
  const clearSelection = useCallback(() => {
    if (!selectionRange) return;

    const { start, end } = selectionRange;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const allRows = getAllTableRows();
    
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const element = getElementAtPosition(allRows, row, col);
        if (element && isEditableCell(col)) {
          const field = getFieldForColumn(col);
          if (field) {
            handleInlineEdit(element.id, field, '');
          }
        }
      }
    }
  }, [selectionRange, handleInlineEdit]);

  // Función auxiliar para obtener todas las filas de la tabla
  const getAllTableRows = useCallback(() => {
    const rows: any[] = [];
    let globalRowIdx = 0;
    
    categoriasOrdenadas.forEach((categoria, catIdx) => {
      // Agregar categoría
      rows.push({ type: ElementLevelEnum.CATEGORY, element: categoria, catIdx, rowIdx: globalRowIdx++ });
      
      // Agregar subcategorías
      const subcategorias = (categoria.children || [])
        .filter((el: any) => el.elementLevel === ElementLevelEnum.SUBCATEGORY)
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        });
        
      subcategorias.forEach((subcategoria: any, subIdx: number) => {
        rows.push({ type: ElementLevelEnum.SUBCATEGORY, element: subcategoria, catIdx, subIdx, rowIdx: globalRowIdx++ });
        
        // Agregar items
        const items = (subcategoria.children || [])
          .filter((el: any) => el.elementLevel === ElementLevelEnum.ITEM)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateA - dateB;
          });
          
        items.forEach((item: any, itemIdx: number) => {
          rows.push({ type: ElementLevelEnum.ITEM, element: item, catIdx, subIdx, itemIdx, rowIdx: globalRowIdx++ });
        });
      });
    });
    
    return rows;
  }, [categoriasOrdenadas]);

  // Función auxiliar para obtener el valor de una celda
  const getCellValue = useCallback((allRows: any[], row: number, col: number) => {
    const rowData = allRows[row];
    if (!rowData) return '';
    
    const { element, type } = rowData;
    
    switch (col) {
      case 0: // Nº
        if (type === ElementLevelEnum.CATEGORY) return generateHierarchicalNumber(rowData.catIdx);
        if (type === ElementLevelEnum.SUBCATEGORY) return generateHierarchicalNumber(rowData.catIdx, rowData.subIdx);
        if (type === ElementLevelEnum.ITEM) return generateHierarchicalNumber(rowData.catIdx, rowData.subIdx, rowData.itemIdx);
        return '';
      case 1: // Nombre
        return element.name || '';
      case 2: // Unidad
        return element.unitOfMeasure || '';
      case 3: // Cantidad
        return element.quantity?.toString() || '';
      case 4: // Precio Unit.
        return element.unitPrice?.toString() || '';
      case 5: // Total
        return formatCurrency(calculateTotal(element));
      case 6: // Documentos
        return '-';
      case 7: // Acciones
        return '';
      default:
        return '';
    }
  }, [generateHierarchicalNumber, formatCurrency, calculateTotal]);

  // Función auxiliar para obtener el elemento en una posición
  const getElementAtPosition = useCallback((allRows: any[], row: number, col: number) => {
    const rowData = allRows[row];
    return rowData?.element || null;
  }, []);

  // Función auxiliar para verificar si una celda es editable
  const isEditableCell = useCallback((col: number) => {
    return [1, 2, 3, 4].includes(col); // nombre, unidad, cantidad, precio
  }, []);

  // Función auxiliar para obtener el campo correspondiente a una columna
  const getFieldForColumn = useCallback((col: number) => {
    switch (col) {
      case 1: return 'name';
      case 2: return 'unitOfMeasure';
      case 3: return 'quantity';
      case 4: return 'unitPrice';
      default: return null;
    }
  }, []);

  // Función para verificar si una celda está en el rango de selección
  const isCellInSelection = useCallback((row: number, col: number) => {
    if (!selectionRange) return false;
    
    const { start, end } = selectionRange;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }, [selectionRange]);

  function trySaveNewItem(subcategoriaId: string) {
    if (
      showAddItemInput === subcategoriaId &&
      newItemDescripcion.trim() &&
      newItemCantidad > 0 &&
      newItemCosto > 0
    ) {
      handleAddItemSubmit(undefined, subcategoriaId);
    }
  }

  // Log de depuración para ver los datos que llegan a la tabla
  //console.log('CATEGORIAS ORDENADAS:', categoriasOrdenadas);

  return (
    <div className="overflow-x-auto" ref={tableRef}>
      <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
        <thead className="sticky top-0" style={{ background: '#D9D9D9' }}>
          <tr>
            <th style={{ width: '60px' }} className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider w-20">Nº</th>
            <th style={{ width: '180px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Item</th>
            <th style={{ width: '100px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Unidad</th>
            <th style={{ width: '100px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Cantidad</th>
            <th style={{ width: '120px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Costo Final.</th>
            <th style={{ width: '120px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Subtotal</th>
            <th style={{ width: '120px' }} className="px-6 py-2 text-left text-xs font-medium text-black uppercase tracking-wider relative">
              <div className="flex items-center gap-2">
                <span>Docs.</span>
                  <button
                    ref={infoButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!showDocsInfo) {
                        const position = calculateInfoPopupPosition();
                        setInfoPopupPosition(position);
                      }
                      setShowDocsInfo(!showDocsInfo);
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 hover:brightness-110 transition-all duration-200"
                    title="Información sobre documentos"
                  >
                    <Info className="w-3 h-3" />
                  </button>
              </div>
            </th>
            <th style={{ width: '100px' }} className="px-2 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categoriasConHijos.length === 0 ? (
            <NewCategoryRow
              catIdx={0}
              newCategoriaDescripcion={newCategoriaDescripcion}
              setNewCategoriaDescripcion={setNewCategoriaDescripcion}
              showAddCategoriaInput={showAddCategoriaInput}
              setShowAddCategoriaInput={setShowAddCategoriaInput}
              handleAddCategoriaSubmit={(e) => handleAddCategoriaSubmit(e as any)}
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              rowIdx={0}
              maxRowIdx={0}
              isOnlyRow={true}
            />
          ) : (
            <>
              {categoriasConHijos.map((categoria, catIdx) => {
                const subcategoriasOrdenadas = (categoria.children || [])
                  .filter((el: any) => el.elementLevel === ElementLevelEnum.SUBCATEGORY);
                const categoryRowIdx = globalRowIdx;
                globalRowIdx++;
                return (
                  <React.Fragment key={categoria.id}>
                    <CategoryRow
                      categoria={categoria}
                      catIdx={catIdx}
                      rowIdx={categoryRowIdx}
                      maxRowIdx={maxRowIdx}
                      generateHierarchicalNumber={generateHierarchicalNumber}
                      getCategoryBackgroundColor={getCategoryBackgroundColor}
                      editingElement={editingElement}
                      startEditing={startEditing}
                      saveEditing={saveEditing}
                      cancelEditing={cancelEditing}
                      handleInlineEdit={handleInlineEdit}
                      confirmDeleteElement={confirmDeleteElement}
                      handleCloneElement={handleCloneElement}
                      formatCurrency={formatCurrency}
                      calculateTotal={calculateTotal}
                      selectedCell={selectedCell}
                      setSelectedCell={setSelectedCell}
                      editingCell={editingCell}
                      setEditingCell={setEditingCell}
                      selectionRange={selectionRange}
                      isCellInSelection={isCellInSelection}
                      handleMouseDown={handleMouseDown}
                      handleMouseEnter={handleMouseEnter}
                      currency={currency}
                      isDeleting={isDeleting}
                    />
                    {subcategoriasOrdenadas.map((subcategoria: any, subIdx: number) => {
                      const subcategoryRowIdx = globalRowIdx;
                      globalRowIdx++;
                      const itemsOrdenados = (subcategoria.children || [])
                        .filter((el: any) => el.elementLevel === ElementLevelEnum.ITEM)
                        .sort((a: any, b: any) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                      return (
                        <React.Fragment key={subcategoria.id}>
                          <SubcategoryRow
                            key={subcategoria.id}
                            subcategoria={subcategoria}
                            catIdx={catIdx}
                            subIdx={subIdx}
                            rowIdx={subcategoryRowIdx}
                            maxRowIdx={maxRowIdx}
                            generateHierarchicalNumber={generateHierarchicalNumber}
                            editingElement={editingElement}
                            startEditing={startEditing}
                            saveEditing={saveEditing}
                            cancelEditing={cancelEditing}
                            confirmDeleteElement={confirmDeleteElement}
                            formatCurrency={formatCurrency}
                            calculateTotal={calculateTotal}
                            selectedCell={selectedCell}
                            setSelectedCell={setSelectedCell}
                            editingCell={editingCell}
                            setEditingCell={setEditingCell}
                            selectionRange={selectionRange}
                            isCellInSelection={isCellInSelection}
                            handleMouseDown={handleMouseDown}
                            handleMouseEnter={handleMouseEnter}
                            currency={currency}
                            isDeleting={isDeleting}
                          />
                          {itemsOrdenados.map((item: any, itemIdx: number) => {
                            const itemRowIdx = globalRowIdx;
                            globalRowIdx++;
                            return (
                              <ItemRow
                                key={item.id}
                                item={item}
                                catIdx={catIdx}
                                subIdx={subIdx}
                                itemIdx={itemIdx}
                                rowIdx={itemRowIdx}
                                maxRowIdx={maxRowIdx}
                                generateHierarchicalNumber={generateHierarchicalNumber}
                                editingElement={editingElement}
                                startEditing={startEditing}
                                saveEditing={saveEditing}
                                cancelEditing={cancelEditing}
                                handleInlineEdit={handleInlineEdit}
                                confirmDeleteElement={confirmDeleteElement}
                                formatCurrency={formatCurrency}
                                calculateTotal={calculateTotal}
                                selectedCell={selectedCell}
                                setSelectedCell={setSelectedCell}
                                editingCell={editingCell}
                                setEditingCell={setEditingCell}
                                selectionRange={selectionRange}
                                isCellInSelection={isCellInSelection}
                                handleMouseDown={handleMouseDown}
                                handleMouseEnter={handleMouseEnter}
                                currency={currency}
                                onOpenItemSidebar={onOpenItemSidebar}
                                isDeleting={isDeleting}
                              />
                            );
                          })}
                          <NewItemRow
                            key={subcategoria.id + '-new-item'}
                            catIdx={catIdx}
                            subIdx={subIdx}
                            itemIdx={itemsOrdenados.length}
                            subcategoriaId={subcategoria.id}
                            generateHierarchicalNumber={generateHierarchicalNumber}
                            newItemDescripcion={newItemDescripcion}
                            setNewItemDescripcion={setNewItemDescripcion}
                            newItemCantidad={newItemCantidad}
                            setNewItemCantidad={setNewItemCantidad}
                            newItemCosto={newItemCosto}
                            setNewItemCosto={setNewItemCosto}
                            showAddItemInput={showAddItemInput}
                            setShowAddItemInput={setShowAddItemInput}
                            trySaveNewItem={trySaveNewItem}
                            selectedCell={selectedCell}
                            setSelectedCell={setSelectedCell}
                            rowIdx={globalRowIdx++}
                            maxRowIdx={maxRowIdx}
                          />
                        </React.Fragment>
                      );
                    })}
                    <NewSubcategoryRow
                      key={categoria.id + '-new-subcat'}
                      catIdx={catIdx}
                      subIdx={subcategoriasOrdenadas.length}
                      categoriaId={categoria.id}
                      generateHierarchicalNumber={generateHierarchicalNumber}
                      newSubcategoriaDescripcion={newSubcategoriaDescripcion}
                      setNewSubcategoriaDescripcion={setNewSubcategoriaDescripcion}
                      showAddSubcategoriaInput={showAddSubcategoriaInput}
                      setShowAddSubcategoriaInput={setShowAddSubcategoriaInput}
                      handleAddSubcategoriaSubmit={(e, id) => handleAddSubcategoriaSubmit(e as any, id)}
                      selectedCell={selectedCell}
                      setSelectedCell={setSelectedCell}
                      rowIdx={globalRowIdx++}
                      maxRowIdx={maxRowIdx}
                    />
                  </React.Fragment>
                );
              })}
              <NewCategoryRow
                catIdx={categoriasConHijos.length}
                newCategoriaDescripcion={newCategoriaDescripcion}
                setNewCategoriaDescripcion={setNewCategoriaDescripcion}
                showAddCategoriaInput={showAddCategoriaInput}
                setShowAddCategoriaInput={setShowAddCategoriaInput}
                handleAddCategoriaSubmit={e => handleAddCategoriaSubmit(e as any)}
                selectedCell={selectedCell}
                setSelectedCell={setSelectedCell}
                rowIdx={globalRowIdx}
                maxRowIdx={maxRowIdx}
                isOnlyRow={false}
              />
            </>
          )}
        </tbody>
      </table>
      
      {/* Popup de información sobre documentos */}
      {showDocsInfo && infoPopupPosition && ReactDOM.createPortal(
        <div
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] text-sm text-gray-700 px-4 py-3"
          style={{
            position: 'absolute',
            top: `${infoPopupPosition.top}px`,
            left: `${infoPopupPosition.left}px`,
            transform: 'translateX(-50%)',
            backgroundColor: '#D6C5E5',
            minWidth: '250px',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)'
          }}
        >
          Documentos asociados al elemento del presupuesto
          {/* Flecha hacia abajo */}
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #D6C5E5'
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default BudgetTable; 
