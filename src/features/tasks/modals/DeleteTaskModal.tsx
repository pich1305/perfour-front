'use client';

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  taskName?: string;
  taskType?: string;
  hasChildren?: boolean;
}

export function DeleteTaskModal({ isOpen, onClose, onConfirm, taskName, taskType, hasChildren }: DeleteTaskModalProps) {
  if (!isOpen) return null;

  const getTaskTypeName = (type?: string) => {
    switch (type) {
      case 'GROUP': return 'grupo';
      case 'SUBGROUP': return 'subgrupo';
      case 'SIMPLE_TASK': return 'tarea';
      case 'MILESTONE': return 'hito';
      default: return 'elemento';
    }
  };

  const taskTypeName = getTaskTypeName(taskType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
        <div className="text-gray-600 mb-6">
          <p className="mb-4">
            ¿Estás seguro de que deseas eliminar la {taskTypeName} "<strong>{taskName || 'este elemento'}</strong>"?
          </p>
          {hasChildren && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-yellow-800">Advertencia</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Esta {taskTypeName} contiene elementos hijos que también serán eliminados.
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}


