// src/components/project/parts/PackagesList.tsx
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { TaskPackage } from '@/types/project';

interface PackagesListProps {
  items: TaskPackage[];
  onCreate: () => void;
  onShowTasks: (pkg: TaskPackage) => void;
  onEdit: (pkg: TaskPackage) => void;
  onDelete: (pkg: TaskPackage) => void;
}

export function PackagesList({ items, onCreate, onShowTasks, onEdit, onDelete }: PackagesListProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-black font-semibold">Paquetes de Tareas ({items.length})</h2>
        <button onClick={onCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Nuevo Paquete
        </button>
      </div>
      <div className="space-y-3">
        {items.map((pkg) => (
          <div key={pkg.id} className="border p-4 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">{pkg.name}</h3>
              <p className="text-sm text-gray-500">{pkg.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => onShowTasks(pkg)} className="p-2 hover:text-green-600" title="Ver Tareas">
                <Eye size={18} />
              </button>
              <button onClick={() => onEdit(pkg)} className="p-2 hover:text-blue-600" title="Editar">
                <Edit size={18} />
              </button>
              <button onClick={() => onDelete(pkg)} className="p-2 hover:text-red-600" title="Eliminar">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


