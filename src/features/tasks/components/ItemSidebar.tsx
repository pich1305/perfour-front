import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskElement, TaskElementType } from '@/types';
import { StatusDropdown } from './StatusDropdown';

interface ItemSidebarProps {
  task: TaskElement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updates: Partial<TaskElement>) => void;
  allTasks?: TaskElement[];
}

const sidebarVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
  exit: { x: '100%' },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Funciones de utilidad
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Convertir fecha ISO a formato date input (YYYY-MM-DD)
const toDateInputValue = (value?: string | Date): string => {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Convertir formato date input a ISO string
const dateInputToISOString = (value: string): string => {
  const localMidnight = new Date(value + 'T00:00:00');
  return localMidnight.toISOString();
};

const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full';
    case 'MEDIUM':
      return 'px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full';
    case 'HIGH':
      return 'px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full';
    case 'CRITICAL':
      return 'px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full';
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full';
  }
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full';
    case 'in_progress':
      return 'px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full';
    case 'completed':
      return 'px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full';
    case 'cancelled':
      return 'px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full';
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'not_started':
      return 'not started';
    case 'in_progress':
      return 'in progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return status.toLowerCase();
  }
};

const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'LOW':
      return 'low';
    case 'MEDIUM':
      return 'medium';
    case 'HIGH':
      return 'high';
    case 'CRITICAL':
      return 'critical';
    default:
      return priority.toLowerCase();
  }
};

const getDependencyTypeText = (type: string): string => {
  switch (type) {
    case 'FINISH_TO_START':
      return 'Finish to Start';
    case 'START_TO_START':
      return 'Start to Start';
    case 'FINISH_TO_FINISH':
      return 'Finish to Finish';
    case 'START_TO_FINISH':
      return 'Start to Finish';
    default:
      return type;
  }
};

const getTaskTypeText = (type: TaskElementType): string => {
  switch (type) {
    case TaskElementType.GROUP:
      return 'grupo';
    case TaskElementType.SUBGROUP:
      return 'subgrupo';
    case TaskElementType.SIMPLE_TASK:
    case TaskElementType.MILESTONE:
      return 'task';
    default:
      return 'task';
  }
};

