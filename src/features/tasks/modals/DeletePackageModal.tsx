'use client';

interface DeletePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  packageName?: string;
}

export function DeletePackageModal({ isOpen, onClose, onConfirm, packageName }: DeletePackageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
        <p className="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar el paquete "<strong>{packageName || 'este paquete'}</strong>"? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-4">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>
  );
}


