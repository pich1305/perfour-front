"use client";

import type { InventoryItem } from '@/lib/types';
import PaginationControls from '@/components/project/parts/PaginationFooter';
import InventoryTableRow from './InventoryTableRow';

interface InventoryTableProps {
  items: InventoryItem[];
  isLoading: boolean;
  pagination: { page: number; take: number; totalItems: number; };
  setPagination: React.Dispatch<React.SetStateAction<any>>;
  onViewItem: (itemId: string) => void;
  onDeleteItem: (item: InventoryItem) => void; 
  onDuplicateItem: (itemId: string) => void;
}

export default function InventoryTable({ 
  items, 
  isLoading, 
  pagination, 
  setPagination, 
  onViewItem,
  onDeleteItem,
  onDuplicateItem,
}: InventoryTableProps) {
  const { page, take, totalItems } = pagination;
  const totalPages = Math.ceil(totalItems / take);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b ">
              <th className="p-3 font-medium text-gray-500 tracking-wider">Name</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Unit of measure</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-right">Esperado</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-right">Recibido</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-right">Pendiente</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Status</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Expected Delivery Date</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider">Supplier</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={9} className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse"></div></td></tr>
              ))
            ) : items.length === 0 ? (
              <tr><td colSpan={9} className="text-center p-8 text-gray-500">No se encontraron items.</td></tr>
            ) : (
              items.map(item => (
                <InventoryTableRow
                  key={item.id}
                  item={item}
                  onViewItem={onViewItem}
                  onDeleteItem={onDeleteItem} 
                  onDuplicateItem={onDuplicateItem}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={take}
        onPageChange={(newPage: number) => setPagination((prev: any) => ({...prev, page: newPage}))}
        onItemsPerPageChange={(newTake: number) => setPagination({ page: 1, take: newTake, totalItems: 0})}
      />
    </div>
  );
}