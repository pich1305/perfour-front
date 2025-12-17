'use client';

import { useState, useEffect } from 'react';
import { TaskPackage, PackageType } from '@/types';

interface TaskPackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<TaskPackage>) => void;
  initialData?: TaskPackage | null;
  mode: 'create' | 'edit';
}

export function TaskPackageFormModal({ isOpen, onClose, onSubmit, initialData, mode }: TaskPackageFormModalProps) {
  const [formData, setFormData] = useState<Partial<TaskPackage>>({});
  const isEdit = mode === 'edit';

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          name: '',
          description: '',
          packageType: PackageType.COMPLETE,
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      onSubmit({ name: formData.name });
    } else {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{mode === 'create' ? 'Nuevo Paquete de Tareas' : 'Editar Paquete'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Paquete</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isEdit}
            />
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">Por ahora, solo se puede editar el nombre del paquete.</p>
            )}
          </div>

          <div>
            <label htmlFor="packageType" className="block text-sm font-medium text-gray-700">Tipo de Paquete</label>
            <select
              id="packageType"
              name="packageType"
              value={formData.packageType || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              disabled={isEdit}
            >
              {Object.values(PackageType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {isEdit && (
              <p className="text-xs text-gray-400 mt-1">Por ahora, el tipo no se puede cambiar desde aquí.</p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {mode === 'create' ? 'Crear Paquete' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


