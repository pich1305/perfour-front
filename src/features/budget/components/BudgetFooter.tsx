import { ElementLevelEnum } from '@/lib/api/budgetElement.api';
import React from 'react';

interface BudgetFooterProps {
  elements: any[];
  formatCurrency: (amount: number) => string;
}

const BudgetFooter: React.FC<BudgetFooterProps> = ({ elements, formatCurrency }) => {
  // Filtrar solo categorías
  const categorias = elements.filter(el => el.elementLevel === ElementLevelEnum.CATEGORY);

  // Agrupar totales por tipo de categoría
  const totalsByCategoryType: Record<string, number> = {};
  let totalGeneral = 0;
  categorias.forEach(cat => {
    const type = cat.type || 'OTRO';
    const subtotal = cat.totalAmount || 0;
    totalsByCategoryType[type] = (totalsByCategoryType[type] || 0) + subtotal;
    totalGeneral += subtotal;
  });

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-lg ml-auto bg-white border border-gray-300 rounded-lg p-3">
        <div className="space-y-0">
          {Object.entries(totalsByCategoryType).map(([type, total], index) => (
            <div key={type}>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-700 capitalize">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
                <span className="font-mono font-semibold text-gray-800">
                  {formatCurrency(total)}
                </span>
              </div>
              {index < Object.entries(totalsByCategoryType).length - 1 && (
                <div className="border-b border-black"></div>
              )}
            </div>
          ))}
        </div>
        <div className="border-b border-black my-2"></div>
        <div className="flex justify-between items-center py-1">
          <span className="text-base font-bold text-gray-800">Total General</span>
          <span className="font-mono text-lg font-bold text-gray-800">
            {formatCurrency(totalGeneral)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetFooter; 