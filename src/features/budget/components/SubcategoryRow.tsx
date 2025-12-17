import React, { useRef, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface SubcategoryRowProps {
  subcategoria: any;
  catIdx: number;
  subIdx: number;
  generateHierarchicalNumber: (...args: any[]) => string;
  editingElement: any;
  startEditing: (...args: any[]) => void;
  saveEditing: (...args: any[]) => void;
  cancelEditing: (...args: any[]) => void;
  confirmDeleteElement: (elementId: string) => void;
  formatCurrency: (...args: any[]) => string;
  calculateTotal: (...args: any[]) => number;
  // Excel-like
  selectedCell?: { row: number; col: number } | null;
  setSelectedCell?: (cell: { row: number; col: number }) => void;
  editingCell?: { row: number; col: number } | null;
  setEditingCell?: (cell: { row: number; col: number } | null) => void;
  rowIdx?: number;
  maxRowIdx?: number;
  // Nuevas props para selección
  selectionRange?: { start: { row: number; col: number }; end: { row: number; col: number } } | null;
  isCellInSelection?: (row: number, col: number) => boolean;
  handleMouseDown?: (row: number, col: number) => void;
  handleMouseEnter?: (row: number, col: number) => void;
  currency?: string;
  isDeleting?: boolean;
}

const totalCols = 9;
const editableCols = [1]; // Solo nombre

const SubcategoryRow: React.FC<SubcategoryRowProps> = ({
  subcategoria,
  catIdx,
  subIdx,
  generateHierarchicalNumber,
  editingElement,
  startEditing,
  saveEditing,
  cancelEditing,
  confirmDeleteElement,
  formatCurrency,
  calculateTotal,
  selectedCell,
  setSelectedCell,
  editingCell,
  setEditingCell,
  rowIdx,
  maxRowIdx,
  selectionRange,
  isCellInSelection,
  handleMouseDown,
  handleMouseEnter,
  currency,
  isDeleting,
}) => {
  const cellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  console.log('subcategoria by eba', subcategoria);
  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado local para mantener valores editados visualmente
  const [localValues, setLocalValues] = useState<{
    name?: string;
  }>({});

  // Función para obtener el valor actual (local o del item)
  const getCurrentValue = (field: 'name') => {
    // Si hay un valor local, usarlo
    if (localValues[field] !== undefined) {
      return localValues[field]!;
    }
    // Si se está editando actualmente, usar el valor en edición
    const isCurrentlyEditing = editingCell?.row === rowIdx && editingElement?.field === field;
    if (isCurrentlyEditing) {
      return String(editingElement.value) || '';
    }
    // Sino, usar el valor del item
    return subcategoria[field] || '';
  };

  useEffect(() => {
    if (selectedCell && selectedCell.row === rowIdx && cellRefs.current[selectedCell.col] && (!editingCell || editingCell.row !== rowIdx || editingCell.col !== selectedCell.col)) {
      cellRefs.current[selectedCell.col]?.focus();
    }
  }, [selectedCell, rowIdx, editingCell]);

  // Efecto para inicializar valores locales cuando se empieza a editar
  useEffect(() => {
    if (editingCell?.row === rowIdx && editingCell) {
      const col = editingCell.col;
      
      // Si se empieza a editar nombre y no hay valor local, inicializarlo
      if (col === 1 && localValues.name === undefined) {
        setLocalValues(prev => ({ 
          ...prev, 
          name: subcategoria.name || ''
        }));
      }
    }
  }, [editingCell?.row, editingCell?.col, rowIdx, subcategoria.name]);

  // Efecto para limpiar valores locales cuando el item se actualiza desde el backend
  useEffect(() => {
    // Solo ejecutar si no estamos editando actualmente
    if (editingCell?.row === rowIdx) return;
    
    setLocalValues(prev => {
      const newLocalValues = { ...prev };
      let hasChanges = false;

      // Limpiar name si coincide con el valor del backend
      if (prev.name !== undefined && prev.name === (subcategoria.name || '')) {
        delete newLocalValues.name;
        hasChanges = true;
      }

      return hasChanges ? newLocalValues : prev;
    });
  }, [subcategoria.name, editingCell?.row, rowIdx]);

  // Cambia la función para obtener el siguiente índice de columna editable (solo columna 1)
  const getNextEditableCol = (currentCol: number, direction: 1 | -1) => 1;

  const handleCellKeyDown = (e: React.KeyboardEvent, col: number) => {
    if (!setSelectedCell || !setEditingCell || rowIdx === undefined) return;
    if (col !== 1) return; // Solo permitir navegación en columna nombre
    if (editingCell && editingCell.row === rowIdx && editingCell.col === col) {
      if (e.key === 'Enter') {
        saveEditing();
        setEditingCell(null);
      } else if (e.key === 'Escape') {
        cancelEditing();
        setEditingCell(null);
      }
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Tab') {
      e.preventDefault();
      setSelectedCell({ row: rowIdx, col: 1 });
    } else if (e.key === 'ArrowDown' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.min(rowIdx + 1, maxRowIdx), col: 1 });
    } else if (e.key === 'ArrowUp' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.max(rowIdx - 1, 0), col: 1 });
    } else if ((e.key === 'Enter' || e.key === 'F2') && col === 1) {
      setEditingCell({ row: rowIdx, col });
      startEditing(subcategoria.id, 'name', subcategoria.name);
    }
  };

  // Función para obtener el estilo de selección de una celda
  const getCellSelectionStyle = (col: number) => {
    if (col !== 1) return '';
    if (rowIdx === undefined) return '';
    
    // Verificar si está en selección de rango (ratón) O es la celda seleccionada (teclado)
    const isInSelection = isCellInSelection && isCellInSelection(rowIdx, col);
    const isSelectedCell = selectedCell?.row === rowIdx && selectedCell?.col === col;
    
    if (isInSelection || isSelectedCell) {
      return 'ring-2 ring-blue-500 ring-inset';
    }
    
    return '';
  };

  const cells = [
    // Nº
    <td key="num" ref={el => { cellRefs.current[0] = el; }} 
      className={`px-3 py-2 whitespace-nowrap font-bold text-gray-700 text-xs`}
    >
      {generateHierarchicalNumber(catIdx, subIdx)}
    </td>,
    // Nombre (editable)
    <td key="name" ref={el => { cellRefs.current[1] = el; }} 
      className={`px-6 py-2 whitespace-nowrap font-medium text-xs ${getCellSelectionStyle(1)}`}
      tabIndex={0}
      onClick={() => setSelectedCell && setSelectedCell({ row: rowIdx!, col: 1 })}
      onMouseDown={() => handleMouseDown && handleMouseDown(rowIdx!, 1)}
      onMouseEnter={() => handleMouseEnter && handleMouseEnter(rowIdx!, 1)}
      onKeyDown={e => handleCellKeyDown(e, 1)}
      onDoubleClick={() => {
        if (setEditingCell) setEditingCell({ row: rowIdx!, col: 1 });
        startEditing(subcategoria.id, 'name', subcategoria.name);
      }}
    >
      {editingCell?.row === rowIdx && editingCell?.col === 1 ? (
        <div className="w-full h-full flex items-center">
          <input
            type="text"
            value={editingElement?.value as string || ''}
            onChange={e => {
              // Actualizar valor local inmediatamente para evitar parpadeo
              setLocalValues(prev => ({ 
                ...prev, 
                name: e.target.value
              }));
              
              startEditing(subcategoria.id, 'name', e.target.value);
            }}
            onBlur={() => { 
              // Los valores locales ya se actualizaron en onChange, solo guardar al backend
              saveEditing(); 
              setEditingCell && setEditingCell(null); 
            }}
            onKeyDown={e => handleCellKeyDown(e, 1)}
            autoFocus
            className="bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-xs px-0 py-0 m-0 align-middle whitespace-nowrap w-full"
            style={{ minWidth: 0, boxSizing: 'border-box' }}
          />
        </div>
      ) : (
        <span>{getCurrentValue('name')}</span>
      )}
    </td>,
    // Unidad
    <td key="unidad" ref={el => { cellRefs.current[2] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    ></td>,
    // Cantidad
    <td key="cantidad" ref={el => { cellRefs.current[3] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    ></td>,
    // Precio Unit.
    <td key="precio" ref={el => { cellRefs.current[4] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    ></td>,
    // Total
    <td key="total" ref={el => { cellRefs.current[5] = el; }} 
      className={`px-6 py-2 whitespace-nowrap font-bold text-xs`}
    >
      <span className="flex items-center gap-1">
        <span>{currency === 'PYG' ? '₲' : '$'}</span>
        <span>
          {currency === 'PYG' 
            ? (subcategoria.total_amount || 0).toLocaleString('es-PY', { maximumFractionDigits: 0 })
            : (subcategoria.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </span>
    </td>,
    // Documentos
    <td key="docs" ref={el => { cellRefs.current[6] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    ></td>,
    // Acciones
    <td key="acciones" ref={el => { cellRefs.current[7] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    >
      <button
        onClick={() => setShowDeleteModal(true)}
        className="p-1 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
        title="Eliminar Subcategoría"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </td>
  ];

  return (
    <>
      <tr className="bg-gray-200 hover:bg-gray-300 transition-colors duration-200">
        {cells}
      </tr>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          confirmDeleteElement(subcategoria.id);
          setShowDeleteModal(false);
        }}
        title="Eliminar Subcategoría"
        message="¿Estás seguro de que quieres eliminar la subcategoría"
        elementName={subcategoria.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SubcategoryRow; 