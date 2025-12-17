// src/features/tasks/components/AssigneesCell.tsx
import React from 'react';

interface AssigneesCellProps {
  count: number;
  isAssignedToMe: boolean;
  onAssignMe: () => void;
  onUnassignMe: () => void;
  onOpenList: () => void;
}

export function AssigneesCell({ count, isAssignedToMe, onAssignMe, onUnassignMe, onOpenList }: AssigneesCellProps) {
  if ((count ?? 0) <= 0) {
    return isAssignedToMe ? (
      <a href="#" className="text-red-600 hover:underline" onClick={(e) => { e.preventDefault(); onUnassignMe(); }}>Quitarme</a>
    ) : (
      <a href="#" className="text-blue-600 hover:underline" onClick={(e) => { e.preventDefault(); onAssignMe(); }}>Asignarme a mí</a>
    );
  }

  return (
    <button
      type="button"
      className="text-gray-800 underline-offset-2 hover:underline"
      onClick={() => onOpenList()}
    >
      {count} asignado{count === 1 ? '' : 's'}
    </button>
  );
}


