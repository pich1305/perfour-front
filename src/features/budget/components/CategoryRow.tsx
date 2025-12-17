import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Trash2, ChevronDown } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface CategoryRowProps {
  categoria: any;
  catIdx: number;
  generateHierarchicalNumber: (...args: any[]) => string;
  getCategoryBackgroundColor: (...args: any[]) => string;
  editingElement: any;
  startEditing: (...args: any[]) => void;
  saveEditing: (...args: any[]) => void;
  cancelEditing: (...args: any[]) => void;
  handleInlineEdit: (...args: any[]) => void;
  confirmDeleteElement: (elementId: string) => void;
  handleCloneElement: (elementId: string) => void;
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

const totalCols = 9; // Total de columnas en la tabla
const editableCols = [1, 2]; // Índices de columnas editables: nombre y tipo

const CategoryRow: React.FC<CategoryRowProps> = ({
  categoria,
  catIdx,
  generateHierarchicalNumber,
  getCategoryBackgroundColor,
  editingElement,
  startEditing,
  saveEditing,
  cancelEditing,
  handleInlineEdit,
  confirmDeleteElement,
  handleCloneElement,
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
  // refs para celdas
  const cellRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [typeMenuPosition, setTypeMenuPosition] = useState<{ top: number; left: number; opensUpward?: boolean } | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number; opensUpward?: boolean } | null>(null);
  const typeButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const typeMenuRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  
  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado local para mantener valores editados visualmente
  const [localValues, setLocalValues] = useState<{
    name?: string;
    type?: string;
  }>({});

  // Función para obtener el valor actual (local o del item)
  const getCurrentValue = (field: 'name' | 'type') => {
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
    return categoria[field] || '';
  };

  // Función helper para actualizar tipo con valores locales
  const handleTypeChange = (newType: string) => {
    // Actualizar valor local inmediatamente para evitar parpadeo
    setLocalValues(prev => ({ 
      ...prev, 
      type: newType
    }));
    
    // Enviar al backend
    handleInlineEdit(categoria.id, 'type', newType);
  };

  // Efecto para enfocar la celda seleccionada
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
          name: categoria.name || ''
        }));
      }
    }
  }, [editingCell?.row, editingCell?.col, rowIdx, categoria.name]);

  // Efecto para limpiar valores locales cuando el item se actualiza desde el backend
  useEffect(() => {
    // Solo ejecutar si no estamos editando actualmente
    if (editingCell?.row === rowIdx) return;
    
    setLocalValues(prev => {
      const newLocalValues = { ...prev };
      let hasChanges = false;

      // Limpiar name si coincide con el valor del backend
      if (prev.name !== undefined && prev.name === (categoria.name || '')) {
        delete newLocalValues.name;
        hasChanges = true;
      }
      
      // Limpiar type si coincide con el valor del backend
      if (prev.type !== undefined && prev.type === (categoria.type || '')) {
        delete newLocalValues.type;
        hasChanges = true;
      }

      return hasChanges ? newLocalValues : prev;
    });
  }, [categoria.name, categoria.type, editingCell?.row, rowIdx]);

  // Handlers Excel-like
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
      startEditing(categoria.id, 'name', categoria.name);
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

  // Función auxiliar para calcular posición del menú
  const calculateMenuPosition = (buttonRef: React.RefObject<HTMLButtonElement | null>) => {
    if (!buttonRef.current) return null;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuWidth = 200; // Ancho aproximado del menú
    const menuHeight = 160; // Altura aproximada del menú
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;
    const margin = 8; // Margen de seguridad

    let top;
    let left;

    // Calcular posición vertical (arriba o abajo)
    if (spaceBelow < menuHeight && rect.top > spaceBelow) {
      // Abrir hacia arriba - PEGADO al botón (superpuesto ligeramente)
      top = rect.top + window.scrollY - menuHeight + rect.height + 2; // Se superpone con el botón
    } else {
      // Abrir hacia abajo
      top = rect.bottom + window.scrollY + margin;
    }

    // Calcular posición horizontal (izquierda o derecha del botón)
    if (spaceRight < menuWidth) {
      // Si no hay espacio a la derecha, alinear el menú por la derecha del botón
      left = rect.right + window.scrollX - menuWidth;
    } else {
      // Si hay espacio, alinear por la izquierda del botón
      left = rect.left + window.scrollX;
    }

    // Asegurar que no se salga del viewport por la izquierda
    left = Math.max(margin, left);
    
    // Asegurar que no se salga del viewport por la derecha
    left = Math.min(window.innerWidth - menuWidth - margin, left);

    // Determinar si se abre hacia arriba para ajustar el transform origin
    const opensUpward = spaceBelow < menuHeight && rect.top > spaceBelow;

    return {
      top: Math.max(margin, top),
      left: left,
      opensUpward: opensUpward
    };
  };

  // Función auxiliar para ejecutar una acción y luego cerrar el menú
  const handleMenuAction = (action: () => void, menuType: 'type' | 'action') => {
    action();
    if (menuType === 'type') {
      setShowTypeMenu(false);
    } else {
      setShowActionMenu(false);
    }
  };

  // Renderizado de celdas
  const cells = [
    // Nº
    <td key="num" ref={el => { cellRefs.current[0] = el; }} 
      className={`px-3 py-2 whitespace-nowrap font-bold text-gray-700 text-xs`}
    >
      {generateHierarchicalNumber(catIdx)}
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
        startEditing(categoria.id, 'name', categoria.name);
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
              
              startEditing(categoria.id, 'name', e.target.value);
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
            ? (categoria.total_amount || 0).toLocaleString('es-PY', { maximumFractionDigits: 0 })
            : (categoria.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </span>
    </td>,
    // Documentos
    <td key="docs" ref={el => { cellRefs.current[6] = el; }} 
      className={`px-6 py-2 whitespace-nowrap text-xs`}
    ></td>,
    // Acciones (menú contextual)
    <td key="acciones" ref={el => { cellRefs.current[7] = el; }} 
      className={`px-1 py-2 whitespace-nowrap text-xs relative`}
    >
      <div className="flex items-center justify-start gap-1 w-full">
        {/* Botón del tipo de categoría */}
        <button
          className={
            'flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 hover:opacity-80 flex-shrink-0 ' +
            (getCurrentValue('type') === 'PRODUCT' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
            getCurrentValue('type') === 'SERVICE' ? 'bg-lilac-200 text-purple-800 hover:bg-lilac-300' :
            getCurrentValue('type') === 'HONORARIES' ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' :
            getCurrentValue('type') === 'TAXES' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
            getCurrentValue('type') === 'UNEXPECTED' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' :
            'bg-gray-100 text-gray-800 hover:bg-gray-200')
          }
          ref={typeButtonRef}
          onClick={e => {
            e.stopPropagation();
            if (!showTypeMenu) {
              const position = calculateMenuPosition(typeButtonRef);
              setTypeMenuPosition(position);
            }
            setShowTypeMenu(v => !v);
            setShowActionMenu(false); // Cerrar el otro menú si está abierto
          }}
          title="Cambiar tipo de categoría"
        >
          <span className="flex items-center">
             {getCurrentValue('type')?.charAt(0).toUpperCase() + getCurrentValue('type')?.slice(1).toLowerCase()}
            <ChevronDown className="h-3 w-3 text-gray-500 ml-1" />
          </span>
          
        </button>
        
        {/* Botón de acciones (3 puntos) */}
        <button
          className="w-8 h-8 relative text-gray-700 hover:brightness-110 rounded-full transition-all duration-200"
          style={{ backgroundColor: '#D6C5E5' }}
          title="Acciones"
          ref={actionButtonRef}
          onClick={e => {
            e.stopPropagation();
            if (!showActionMenu) {
              const position = calculateMenuPosition(actionButtonRef);
              setActionMenuPosition(position);
            }
            setShowActionMenu(v => !v);
            setShowTypeMenu(false); // Cerrar el otro menú si está abierto
          }}
        >
          <span style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 14,
            fontWeight: 'bold',
            lineHeight: 1
          }}>⋯</span>
        </button>
      </div>
      
      {/* Menú de tipos de categoría */}
      {showTypeMenu && typeMenuPosition && ReactDOM.createPortal(
        <div
          ref={typeMenuRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-96 overflow-y-auto min-w-[180px] max-w-[240px] transform transition-all duration-200 ease-out"
          style={{
            position: 'absolute',
            top: `${typeMenuPosition.top}px`,
            left: `${typeMenuPosition.left}px`,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
            opacity: showTypeMenu ? 1 : 0,
            transform: showTypeMenu ? 'scale(1) translateY(0)' : `scale(0.95) translateY(${typeMenuPosition?.opensUpward ? '10px' : '-10px'})`,
            transformOrigin: typeMenuPosition?.opensUpward ? 'bottom left' : 'top left'
          }}
        >
          <div className="px-4 py-2 text-xs text-gray-500 border-b border-black">Cambiar tipo de categoría</div>
          <button
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-black ${getCurrentValue('type') === 'PRODUCT' ? 'bg-blue-50 font-bold text-blue-800' : ''}`}
            onClick={() => handleMenuAction(() => handleTypeChange('PRODUCT'), 'type')}
          >Producto</button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-black ${getCurrentValue('type') === 'SERVICE' ? 'bg-lilac-100 font-bold text-purple-800' : ''}`}
            onClick={() => handleMenuAction(() => handleTypeChange('SERVICE'), 'type')}
          >Servicio</button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-black ${getCurrentValue('type') === 'HONORARIES' ? 'bg-indigo-50 font-bold text-indigo-800' : ''}`}
            onClick={() => handleMenuAction(() => handleTypeChange('HONORARIES'), 'type')}
          >Honorarios</button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-b border-black ${getCurrentValue('type') === 'TAXES' ? 'bg-red-50 font-bold text-red-800' : ''}`}
            onClick={() => handleMenuAction(() => handleTypeChange('TAXES'), 'type')}
          >Impuestos</button>
          <button
            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${getCurrentValue('type') === 'UNEXPECTED' ? 'bg-orange-50 font-bold text-orange-800' : ''}`}
            onClick={() => handleMenuAction(() => handleTypeChange('UNEXPECTED'), 'type')}
          >Imprevistos</button>
        </div>,
        document.body
      )}
      
      {/* Menú de acciones */}
      {showActionMenu && actionMenuPosition && ReactDOM.createPortal(
        <div
          ref={actionMenuRef}
          className="bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-[180px] max-w-[200px] flex flex-col transform transition-all duration-200 ease-out"
          style={{
            position: 'absolute',
            top: `${actionMenuPosition.top}px`,
            left: `${actionMenuPosition.left}px`,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
            opacity: showActionMenu ? 1 : 0,
            transform: showActionMenu ? 'scale(1) translateY(0)' : `scale(0.95) translateY(${actionMenuPosition?.opensUpward ? '10px' : '-10px'})`,
            transformOrigin: actionMenuPosition?.opensUpward ? 'bottom left' : 'top left'
          }}
        >
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 border-b border-black"
            onClick={() => handleMenuAction(() => handleCloneElement(categoria.id), 'action')}
          >
            Duplicar
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 border-b border-black"
            onClick={() => { /* Por ahora no hace nada */ }}
            disabled
            style={{ cursor: 'not-allowed', opacity: 0.7 }}
          >
            Compartir
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700 border-b border-black"
            onClick={() => { /* Por ahora no hace nada */ }}
            disabled
            style={{ cursor: 'not-allowed', opacity: 0.7 }}
          >
            Generar
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
            onClick={() => handleMenuAction(() => setShowDeleteModal(true), 'action')}
          >
            Eliminar categoría
          </button>
        </div>,
        document.body
      )}
    </td>
  ];

  // Cerrar los menús si se hace click fuera de los botones y menús
  useEffect(() => {
    if (!showTypeMenu && !showActionMenu) return;
    
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Verificar si el click fue fuera del menú de tipos
      if (showTypeMenu && 
          typeButtonRef.current && 
          !typeButtonRef.current.contains(target) &&
          typeMenuRef.current && 
          !typeMenuRef.current.contains(target)) {
        setShowTypeMenu(false);
      }
      
      // Verificar si el click fue fuera del menú de acciones
      if (showActionMenu && 
          actionButtonRef.current && 
          !actionButtonRef.current.contains(target) &&
          actionMenuRef.current && 
          !actionMenuRef.current.contains(target)) {
        setShowActionMenu(false);
      }
    };
    
    const handleScroll = (e: Event) => {
      // Solo cerrar los menús si el scroll NO está ocurriendo dentro de alguno de los dropdowns
      if ((typeMenuRef.current && e.target && typeMenuRef.current.contains(e.target as Node)) ||
          (actionMenuRef.current && e.target && actionMenuRef.current.contains(e.target as Node))) {
        return; // No cerrar los menús si el scroll es dentro de algún dropdown
      }
      setShowTypeMenu(false);
      setShowActionMenu(false);
    };
    
    window.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showTypeMenu, showActionMenu]);

  return (
    <>
      <tr className={`hover:brightness-110 transition-all duration-200 ${getCategoryBackgroundColor(categoria.type)}`}> 
        {cells}
      </tr>

      {/* Modal de confirmación de eliminación */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          confirmDeleteElement(categoria.id);
          setShowDeleteModal(false);
        }}
        title="Eliminar Categoría"
        message="¿Estás seguro de que quieres eliminar la categoría"
        elementName={categoria.name}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default CategoryRow; 

