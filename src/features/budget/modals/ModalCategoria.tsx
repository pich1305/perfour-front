import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ModalCategoriaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nombre: string) => void;
}

const ModalCategoria: React.FC<ModalCategoriaProps> = ({ isOpen, onClose, onSave }) => {
  const [nombre, setNombre] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim()) {
      onSave(nombre);
      setNombre('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Nueva Categoría</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción de la Categoría
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
              placeholder="Descripción de la Categoría"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCategoria; 