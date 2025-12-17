import React, { useRef, useEffect } from 'react';

interface NewItemRowProps {
  catIdx: number;
  subIdx: number;
  itemIdx: number;
  subcategoriaId: string;
  generateHierarchicalNumber: (catIdx: number, subIdx: number, itemIdx: number) => string;
  newItemDescripcion: string;
  setNewItemDescripcion: (value: string) => void;
  newItemCantidad: number;
  setNewItemCantidad: (value: number) => void;
  newItemCosto: number;
  setNewItemCosto: (value: number) => void;
  showAddItemInput: string | null;
  setShowAddItemInput: (id: string | null) => void;
  trySaveNewItem: (subcategoriaId: string) => void;
  selectedCell?: { row: number; col: number } | null;
  setSelectedCell?: (cell: { row: number; col: number } | null) => void;
  rowIdx: number;
  maxRowIdx?: number;
}

const editableCols = [1, 3, 4];

const getNextEditableCol = (currentCol: number, direction: 1 | -1) => {
  const idx = editableCols.indexOf(currentCol);
  if (idx === -1) return editableCols[0];
  let nextIdx = idx + direction;
  if (nextIdx < 0) nextIdx = 0;
  if (nextIdx >= editableCols.length) nextIdx = editableCols.length - 1;
  return editableCols[nextIdx];
};

const NewItemRow: React.FC<NewItemRowProps> = ({
  catIdx,
  subIdx,
  itemIdx,
  subcategoriaId,
  generateHierarchicalNumber,
  newItemDescripcion,
  setNewItemDescripcion,
  newItemCantidad,
  setNewItemCantidad,
  newItemCosto,
  setNewItemCosto,
  showAddItemInput,
  setShowAddItemInput,
  trySaveNewItem,
  selectedCell,
  setSelectedCell,
  rowIdx,
  maxRowIdx,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCell?.row === rowIdx) {
      if (selectedCell.col === 1) nameInputRef.current?.focus();
      if (selectedCell.col === 3) quantityInputRef.current?.focus();
      if (selectedCell.col === 4) priceInputRef.current?.focus();
    }
  }, [selectedCell, rowIdx]);
  
  const handleKeyDown = (e: React.KeyboardEvent, col: number) => {
    if (!setSelectedCell) return;
  
    if (e.key === 'Enter') {
      trySaveNewItem(subcategoriaId);
      return;
    }
  
    let nextCol = col;
    if (e.key === 'ArrowUp') {
      setSelectedCell({ row: Math.max(rowIdx - 1, 0), col });
    } else if (e.key === 'ArrowDown' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.min(rowIdx + 1, maxRowIdx), col });
    } else if (e.key === 'ArrowLeft') {
      nextCol = getNextEditableCol(col, -1);
      setSelectedCell({ row: rowIdx, col: nextCol });
    } else if (e.key === 'ArrowRight') {
      nextCol = getNextEditableCol(col, 1);
      setSelectedCell({ row: rowIdx, col: nextCol });
    } else if (e.key === 'Tab') {
      e.preventDefault();
      nextCol = getNextEditableCol(col, e.shiftKey ? -1 : 1);
      setSelectedCell({ row: rowIdx, col: nextCol });
    }
  };

  const getCellClass = (col: number) => {
    let baseClass = "px-6 py-2 text-xs";
    if (selectedCell?.row === rowIdx && selectedCell?.col === col) {
      return `${baseClass} border-2 border-black`;
    }
    return baseClass;
  }

  return (
    <tr style={{ background: '#F5F5F5' }}>
              <td className="px-3 py-2 text-xs">{generateHierarchicalNumber(catIdx, subIdx, itemIdx)}</td>
      <td className={getCellClass(1)}>
        <input
          ref={nameInputRef}
          type="text"
          value={newItemDescripcion && showAddItemInput === subcategoriaId ? newItemDescripcion : ''}
          onChange={e => {
            setShowAddItemInput(subcategoriaId);
            setNewItemDescripcion(e.target.value);
          }}
          placeholder="Nombre del Item"
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-full"
          onFocus={() => setSelectedCell && setSelectedCell({ row: rowIdx, col: 1 })}
          onKeyDown={e => handleKeyDown(e, 1)}
        />
      </td>
      <td className="px-6 py-2 text-xs"></td>
      <td className={getCellClass(3)}>
        <input
          ref={quantityInputRef}
          type="number"
          value={newItemCantidad && showAddItemInput === subcategoriaId ? newItemCantidad : ''}
          onChange={e => {
            setShowAddItemInput(subcategoriaId);
            setNewItemCantidad(Number(e.target.value));
          }}
          placeholder="Cantidad"
          min="1"
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-full no-arrows"
          onFocus={() => setSelectedCell && setSelectedCell({ row: rowIdx, col: 3 })}
          onKeyDown={e => handleKeyDown(e, 3)}
        />
      </td>
      <td className={getCellClass(4)}>
        <input
          ref={priceInputRef}
          type="number"
          value={newItemCosto && showAddItemInput === subcategoriaId ? newItemCosto : ''}
          onChange={e => {
            setShowAddItemInput(subcategoriaId);
            setNewItemCosto(Number(e.target.value));
          }}
          placeholder="Precio Unitario"
          min="0"
          step="0.01"
          className="bg-transparent border-none focus:outline-none text-xs w-full no-arrows"
          onFocus={() => setSelectedCell && setSelectedCell({ row: rowIdx, col: 4 })}
          onKeyDown={e => handleKeyDown(e, 4)}
        />
      </td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
    </tr>
  );
};

export default NewItemRow; 