import React, { useRef, useEffect } from 'react';

interface NewCategoryRowProps {
  catIdx: number;
  newCategoriaDescripcion: string;
  setNewCategoriaDescripcion: (value: string) => void;
  showAddCategoriaInput: boolean;
  setShowAddCategoriaInput: (value: boolean) => void;
  handleAddCategoriaSubmit: (e: React.KeyboardEvent) => void;
  selectedCell?: { row: number; col: number } | null;
  setSelectedCell?: (cell: { row: number; col: number } | null) => void;
  rowIdx: number;
  maxRowIdx?: number;
  isOnlyRow: boolean;
}

const NewCategoryRow: React.FC<NewCategoryRowProps> = ({
  catIdx,
  newCategoriaDescripcion,
  setNewCategoriaDescripcion,
  showAddCategoriaInput,
  setShowAddCategoriaInput,
  handleAddCategoriaSubmit,
  selectedCell,
  setSelectedCell,
  rowIdx,
  maxRowIdx,
  isOnlyRow,
}) => {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedCell?.row === rowIdx && selectedCell.col === 1) {
      nameInputRef.current?.focus();
    }
  }, [selectedCell, rowIdx]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!setSelectedCell) return;

    if (e.key === 'Enter' && newCategoriaDescripcion.trim()) {
      handleAddCategoriaSubmit(e);
      return;
    }

    if (e.key === 'ArrowUp' && !isOnlyRow) {
        setSelectedCell({ row: Math.max(rowIdx - 1, 0), col: 1 });
    } else if (e.key === 'ArrowDown' && typeof maxRowIdx === 'number' && !isOnlyRow) {
        // This is the last row, so no ArrowDown unless you want to loop
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
      <td className="px-3 py-2 text-xs">{catIdx + 1}</td>
      <td className={getCellClass(1)}>
        <input
          ref={nameInputRef}
          type="text"
          value={newCategoriaDescripcion}
          onChange={e => {
            setShowAddCategoriaInput(true);
            setNewCategoriaDescripcion(e.target.value);
          }}
          placeholder="Nombre de la Categoría"
          className="bg-transparent border-none focus:ring-0 focus:outline-none text-xs w-full"
          autoFocus={showAddCategoriaInput}
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

export default NewCategoryRow; 