import React, { useRef, useEffect } from 'react';

interface NewSubcategoryRowProps {
  catIdx: number;
  subIdx: number;
  categoriaId: string;
  generateHierarchicalNumber: (catIdx: number, subIdx: number) => string;
  newSubcategoriaDescripcion: string;
  setNewSubcategoriaDescripcion: (value: string) => void;
  showAddSubcategoriaInput: string | null;
  setShowAddSubcategoriaInput: (id: string | null) => void;
  handleAddSubcategoriaSubmit: (e: React.KeyboardEvent, categoriaId: string) => void;
  selectedCell?: { row: number; col: number } | null;
  setSelectedCell?: (cell: { row: number; col: number } | null) => void;
  rowIdx: number;
  maxRowIdx?: number;
}

const NewSubcategoryRow: React.FC<NewSubcategoryRowProps> = ({
  catIdx,
  subIdx,
  categoriaId,
  generateHierarchicalNumber,
  newSubcategoriaDescripcion,
  setNewSubcategoriaDescripcion,
  showAddSubcategoriaInput,
  setShowAddSubcategoriaInput,
  handleAddSubcategoriaSubmit,
  selectedCell,
  setSelectedCell,
  rowIdx,
  maxRowIdx,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCell?.row === rowIdx && selectedCell.col === 1) {
      nameInputRef.current?.focus();
    }
  }, [selectedCell, rowIdx]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!setSelectedCell) return;
  
    if (e.key === 'Enter' && newSubcategoriaDescripcion.trim()) {
      handleAddSubcategoriaSubmit(e, categoriaId);
      return;
    }
  
    if (e.key === 'ArrowUp') {
      setSelectedCell({ row: Math.max(rowIdx - 1, 0), col: 1 });
    } else if (e.key === 'ArrowDown' && typeof maxRowIdx === 'number') {
      setSelectedCell({ row: Math.min(rowIdx + 1, maxRowIdx), col: 1 });
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Tab') {
      e.preventDefault();
      setSelectedCell({ row: rowIdx, col: 1 });
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
      <td className="px-3 py-2 text-xs">{generateHierarchicalNumber(catIdx, subIdx)}</td>
      <td className={getCellClass(1)}>
        <input
          ref={nameInputRef}
          type="text"
          value={newSubcategoriaDescripcion && showAddSubcategoriaInput === categoriaId ? newSubcategoriaDescripcion : ''}
          onChange={e => {
            setShowAddSubcategoriaInput(categoriaId);
            setNewSubcategoriaDescripcion(e.target.value);
          }}
          placeholder="Nombre de la Subcategoría"
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-full"
          onFocus={() => setSelectedCell && setSelectedCell({ row: rowIdx, col: 1 })}
          onKeyDown={handleKeyDown}
        />
      </td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
      <td className="px-6 py-2 text-xs"></td>
    </tr>
  );
};

export default NewSubcategoryRow; 