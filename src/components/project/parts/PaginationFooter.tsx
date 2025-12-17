"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (take: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}: PaginationControlsProps) {

  const canGoBack = currentPage > 1;
  const canGoForward = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between p-3 border-t border-gray-200 text-gray-600 text-sm">
      {/* Lado Izquierdo: Total de Items */}
      <div className="font-medium">
        Total <span className="text-gray-800">{totalItems}</span>
      </div>

      {/* Lado Derecho: Controles */}
      <div className="flex items-center gap-6">
        {/* Selector de Items por Página */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Rows per page</span>
          <select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border-gray-300 rounded-md p-1 text-xs font-medium focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        {/* Navegación de Páginas */}
        <div className="flex items-center gap-2 font-medium">
          <span>{currentPage}</span>
          <span className="text-gray-400">...</span>
          <span>{totalPages}</span>

          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoBack}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoForward}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}