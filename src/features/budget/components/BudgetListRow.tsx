"use client";

import React from 'react';
import { MoreVertical, FileText, Star, CheckCircle2, ArrowUpRightSquare, Copy, Trash2 } from 'lucide-react';
import type { Budget } from '@/lib/types';
import ActionMenu, { MenuItem } from '@/components/ui/Popup/ActionMenu';

interface BudgetListRowProps {
  budget: Budget;
  onSelectBudget: (budgetId: string) => void;
  onOpenViewPanel: (budgetId: string) => void; 
  onDeleteBudget: (budgetId: string) => void;
  onDuplicateBudget: (budgetId: string) => void;
}

export default function BudgetListRow({ budget, onSelectBudget, onOpenViewPanel, onDeleteBudget, onDuplicateBudget }: BudgetListRowProps) {
  // Mapeo de estado para mayor flexibilidad
  const statusConfig = {
    APPROVED: { text: "Approved", className: "bg-green-100 text-green-800", Icon: CheckCircle2 },
    UNDER_REVIEW: { text: "Pending", className: "bg-yellow-100 text-yellow-700", Icon: null },
    DRAFT: { text: "Draft", className: "bg-gray-100 text-gray-600", Icon: null },
    REJECTED: { text: "Rejected", className: "bg-red-100 text-red-800", Icon: null },
    CLOSED: { text: "Closed", className: "bg-gray-100 text-gray-600", Icon: null },
  };
  const menuItems: MenuItem[] = [
    {
      label: 'Open budget details',
      icon: ArrowUpRightSquare,
      onClick: () => onSelectBudget(budget.id), // Reutiliza la función de abrir detalle completo
    },
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: () => onDuplicateBudget(budget.id),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: () => onDeleteBudget(budget.id),
      className: 'text-red-600', // Estilo especial para la opción de eliminar
    },
  ];

  
  const currentStatus = statusConfig[budget.status] || statusConfig.DRAFT;

  return (
    <tr 
      className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
      onClick={() => onSelectBudget(budget.id)}
    >
      {/* Name */}
      <td className="px-4 py-3 font-medium text-gray-800">{budget.name}</td>
      
      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${currentStatus.className}`}>
          {currentStatus.Icon && <currentStatus.Icon size={14} />}
          {currentStatus.text}
        </span>
      </td>
      
      {/* Budget Type */}
      <td className="px-4 py-3 text-gray-600">{budget.budgetType}</td>
      
      {/* Total Amount */}
      <td className="px-4 py-3 text-right font-mono font-medium text-gray-800">{budget.totalBudgetAmount}</td>
      
      {/* Items */}
      <td className="px-4 py-3 text-gray-600">
        <div className="flex items-center gap-1.5">
          <FileText size={14} /> 
          <span>{budget.elements?.length} items relacionados</span>
        </div>
      </td>
      
      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex justify-center items-center gap-2 text-gray-500">
          <button onClick={(e) => e.stopPropagation()} className="p-1 rounded-md hover:bg-gray-100 hover:text-yellow-500">
            <Star size={16} />
          </button>
          
          {/* --- 4. REEMPLAZA MoreVertical POR ActionMenu --- */}
          <ActionMenu items={menuItems} />

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onOpenViewPanel(budget.id);
            }} 
            className="p-1 rounded-md hover:bg-gray-100 hover:text-gray-800"
            title="Ver detalles rápidos"
          >
            <ArrowUpRightSquare size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}