const ItemSidebar: React.FC<ItemSidebarProps> = ({ task, isOpen, onClose, onSave, allTasks = [] }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [isExpanded, setIsExpanded] = useState(false);
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Función helper para obtener el nombre de una tarea por su ID
  const getTaskNameById = (taskId: string): string => {
    const foundTask = allTasks.find(t => t.id === taskId);
    return foundTask?.name || 'Tarea desconocida';
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const clickedInStatusDropdown = !!target?.closest('[data-portal="status-dropdown"]');
      if (clickedInStatusDropdown) return;
      if (sidebarRef.current && !sidebarRef.current.contains(target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleClose = () => {
    onClose();
  };

  // Sincronizar la descripción y fechas cuando cambia la tarea
  useEffect(() => {
    if (task) {
      setDescription(task.description || '');
      setStartDate(toDateInputValue(task.plannedStartDate));
      setEndDate(toDateInputValue(task.plannedEndDate));
    }
  }, [task]);

  // Si no hay task o no está abierto, no renderizar nada
  if (!task || !isOpen) {
    return null;
  }

  // Calcular dependencias de la misma manera que en TaskRow y IntegratedGanttTable
  const deps: any[] = Array.isArray((task as any).dependencies) ? (task as any).dependencies : [];
  const predecessorDependencies = Array.isArray((task as any).predecessorDependencies)
    ? (task as any).predecessorDependencies
    : deps.filter((d: any) => d && d.successorId === task.id);
  const successorDependencies = Array.isArray((task as any).successorDependencies)
    ? (task as any).successorDependencies
    : deps.filter((d: any) => d && d.predecessorId === task.id);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          style={{ pointerEvents: 'auto' }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          {/* Sidebar principal, ahora con animación de width solo para expandir */}
          <motion.div
            ref={sidebarRef}
            className="relative h-[calc(100%-10rem)] mt-20 mb-6 mr-6 bg-white shadow-xl rounded-2xl border border-gray-200 overflow-hidden"
            animate={{ width: isExpanded ? '700px' : '448px' }}
            transition={{ width: { type: 'tween', duration: 0.28, ease: 'easeInOut' } }}
            style={{ width: isExpanded ? '700px' : '448px' }}
          >
            {/* Header y contenido sidebar como siempre */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
              {/* Izquierda: Botones de cerrar y expandir */}
              <div className="flex items-center space-x-2">
                <button
                  className="text-gray-500 hover:text-gray-800 text-2xl font-light transition-colors"
                  onClick={handleClose}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <button
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  onClick={() => setIsExpanded(!isExpanded)}
                  aria-label={isExpanded ? "Contraer" : "Expandir"}
                >
                  {isExpanded ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Centro: Tipo de elemento */}
              <p className="text-sm font-medium text-gray-700">
                {getTaskTypeText(task.type)}
              </p>

              {/* Derecha: Estrella y menú */}
              <div className="flex items-center space-x-2">
                <button
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Favorito"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Más opciones"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="h-[calc(100%-57px)] overflow-y-auto">
              {/* Contenedor Principal */}
              <div className="p-6">
                {/* Título Principal */}
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  {task.name}
                </h1>

                {/* Sección de Metadatos */}
                <div className="space-y-4 mb-2">
                  {/* Priority */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Priority</span>
                    <span className={getPriorityBadgeClass(task.priority)}>
                      {getPriorityText(task.priority)}
                    </span>
                  </div>

                  <hr className="my-2" />

                  {/* Start Date and End Date */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Start Date</span>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setStartDate(newDate);
                          if (onSave && newDate && newDate !== toDateInputValue(task.plannedStartDate)) {
                            const isoDate = dateInputToISOString(newDate);
                            onSave({ plannedStartDate: isoDate });
                          }
                        }}
                        className="border-0 bg-transparent text-sm text-gray-600 px-0 py-0 focus:outline-none focus:ring-0 cursor-pointer relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{ width: 'auto', minWidth: '100px' }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">End Date</span>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          const newDate = e.target.value;
                          setEndDate(newDate);
                          if (onSave && newDate && newDate !== toDateInputValue(task.plannedEndDate)) {
                            const isoDate = dateInputToISOString(newDate);
                            onSave({ plannedEndDate: isoDate });
                          }
                        }}
                        className="border-0 bg-transparent text-sm text-gray-600 px-0 py-0 focus:outline-none focus:ring-0 cursor-pointer relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                        style={{ width: 'auto', minWidth: '100px' }}
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <StatusDropdown
                      value={task.status as any}
                      onChange={(s: any) => { if (onSave) onSave({ status: s } as any); }}
                      className="text-xs"
                    />
                  </div>

                  {/* Assignees */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Assignees</span>
                    <div className="flex items-center">
                      {task.assignedUserId ? (
                        <div className="flex items-center">
                          <div className="flex -space-x-1">
                            <span className="px-2 py-1 bg-cyan-100 text-cyan-600 text-xs rounded-full">
                              {task.assignedContractorText || 'Usuario asignado'}
                            </span>
                          </div>
                          <button className="ml-2 text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No asignado</span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Description</span>
                    <textarea
                      className="w-full p-3 border border-gray-200 rounded-lg text-sm text-gray-600 resize-none h-16"
                      placeholder="What is this task about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => {
                        if (onSave && description !== task.description) {
                          onSave({ description });
                        }
                      }}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Control de calidad relacionadas */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Control de calidad relacionadas</span>
                  </div>
                    <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                      inspeccion electrica
                    </span>
                </div>

                {/* Dependencias */}
                <div className="space-y-4 mb-6">
                  {/* Predecessors */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Predecessors</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      {predecessorDependencies.length > 0 ? (
                        predecessorDependencies.map((dependency: any, index: number) => {
                          const predecessorId = dependency.predecessorId || dependency.id;
                          const taskName = predecessorId ? getTaskNameById(predecessorId) : 'Tarea predecesora';
                          return (
                            <div key={dependency.id || index} className="flex items-center justify-between">
                              <span className="px-2 py-1 bg-orange-300 text-black text-xs rounded-full">
                                {taskName}
                              </span>
                              <span className="px-2 py-1 bg-red-300 text-black text-xs rounded-full">
                                {getDependencyTypeText(dependency.type || 'FINISH_TO_START')}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500">No hay predecesores</span>
                      )}
                    </div>
                  </div>

                  {/* Successors */}
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Successors</span>
                    </div>
                    <div className="ml-6 space-y-2">
                      {successorDependencies.length > 0 ? (
                        successorDependencies.map((dependency: any, index: number) => {
                          const successorId = dependency.successorId || dependency.id;
                          const taskName = successorId ? getTaskNameById(successorId) : 'Tarea sucesora';
                          return (
                            <div key={dependency.id || index} className="flex items-center justify-between">
                              <span className="px-2 py-1 bg-orange-300 text-black text-xs rounded-full">
                                {taskName}
                              </span>
                              <span className="px-2 py-1 bg-red-300 text-black text-xs rounded-full">
                                {getDependencyTypeText(dependency.type || 'FINISH_TO_START')}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-sm text-gray-500">No hay sucesores</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Attachments</h3>
                  <div className="space-y-2 mb-3">
                    {/* Archivo 1 */}
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">planos_electricos.pdf</div>
                          <div className="text-xs text-gray-500">2.4 MB • 15 Jan • enzobneza</div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Archivo 2 */}
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">especificaciones_tecnicas.pdf</div>
                          <div className="text-xs text-gray-500">1.8 MB • 14 Jan • maxverstappen</div>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-gray-500">Drop files here to upload</p>
                  </div>
                </div>

                {/* Comments */}
                <div>
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === 'comments'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('comments')}
                    >
                      Comments
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === 'activity'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('activity')}
                    >
                      All Activity
                    </button>
                  </div>

                  {/* Comments List */}
                  {task.commentsCount && task.commentsCount > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center py-8">
                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="text-gray-500 text-sm">{task.commentsCount} comentarios disponibles</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-gray-500 text-sm">No Comments yet</p>
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="mt-6">
                    <div className="flex space-x-3">
                      <textarea
                        className="flex-1 p-3 border border-gray-200 rounded-lg text-sm resize-none"
                        placeholder="Add a comment"
                        rows={2}
                      />
                      <button className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                        comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ItemSidebar; 