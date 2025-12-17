'use client';

import { useState, useEffect } from 'react';
import { TaskElement, TaskElementType, TaskPriority, VettelTaskStatus } from '@/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Partial<TaskElement>) => void;
  initialData?: TaskElement | null;
  mode: 'create' | 'edit';
  parentCandidates?: { id: string; name: string }[];
}

export function TaskFormModal({ isOpen, onClose, onSubmit, initialData, mode, parentCandidates = [] }: TaskFormModalProps) {
  const [formData, setFormData] = useState<Partial<TaskElement>>({});

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        ...initialData,
        plannedStartDate: initialData.plannedStartDate ? new Date(initialData.plannedStartDate).toISOString().split('T')[0] : '',
        plannedEndDate: initialData.plannedEndDate ? new Date(initialData.plannedEndDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: TaskElementType.SIMPLE_TASK,
        status: VettelTaskStatus.NOT_STARTED,
        priority: TaskPriority.MEDIUM,
        plannedStartDate: '',
        plannedEndDate: '',
      });
    }
  }, [isOpen, initialData, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: any = { ...formData };
    dataToSubmit.type = dataToSubmit.type || TaskElementType.SIMPLE_TASK;
    dataToSubmit.priority = dataToSubmit.priority || TaskPriority.MEDIUM;

    const start = String(dataToSubmit.plannedStartDate || '').trim();
    let end = String(dataToSubmit.plannedEndDate || '').trim();
    if (!start) { alert('La fecha de inicio es obligatoria'); return; }
    if (!end) {
      if (dataToSubmit.type === TaskElementType.MILESTONE) {
        const d = new Date(start); d.setDate(d.getDate() + 1); end = d.toISOString().slice(0, 10);
      } else { alert('La fecha de fin es obligatoria'); return; }
    }
    const sDate = new Date(start); const eDate = new Date(end);
    if (!(sDate < eDate)) {
      if (dataToSubmit.type === TaskElementType.MILESTONE) { const d = new Date(start); d.setDate(d.getDate() + 1); end = d.toISOString().slice(0, 10); }
      else { alert('La fecha de fin debe ser posterior a la fecha de inicio'); return; }
    }
    dataToSubmit.plannedStartDate = start;
    dataToSubmit.plannedEndDate = end;
    if (mode === 'create') delete dataToSubmit.status;
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{mode === 'create' ? 'Nueva Tarea' : 'Editar Tarea'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Tarea</label>
            <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {Object.values(TaskElementType).map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Padre (opcional)</label>
              <select id="parentId" name="parentId" value={formData.parentId || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                <option value="">Sin padre</option>
                {parentCandidates.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="plannedStartDate" className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
              <input type="date" id="plannedStartDate" name="plannedStartDate" value={formData.plannedStartDate || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
            <div>
              <label htmlFor="plannedEndDate" className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
              <input type="date" id="plannedEndDate" name="plannedEndDate" value={formData.plannedEndDate || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridad</label>
              <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: mode === 'edit' ? 'block' : 'none' }}>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estado</label>
              <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                {Object.values(VettelTaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{mode === 'create' ? 'Crear' : 'Guardar Cambios'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


