// src/components/project/parts/AssigneesModal.tsx
import React from 'react';
import type { TaskAssignee } from '@/api/client/VettelApiClient';

interface AssigneesModalProps {
  isOpen: boolean;
  loading: boolean;
  items: TaskAssignee[];
  onClose: () => void;
}

export function AssigneesModal({ isOpen, loading, items, onClose }: AssigneesModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-black">Asignados</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        {loading ? (
          <div className="py-6 text-center text-gray-600 text-sm">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="py-6 text-center text-gray-600 text-sm">No hay asignados</div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {items.map((a) => (
              <li key={a.id} className="py-2 flex items-center justify-between">
                <div className="text-sm text-gray-800">
                  Usuario: <span className="font-medium">{a.userId}</span>
                  <span className="ml-2 text-gray-500">({String(a.role).toLowerCase()})</span>
                </div>
                <div className="text-xs text-gray-500">{new Date(a.assignedAt as any).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-800">Cerrar</button>
        </div>
      </div>
    </div>
  );
}


