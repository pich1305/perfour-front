"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand, Star, MoreVertical, ChevronLeft, ChevronDown } from 'lucide-react';
import { BudgetApiClient } from '@/lib/api/budget.api';
import ManualPopupMenu from '../PopupMenu';

// --- Definimos las opciones para los menús ---
const budgetTypeOptions = [
  { value: 'CLIENT', label: 'Client', colorClass: 'bg-green-200 text-green-800', hoverClass: 'hover:bg-green-300' },
  { value: 'PROVIDER', label: 'Provider', colorClass: 'bg-orange-200 text-orange-800', hoverClass: 'hover:bg-orange-300' },
  { value: 'INTERNAL', label: 'Internal', colorClass: 'bg-red-200 text-red-800', hoverClass: 'hover:bg-red-300' },
  { value: 'GENERAL', label: 'General', colorClass: 'bg-blue-200 text-blue-800', hoverClass: 'hover:bg-blue-300' },
  { value: 'OTHER', label: 'Other', colorClass: 'bg-gray-200 text-gray-800', hoverClass: 'hover:bg-gray-300' },
];

const currencyOptions = [
  { value: 'PYG', label: 'Guarani', colorClass: 'bg-blue-200 text-blue-800', hoverClass: 'hover:bg-blue-300' },
  { value: 'USD', label: 'US. Dolar', colorClass: 'bg-green-200 text-green-800', hoverClass: 'hover:bg-green-300' },
  { value: 'NONE', label: 'Other', colorClass: 'bg-gray-200 text-gray-800', hoverClass: 'hover:bg-gray-300' },
];

interface CreateBudgetPanelProps {
  onClose: () => void;
  onBudgetCreated: () => void;
  projectId: string;
}

export default function CreateBudgetPanel({ onClose, onBudgetCreated, projectId }: CreateBudgetPanelProps) {

  // --- Lógica de estado del formulario ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [currency, setCurrency] = useState('PYG');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('empty');

  const handleCreateBudget = async () => {
    // Validación simple
    if (!name.trim() || !budgetType) {
      alert('Por favor, completa el nombre y el tipo de presupuesto.');
      return;
    }

    try {
      const budgetData = {
        name,
        description,
        budgetType: budgetType.toUpperCase(),
        currency,
      };


      await BudgetApiClient.createBudget(projectId, budgetData);

      console.log('Presupuesto creado exitosamente.');
      onBudgetCreated(); // Llama a la función para cerrar el panel y refrescar la lista.
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      alert('Error al crear el presupuesto. Revisa la consola para más detalles.');
    }
  };

  const selectedBudgetTypeOption = budgetTypeOptions.find(opt => opt.value === budgetType);

  const budgetTypeButtonClasses = [
    "flex items-center gap-2",
    "rounded-md px-3 py-1",
    "text-sm font-medium",
    // Si hay una opción seleccionada, usa su color, si no, usa el estilo por defecto.
    selectedBudgetTypeOption ? selectedBudgetTypeOption.colorClass : 'bg-gray-100 text-gray-700',
    selectedBudgetTypeOption ? selectedBudgetTypeOption.hoverClass : 'hover:bg-gray-200'
  ].join(' ');

  const selectedCurrencyOption = currencyOptions.find(opt => opt.value === currency);

  const currencyButtonClasses = [
    "flex items-center gap-2",
    "rounded-md px-3 py-1",
    "text-sm font-medium",
    // Si hay una opción seleccionada, usa su color, si no, usa el estilo por defecto.
    selectedCurrencyOption ? selectedCurrencyOption.colorClass : 'bg-gray-100 text-gray-700',
    selectedCurrencyOption ? selectedCurrencyOption.hoverClass : 'hover:bg-gray-200'
  ].join(' ');

  // Helper para mostrar la etiqueta del valor seleccionado
  const getLabelForValue = (options: typeof budgetTypeOptions, value: string) => {
    return options.find(opt => opt.value === value)?.label || 'none';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end items-start p-4">
        {/* Backdrop (Fondo semitransparente) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Panel Lateral Flotante */}
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
            <h2 className="mx-auto text-sm font-semibold text-gray-700">Create a new Budget</h2>
            <div className='flex items-center gap-3 text-gray-500'>
              <button className="hover:text-yellow-500"><Star size={20} /></button>
              <button className="hover:text-gray-800"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Contenido del Formulario (con scroll) */}
          <div className="flex-grow overflow-y-auto px-8 py-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name Budget"
              className="text-3xl font-bold text-gray-800 placeholder-gray-300 focus:outline-none w-full  pb-2"
            />
            <div className="border-b border-gray-300" />

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">Budget Type</label>
                <ManualPopupMenu
                  title="Budget Type"
                  options={budgetTypeOptions}
                  onSelect={setBudgetType}
                >
                  <div className={budgetTypeButtonClasses}>
                    <span>{selectedBudgetTypeOption?.label || 'none'}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </ManualPopupMenu>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">Currency</label>
                <ManualPopupMenu
                  title="Currency"
                  options={currencyOptions}
                  onSelect={setCurrency}
                >
                  <div className={currencyButtonClasses}>
                    <span>{selectedCurrencyOption?.label || 'none'}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </div>
                </ManualPopupMenu>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-600">Status</label>
                <button className="rounded-md border border-gray-300 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  Draft
                </button>
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

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Select Template</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedTemplate('empty')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${selectedTemplate === 'empty' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:border-gray-300'}`}
                >
                  <h4 className="font-medium text-gray-800">Presupuesto Vacío</h4>
                  <p className="text-sm text-gray-500 mt-1">Comienza desde cero.</p>
                </div>
                <div
                  onClick={() => setSelectedTemplate('template1')}
                  className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${selectedTemplate === 'template1' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-transparent hover:border-gray-300'}`}
                >
                  <h4 className="font-medium text-gray-800">Plantilla Obra Completa</h4>
                  <p className="text-sm text-gray-500 mt-1">Incluye partidas básicas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer del Panel */}
          <div className="p-4 border-t flex justify-end flex-shrink-0">
            <button
              onClick={handleCreateBudget}
              className="inline-flex items-center gap-2 py-2 px-3.5 bg-violet-50 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-100 transition-colors"            >
              Crear Presupuesto
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}