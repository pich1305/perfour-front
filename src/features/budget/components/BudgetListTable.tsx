"use client";

import React from 'react';
import BudgetListRow from './BudgetListRow';
import type { Budget } from '@/lib/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BudgetListTableProps {
  budgets: Budget[];
  onSelectBudget: (budgetId: string) => void;
  onOpenViewPanel: (budgetId: string) => void; 
  onDeleteBudget: (budgetId: string) => void;
  onDuplicateBudget: (budgetId: string) => void;
}

export default function BudgetListTable({ budgets, onSelectBudget, onOpenViewPanel, onDeleteBudget, onDuplicateBudget }: BudgetListTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="text-left bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider">Budget Type</th>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider text-right">Total Amount</th>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th className="px-4 py-3 font-medium text-gray-500 uppercase tracking-wider text-center w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {budgets.map((budget) => (
            <BudgetListRow 
              key={budget.id} 
              budget={budget} 
              onSelectBudget={onSelectBudget} 
              onOpenViewPanel={onOpenViewPanel}
              onDeleteBudget={onDeleteBudget}
              onDuplicateBudget={onDuplicateBudget}
            />
          ))}
        </tbody>
      </table>
      {/* --- FOOTER DE LA TABLA CON PAGINACIÓN --- */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 text-gray-600">
        <div className="text-xs font-medium">
          Total {budgets.length}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select className="border-gray-300 rounded-md p-1 text-xs focus:ring-blue-500 focus:border-blue-500">
              <option>100</option>
              <option>50</option>
              <option>20</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span>1</span>
            <button className="p-1 rounded hover:bg-gray-100 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="p-1 rounded hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}