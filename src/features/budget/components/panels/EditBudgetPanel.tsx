"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, Star, MoreVertical } from 'lucide-react';
import { BudgetApiClient } from '@/lib/api/budget.api';
import ManualPopupMenu from '../PopupMenu';

// --- Opciones para los menús ---
const budgetTypeOptions = [
    { value: 'CLIENT', label: 'Client', colorClass: 'bg-green-200 text-green-800', hoverClass: 'hover:bg-green-300' },
    { value: 'PROVIDER', label: 'Provider', colorClass: 'bg-orange-200 text-orange-800', hoverClass: 'hover:bg-orange-300' },
    { value: 'INTERNAL', label: 'Internal', colorClass: 'bg-red-200 text-red-800', hoverClass: 'hover:bg-red-300' },
    { value: 'GENERAL', label: 'General', colorClass: 'bg-blue-200 text-blue-800', hoverClass: 'hover:bg-blue-300' },
    { value: 'OTHER', label: 'Other', colorClass: 'bg-gray-200 text-gray-800', hoverClass: 'hover:bg-gray-300' },
];

interface EditBudgetPanelProps {
  onClose: () => void;
  onBudgetUpdated: () => void;
  budgetId: string;
}

export default function EditBudgetPanel({ onClose, onBudgetUpdated, budgetId }: EditBudgetPanelProps) {
  // --- Estado del Formulario ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [currency, setCurrency] = useState<'PYG' | 'USD' | ''>('');
  
  // --- Estado de Carga ---
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!budgetId) return;
    
    const fetchBudget = async () => {
      setIsLoading(true);
      try {
        const budget = await BudgetApiClient.getBudgetById(budgetId);
        if (budget) {
          setName(budget.name || '');
          setDescription(budget.description || '');
          setBudgetType(budget.budgetType || '');
          setCurrency(budget.currency || '');
        }
      } catch (err) {
        console.error('Error al cargar el presupuesto para editar:', err);
        alert('No se pudieron cargar los datos del presupuesto.');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBudget();
  }, [budgetId, onClose]);

  const handleUpdateBudget = async () => {
    try {
      const budgetData = {
        name,
        description,
        budgetType,
      };
      await BudgetApiClient.updateBudget(budgetId, budgetData);
      onBudgetUpdated();
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      alert('Error al guardar los cambios.');
    }
  };

  const selectedBudgetTypeOption = budgetTypeOptions.find(opt => opt.value === budgetType);

  const budgetTypeButtonClasses = [
    "flex items-center gap-2",
    "rounded-md px-3 py-1",
    "text-sm font-medium",
    selectedBudgetTypeOption ? selectedBudgetTypeOption.colorClass : 'bg-gray-100 text-gray-700',
    selectedBudgetTypeOption ? selectedBudgetTypeOption.hoverClass : 'hover:bg-gray-200'
  ].join(' ');

  const getLabelForValue = (options: typeof budgetTypeOptions, value: string) => {
    return options.find(opt => opt.value === value)?.label || 'none';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end items-start p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Panel Lateral */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl flex flex-col max-h-full"
        >
          {/* Header del Panel */}
          <div className="flex items-center p-4 border-b border-gray-200 flex-shrink-0">
            <div className='flex items-center gap-3 text-gray-500'>
              <button onClick={onClose} className="hover:text-gray-800"><X size={20} /></button>
              <button className="hover:text-gray-800"><Expand size={18} /></button>
            </div>
            <h2 className="mx-auto text-sm font-semibold text-gray-700">Edit Budget</h2>
            <div className='flex items-center gap-3 text-gray-500'>
              <button className="hover:text-yellow-500"><Star size={20} /></button>
              <button className="hover:text-gray-800"><MoreVertical size={20} /></button>
            </div>
          </div>
          
          {/* Contenido del Formulario */}
          <div className="flex-grow overflow-y-auto p-8">
            {isLoading ? (
              <div className="text-center text-gray-500 py-10">Cargando datos del presupuesto...</div>
            ) : (
              <div className="space-y-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name Budget"
                  className="text-3xl font-bold text-gray-800 placeholder-gray-300 focus:outline-none w-full border-b pb-2"
                />
                
                <div className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">Budget Type</label>
                    <ManualPopupMenu
                      title="Budget Type"
                      options={budgetTypeOptions}
                      onSelect={setBudgetType}
                    >
                      <div className={budgetTypeButtonClasses}>
                        <span>{getLabelForValue(budgetTypeOptions, budgetType)}</span>
                      </div>
                    </ManualPopupMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">Currency</label>
                    <div className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-500">
                      {currency}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={3} 
                    className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a description..."
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Footer del Panel */}
          <div className="p-4 border-t flex justify-end flex-shrink-0">
            <button
              onClick={handleUpdateBudget}
              disabled={isLoading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}