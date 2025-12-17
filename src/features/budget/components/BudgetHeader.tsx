import React from 'react';
import { X, Undo2, Redo2, Pencil, Download, Eye } from 'lucide-react'; // <-- 1. Importamos los nuevos íconos

interface BudgetHeaderProps {
  budgetInfo: any;
  total: number;
  elementsCount: number;
  formatCurrency: (amount: number) => string;
  undoStack: any[];
  redoStack: any[];
  onUndo: () => void;
  onRedo: () => void;
  onClose: () => void;
  onEditBudget: () => void;
  // Añadimos nuevas props para las acciones si son necesarias
  onExport?: () => void;
  onView?: () => void;
}

const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  budgetInfo,
  total,
  elementsCount,
  formatCurrency,
  undoStack,
  redoStack,
  onUndo,
  onRedo,
  onClose,
  onEditBudget,
  onExport,
  onView
}) => {
  // --- 2. Centralizamos el estilo de los botones para no repetir código ---
  const actionButtonClasses = "inline-flex items-center gap-2 py-2 px-3.5 bg-violet-50 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-100 transition-colors";

  return (
    <div className="flex justify-between items-center py-1">
      {/* Lado Izquierdo: Título y Metadatos */}
      <div>
        <h3 className="text-4xl font-bold text-gray-800">{budgetInfo?.name || 'Detalles del Presupuesto'}</h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          {/* Aquí podrías poner información como la fecha o el estado */}
        </div>
      </div>

      {/* Lado Derecho: Grupo de Botones */}
      <div className="flex items-center gap-4">
        {/* Grupo de Undo/Redo */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={onUndo}
            disabled={undoStack.length === 0}
            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={onRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 hover:bg-gray-200 rounded disabled:opacity-50"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* --- 3. Grupo de Acciones Principales con el nuevo diseño --- */}
        <div className="flex items-center gap-2">
          <button onClick={onView} className={actionButtonClasses} title="Ver Presupuesto">
            <Eye size={16} />
            Ver
          </button>
          <button onClick={onExport} className={actionButtonClasses} title="Exportar Presupuesto">
            <Download size={16} />
            Exportar
          </button>
          <button onClick={onEditBudget} className={actionButtonClasses} title="Editar Presupuesto">
            <Pencil size={16} />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetHeader;
