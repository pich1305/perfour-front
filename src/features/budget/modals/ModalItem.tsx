import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BudgetElement } from '@/api/client/BudgetElementApiClient';

interface ModalItemProps {
  isOpen: boolean;
  onClose: () => void;
  subcategorias: BudgetElement[];
  onSave: (nombre: string, subcategoriaId: string, cantidad: number, precioUnitario: number) => void;
  preselectedSubcategoriaId?: string;
}

const ModalItem: React.FC<ModalItemProps> = ({ isOpen, onClose, subcategorias, onSave, preselectedSubcategoriaId }) => {
  const [nombre, setNombre] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState(preselectedSubcategoriaId || '');
  const [cantidad, setCantidad] = useState(1);
  const [precioUnitario, setPrecioUnitario] = useState(0);

  useEffect(() => {
    if (preselectedSubcategoriaId) {
      setSubcategoriaId(preselectedSubcategoriaId);
    }
  }, [preselectedSubcategoriaId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre.trim() && subcategoriaId) {
      onSave(nombre, subcategoriaId, cantidad, precioUnitario);
      setNombre('');
      setSubcategoriaId(preselectedSubcategoriaId || '');
      setCantidad(1);
      setPrecioUnitario(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70]">
      <div className="bg-white p-8 rounded-2xl w-[500px] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Nuevo Item</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          {!preselectedSubcategoriaId && (
            <div className="mb-4">
              <label htmlFor="subcategoria" className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                id="subcategoria"
                value={subcategoriaId}
                onChange={(e) => setSubcategoriaId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              >
                <option value="">Seleccione una subcategoría</option>
                {subcategorias.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Item
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="cantidad" className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad
            </label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              min="1"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Unitario
            </label>
            <input
              type="number"
              id="precio"
              value={precioUnitario}
              onChange={(e) => setPrecioUnitario(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              min="0"
              step="0.01"
              required
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

export default ModalItem; 