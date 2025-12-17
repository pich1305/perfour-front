// src/features/tasks/components/PaginationFooter.tsx
import React from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationFooterProps {
  totalRows: number;
  rowsPerPage: number;
  setRowsPerPage: (n: number) => void;
  currentPage: number;
  setCurrentPage: (n: number) => void;
}

export function PaginationFooter({ totalRows, rowsPerPage, setRowsPerPage, currentPage, setCurrentPage }: PaginationFooterProps) {
  const totalPages = Math.ceil((totalRows || 0) / (rowsPerPage || 1));
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...');
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push('...');
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push('...');
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="mt-6 flex items-center justify-between px-2 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <div className="text-sm text-gray-600">
        Total <span className="font-medium text-gray-900">{totalRows}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page</span>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-1 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          {pages.map((page, index) => (
            page === '...'
              ? <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm text-gray-600">...</span>
              : (
                <button
                  key={page}
                  className={`px-2 py-1 text-sm rounded ${currentPage === page ? 'bg-white text-gray-900 shadow-sm border border-gray-300 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </button>
              )
          ))}
          <button 
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}


