import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Trash2, ChevronDown } from 'lucide-react';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface ItemRowProps {
  item: any;
  catIdx: number;
  subIdx: number;
  itemIdx: number;
  generateHierarchicalNumber: (...args: any[]) => string;
  editingElement: any;
  startEditing: (...args: any[]) => void;
  saveEditing: (...args: any[]) => void;
  cancelEditing: (...args: any[]) => void;
  handleInlineEdit: (...args: any[]) => void;
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
  onOpenItemSidebar?: (item: any) => void;
  isDeleting?: boolean;
}

const totalCols = 9;
const editableCols = [1, 3, 4]; // nombre, cantidad, precio unitario (se quita unidad)

const predefinedUnits = ['m²', 'm', 'kg', 'g', 'mg', 'L', 'U.', 'Glb.', 'Hs.'];

// Cambia la función para obtener el siguiente índice de columna editable
const getNextEditableCol = (currentCol: number, direction: 1 | -1) => {
  const idx = editableCols.indexOf(currentCol);
  if (idx === -1) return editableCols[0];
  let nextIdx = idx + direction;
  if (nextIdx < 0) nextIdx = 0;
  if (nextIdx >= editableCols.length) nextIdx = editableCols.length - 1;
  return editableCols[nextIdx];
};

const ItemRow: React.FC<ItemRowProps> = ({
  item,
  catIdx,
  subIdx,
  itemIdx,
  generateHierarchicalNumber,
  editingElement,
  startEditing,
  saveEditing,
  cancelEditing,
  handleInlineEdit,
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
  onOpenItemSidebar,
  isDeleting,
}) => {
  const cellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [nameWidth, setNameWidth] = useState<number | undefined>(undefined);
  const nameSpanRef = useRef<HTMLSpanElement | null>(null);
  
  const [showUnitMenu, setShowUnitMenu] = useState(false);
  const [unitMenuPosition, setUnitMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const unitButtonRef = useRef<HTMLButtonElement | null>(null);
  const unitMenuRef = useRef<HTMLDivElement | null>(null);
  const [isEditingCustomUnit, setIsEditingCustomUnit] = useState(false);

  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado local para mantener valores editados visualmente
  const [localValues, setLocalValues] = useState<{
    name?: string;
    unitOfMeasure?: string;
    quantity?: number;
    unitPrice?: number;
    totalAmount?: number;
  }>({});

  // Función para obtener el valor actual (local o del item)
  const getCurrentValue = (field: 'name' | 'unitOfMeasure' | 'quantity' | 'unitPrice') => {
    // Si hay un valor local, usarlo
    if (localValues[field] !== undefined) {
      return localValues[field]!;
    }
    // Si se está editando actualmente, usar el valor en edición
    const isCurrentlyEditing = editingCell?.row === rowIdx && editingElement?.field === field;
    if (isCurrentlyEditing) {
      if (field === 'quantity' || field === 'unitPrice') {
        return Number(editingElement.value) || 0;
      } else {
        return String(editingElement.value) || '';
      }
    }
    // Sino, usar el valor del item
    if (field === 'quantity' || field === 'unitPrice') {
      return item[field] || 0;
    } else {
      return item[field] || '';
    }
  };

  // Función para calcular el total en tiempo real (sin efectos secundarios)
  const calculateLiveTotal = () => {
    const quantity = getCurrentValue('quantity');
    const unitPrice = getCurrentValue('unitPrice');
    return quantity * unitPrice;
  };

  // Función para obtener el total actual que debe mostrarse
  const getDisplayTotal = () => {
    // Si hay un total local guardado, usarlo
    if (localValues.totalAmount !== undefined) {
      return localValues.totalAmount;
    }
    
    // Si se está editando cantidad o precio, calcular en tiempo real
    const isEditingQuantityOrPrice = 
      (editingCell?.row === rowIdx && (editingCell?.col === 3 || editingCell?.col === 4));
    
    if (isEditingQuantityOrPrice) {
      return calculateLiveTotal();
    }
    
    // Sino, usar el total del item original
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  // Función helper para actualizar unidad con valores locales
  const handleUnitChange = (newUnit: string) => {
    // Actualizar valor local inmediatamente para evitar parpadeo
    setLocalValues(prev => ({ 
      ...prev, 
      unitOfMeasure: newUnit
    }));
    
    // Enviar al backend
    handleInlineEdit(item.id, 'unitOfMeasure', newUnit);
  };

  useEffect(() => {
    if (selectedCell && selectedCell.row === rowIdx && cellRefs.current[selectedCell.col] && (!editingCell || editingCell.row !== rowIdx || editingCell.col !== selectedCell.col)) {
      cellRefs.current[selectedCell.col]?.focus();
    }
  }, [selectedCell, rowIdx, editingCell]);

  useEffect(() => {
    if (editingCell?.row === rowIdx && editingCell?.col === 1 && nameSpanRef.current) {
      setNameWidth(nameSpanRef.current.offsetWidth);
    }
  }, [editingCell, rowIdx, item.name]);

  // Efecto para inicializar valores locales cuando se empieza a editar
  useEffect(() => {
    if (editingCell?.row === rowIdx && editingCell) {
      const col = editingCell.col;
      
      // Si se empieza a editar nombre y no hay valor local, inicializarlo
      if (col === 1 && localValues.name === undefined) {
        setLocalValues(prev => ({ 
          ...prev, 
          name: item.name || ''
        }));
      }
      
      // Si se empieza a editar unidad y no hay valor local, inicializarlo
      if (col === 2 && localValues.unitOfMeasure === undefined) {
        setLocalValues(prev => ({ 
          ...prev, 
          unitOfMeasure: item.unitOfMeasure || ''
        }));
      }
      
      // Si se empieza a editar cantidad y no hay valor local, inicializarlo
      if (col === 3 && localValues.quantity === undefined) {
        const currentUnitPrice = localValues.unitPrice !== undefined ? localValues.unitPrice : (item.unitPrice || 0);
        setLocalValues(prev => ({ 
          ...prev, 
          quantity: item.quantity || 0,
          totalAmount: (item.quantity || 0) * currentUnitPrice
        }));
      }
      
      // Si se empieza a editar precio y no hay valor local, inicializarlo
      if (col === 4 && localValues.unitPrice === undefined) {
        const currentQuantity = localValues.quantity !== undefined ? localValues.quantity : (item.quantity || 0);
        setLocalValues(prev => ({ 
          ...prev, 
          unitPrice: item.unitPrice || 0,
          totalAmount: currentQuantity * (item.unitPrice || 0)
        }));
      }
    }
  }, [editingCell?.row, editingCell?.col, rowIdx, item.name, item.unitOfMeasure, item.quantity, item.unitPrice]);

  // Efecto para limpiar valores locales cuando el item se actualiza desde el backend
  useEffect(() => {
    // Solo ejecutar si no estamos editando actualmente
    if (editingCell?.row === rowIdx) return;
    
    setLocalValues(prev => {
      const newLocalValues = { ...prev };
      let hasChanges = false;

      // Limpiar name si coincide con el valor del backend
      if (prev.name !== undefined && prev.name === (item.name || '')) {
        delete newLocalValues.name;
        hasChanges = true;
      }
      
      // Limpiar unitOfMeasure si coincide con el valor del backend
      if (prev.unitOfMeasure !== undefined && prev.unitOfMeasure === (item.unitOfMeasure || '')) {
        delete newLocalValues.unitOfMeasure;
        hasChanges = true;
      }

      // Limpiar quantity si coincide con el valor del backend
      if (prev.quantity !== undefined && Math.abs(prev.quantity - (item.quantity || 0)) < 0.001) {
        delete newLocalValues.quantity;
        hasChanges = true;
      }
      
      // Limpiar unitPrice si coincide con el valor del backend  
      if (prev.unitPrice !== undefined && Math.abs(prev.unitPrice - (item.unitPrice || 0)) < 0.001) {
        delete newLocalValues.unitPrice;
        hasChanges = true;
      }
      
      // Limpiar totalAmount si ya no hay valores locales de quantity/unitPrice o si coincide
      const expectedTotal = (item.quantity || 0) * (item.unitPrice || 0);
      if (prev.totalAmount !== undefined && 
          ((!newLocalValues.quantity && !newLocalValues.unitPrice) || 
           Math.abs(prev.totalAmount - expectedTotal) < 0.001)) {
        delete newLocalValues.totalAmount;
        hasChanges = true;
      }

      return hasChanges ? newLocalValues : prev;
    });
  }, [item.name, item.unitOfMeasure, item.quantity, item.unitPrice, editingCell?.row, rowIdx]);

  const handleCellKeyDown = (e: React.KeyboardEvent, col: number) => {
    if (!setSelectedCell || !setEditingCell || rowIdx === undefined) return;
    if (!editableCols.includes(col)) return; // Solo permitir navegación en columnas editables
    if (editingCell && editingCell.row === rowIdx && editingCell.col === col) {
      if (e.key === 'Enter') {
        saveEditing();
        if (setEditingCell) setEditingCell(null);
      } else if (e.key === 'Escape') {
        cancelEditing();
        if (setEditingCell) setEditingCell(null);
      }
      return;
    }
    let nextCol = col;
    if (e.key === 'ArrowRight') {
      nextCol = getNextEditableCol(col, 1);
      setSelectedCell({ row: rowIdx, col: nextCol });
    } else if (e.key === 'ArrowLeft') {
      nextCol = getNextEditableCol(col, -1);
      setSelectedCell({ row: rowIdx, col: nextCol });
    } else if (e.key === 'ArrowDown' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.min(rowIdx + 1, maxRowIdx), col });
    } else if (e.key === 'ArrowUp' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.max(rowIdx - 1, 0), col });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        nextCol = getNextEditableCol(col, -1);
        setSelectedCell({ row: rowIdx, col: nextCol });
      } else {
        nextCol = getNextEditableCol(col, 1);
        setSelectedCell({ row: rowIdx, col: nextCol });
      }
    } else if ((e.key === 'Enter' || e.key === 'F2') && editableCols.includes(col)) {
      setEditingCell({ row: rowIdx, col });
      if (col === 1) startEditing(item.id, 'name', item.name);
      if (col === 3) startEditing(item.id, 'quantity', item.quantity || 0);
      if (col === 4) startEditing(item.id, 'unitPrice', item.unitPrice || 0);
    }
  };

  // Función para obtener el estilo de selección de una celda
  const getCellSelectionStyle = (col: number) => {
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
      onClick={() => { if (onOpenItemSidebar) onOpenItemSidebar(item); }}
    >
      {generateHierarchicalNumber(catIdx, subIdx, itemIdx)}
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
        startEditing(item.id, 'name', item.name);
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
              
              startEditing(item.id, 'name', e.target.value);
            }}
            onBlur={() => { 
              // Los valores locales ya se actualizaron en onChange, solo guardar al backend
              saveEditing(); 
              setEditingCell && setEditingCell(null); 
            }}
            onKeyDown={e => handleCellKeyDown(e, 1)}
            autoFocus
            className="bg-transparent border-none focus:ring-0 focus:outline-none font-medium text-xs px-0 py-0 m-0 align-middle whitespace-nowrap"
            style={{ width: nameWidth ? `${nameWidth}px` : '100%', minWidth: 0, boxSizing: 'border-box' }}
          />
        </div>
      ) : (
        <span ref={nameSpanRef}>{getCurrentValue('name')}</span>
      )}
    </td>,
    // Unidad (editable con menú)
    <td key="unidad" ref={el => { cellRefs.current[2] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    >
      {isEditingCustomUnit ? (
        <input
          type="text"
          defaultValue={predefinedUnits.includes(getCurrentValue('unitOfMeasure')) ? '' : getCurrentValue('unitOfMeasure')}
          onChange={(e) => {
            // Actualizar valor local inmediatamente para evitar parpadeo
            setLocalValues(prev => ({ 
              ...prev, 
              unitOfMeasure: e.target.value
            }));
          }}
          onBlur={(e) => {
            // Los valores locales ya se actualizaron en onChange, solo guardar al backend
            handleInlineEdit(item.id, 'unitOfMeasure', e.target.value);
            setIsEditingCustomUnit(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleInlineEdit(item.id, 'unitOfMeasure', e.currentTarget.value);
              setIsEditingCustomUnit(false);
            }
            if (e.key === 'Escape') {
              setIsEditingCustomUnit(false);
            }
          }}
          autoFocus
          className="bg-white border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:outline-none text-xs px-2 py-1 m-0 w-full rounded-md"
        />
      ) : (
        <button
          ref={unitButtonRef}
          onClick={(e) => {
            e.stopPropagation();
            if (!showUnitMenu) {
              const position = calculateMenuPosition(unitButtonRef);
              setUnitMenuPosition(position);
            }
            setShowUnitMenu(v => !v);
          }}
          className="w-full flex items-center justify-between text-left hover:bg-black/5 px-2 py-1 rounded-md"
          title="Cambiar unidad"
        >
          <span>{getCurrentValue('unitOfMeasure') || '-'}</span>
          <ChevronDown className="h-3 w-3 text-gray-400" />
        </button>
      )}
    </td>,
    // Cantidad (editable)
    <td key="cantidad" ref={el => { cellRefs.current[3] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs ${getCellSelectionStyle(3)}`}
      tabIndex={0}
      onClick={() => setSelectedCell && setSelectedCell({ row: rowIdx!, col: 3 })}
      onMouseDown={() => handleMouseDown && handleMouseDown(rowIdx!, 3)}
      onMouseEnter={() => handleMouseEnter && handleMouseEnter(rowIdx!, 3)}
      onKeyDown={e => handleCellKeyDown(e, 3)}
      onDoubleClick={() => {
        if (setEditingCell) setEditingCell({ row: rowIdx!, col: 3 });
        startEditing(item.id, 'quantity', item.quantity || 0);
      }}
    >
      {editingCell?.row === rowIdx && editingCell?.col === 3 ? (
        <div className="w-full h-full flex items-center">
          <input
            type="number"
            value={currency === 'PYG' ? (editingElement?.value !== undefined && editingElement?.value !== null && editingElement?.value !== '' ? Math.round(Number(editingElement?.value)) : '') : (editingElement?.value as number || '')}
            onChange={e => {
              let value = e.target.value;
              const numValue = currency === 'PYG' ? Number(value.replace(/\D/g, '')) : Number(value);
              
              // Actualizar valor local inmediatamente para evitar parpadeo
              const currentUnitPrice = localValues.unitPrice !== undefined ? localValues.unitPrice : (item.unitPrice || 0);
              setLocalValues(prev => ({ 
                ...prev, 
                quantity: numValue,
                totalAmount: numValue * currentUnitPrice
              }));
              
              if (currency === 'PYG') {
                // Solo permitir enteros
                value = value.replace(/\D/g, '');
                startEditing(item.id, 'quantity', Number(value));
              } else {
                startEditing(item.id, 'quantity', Number(value));
              }
            }}
            onBlur={e => {
              // Los valores locales ya se actualizaron en onChange, solo guardar al backend
              saveEditing();
              setEditingCell && setEditingCell(null);
            }}
            onKeyDown={e => handleCellKeyDown(e, 3)}
            autoFocus
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs px-0 py-0 m-0 align-middle whitespace-nowrap w-full no-arrows"
            style={{ minWidth: 0, boxSizing: 'border-box' }}
            min="0"
            step={currency === 'PYG' ? '1' : '0.01'}
            inputMode={currency === 'PYG' ? 'numeric' : 'decimal'}
          />
        </div>
      ) : (
        <span>{
          (() => {
            const displayValue = getCurrentValue('quantity');
            return displayValue !== undefined && displayValue !== null && displayValue !== ''
              ? Number(displayValue).toLocaleString('es-PY', { maximumFractionDigits: 0 })
              : '-';
          })()
        }</span>
      )}
    </td>,
    // Precio Unit. (editable)
    <td key="precio" ref={el => { cellRefs.current[4] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs ${getCellSelectionStyle(4)}`}
      tabIndex={0}
      onClick={() => setSelectedCell && setSelectedCell({ row: rowIdx!, col: 4 })}
      onMouseDown={() => handleMouseDown && handleMouseDown(rowIdx!, 4)}
      onMouseEnter={() => handleMouseEnter && handleMouseEnter(rowIdx!, 4)}
      onKeyDown={e => handleCellKeyDown(e, 4)}
      onDoubleClick={() => {
        if (setEditingCell) setEditingCell({ row: rowIdx!, col: 4 });
        startEditing(item.id, 'unitPrice', item.unitPrice || 0);
      }}
    >
      {editingCell?.row === rowIdx && editingCell?.col === 4 ? (
        <div className="w-full h-full flex items-center">
          <input
            type="number"
            value={currency === 'PYG' ? (editingElement?.value !== undefined && editingElement?.value !== null && editingElement?.value !== '' ? Math.round(Number(editingElement?.value)) : '') : (editingElement?.value as number || '')}
            onChange={e => {
              let value = e.target.value;
              const numValue = currency === 'PYG' ? Number(value.replace(/\D/g, '')) : Number(value);
              
              // Actualizar valor local inmediatamente para evitar parpadeo
              const currentQuantity = localValues.quantity !== undefined ? localValues.quantity : (item.quantity || 0);
              setLocalValues(prev => ({ 
                ...prev, 
                unitPrice: numValue,
                totalAmount: currentQuantity * numValue
              }));
              
              if (currency === 'PYG') {
                // Solo permitir enteros
                value = value.replace(/\D/g, '');
                startEditing(item.id, 'unitPrice', Number(value));
              } else {
                startEditing(item.id, 'unitPrice', Number(value));
              }
            }}
            onBlur={e => {
              // Los valores locales ya se actualizaron en onChange, solo guardar al backend
              saveEditing();
              setEditingCell && setEditingCell(null);
            }}
            onKeyDown={e => handleCellKeyDown(e, 4)}
            autoFocus
            className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs px-0 py-0 m-0 align-middle whitespace-nowrap w-full no-arrows"
            style={{ minWidth: 0, boxSizing: 'border-box' }}
            min="0"
            step={currency === 'PYG' ? '1' : '0.01'}
            inputMode={currency === 'PYG' ? 'numeric' : 'decimal'}
          />
        </div>
      ) : (
        <span>{
          (() => {
            const displayValue = getCurrentValue('unitPrice');
            return displayValue !== undefined && displayValue !== null && displayValue !== ''
              ? currency === 'PYG'
                ? Number(displayValue).toLocaleString('es-PY', { maximumFractionDigits: 0 })
                : Number(displayValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '-';
          })()
        }</span>
      )}
    </td>,
    // Total
    <td key="total" ref={el => { cellRefs.current[5] = el; }} 
      className={`px-6 py-2 whitespace-nowrap font-bold text-xs`}
    >
      <span className="flex items-center gap-1">
        <span>{currency === 'PYG' ? '₲' : '$'}</span>
        <span>
          {(() => {
            const total = getDisplayTotal();
            return currency === 'PYG' 
              ? total.toLocaleString('es-PY', { maximumFractionDigits: 0 })
              : total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          })()}
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
        title="Eliminar Item"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </td>
  ];

  // Función auxiliar para calcular posición del menú
  const calculateMenuPosition = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (!buttonRef.current) return null;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 240; // Altura máxima del menú (max-h-60)
    const spaceBelow = window.innerHeight - rect.bottom;

    let top;

    // Si no hay espacio suficiente abajo Y hay más espacio arriba, abrir hacia arriba
    if (spaceBelow < menuHeight && rect.top > spaceBelow) {
      top = rect.top + window.scrollY - menuHeight - 4;
    } else {
      // Por defecto, abrir hacia abajo
      top = rect.bottom + window.scrollY + 4;
    }

    return { 
      top: top, 
      left: rect.left + window.scrollX 
    };
  };

  // Cerrar los menús si se hace click fuera
  useEffect(() => {
    if (!showUnitMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (unitMenuRef.current && !unitMenuRef.current.contains(e.target as Node) &&
          unitButtonRef.current && !unitButtonRef.current.contains(e.target as Node)) {
        setShowUnitMenu(false);
      }
    };
    
    const handleScroll = (e: Event) => {
      // Solo cerrar el menú si el scroll NO está ocurriendo dentro del dropdown
      if (unitMenuRef.current && e.target && unitMenuRef.current.contains(e.target as Node)) {
        return; // No cerrar el menú si el scroll es dentro del dropdown
      }
      setShowUnitMenu(false);
    };
    
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showUnitMenu]);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors duration-200" style={{ background: '#F5F5F5' }}>
        {cells}
      </tr>

      {/* Menú de unidades */}
      {showUnitMenu && unitMenuPosition && ReactDOM.createPortal(
        <div
          ref={unitMenuRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] py-1 max-h-60 overflow-y-auto"
          style={{
            position: 'absolute',
            top: `${unitMenuPosition.top}px`,
            left: `${unitMenuPosition.left}px`,
          }}
        >
          {predefinedUnits.map(unit => (
            <button
              key={unit}
              onClick={() => {
                handleUnitChange(unit);
                setShowUnitMenu(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
            >{unit}</button>
          ))}
          <div className="border-t border-gray-100 my-1"></div>
          <button
            onClick={() => {
              setShowUnitMenu(false);
              setIsEditingCustomUnit(true);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
          >
            Otra...
          </button>
        </div>,
        document.body
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          confirmDeleteElement(item.id);
          setShowDeleteModal(false);
        }}
        title="Eliminar Item"
        message="¿Estás seguro de que quieres eliminar el item"
        elementName={item.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ItemRow; 