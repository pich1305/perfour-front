"use client";

import { colors } from '@/lib/config/colors';
import RfiTableRow from './RfiTableRow';
import PaginationControls from '@/components/project/parts/PaginationFooter';
import { RFI } from '@/lib/types';

interface RfiTableProps {
  rfis: RFI[];
  isLoading: boolean;
  pagination: { page: number; take: number; totalItems: number };
  setPagination: React.Dispatch<React.SetStateAction<any>>;
  onViewRfi: (rfiId: string) => void;
  onRefresh: () => void;
}

export default function RfiTable({
  rfis = [], // ✅ Valor por defecto
  isLoading,
  pagination,
  setPagination,
  onViewRfi,
  onRefresh
}: RfiTableProps) {
  const { page, take, totalItems } = pagination;
  const totalPages = Math.ceil(totalItems / take);

  return (
    <div className="rounded-xl border bg-white shadow-sm h-full flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left">
            <tr className="border-b">
              <th className="p-3 font-medium text-gray-500 tracking-wider">#</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider">Título</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider">Ball in Court</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Prioridad</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Estado</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider">Asignado a</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Fecha Límite</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-right">Días</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Impacto</th>
              <th className="p-3 font-medium text-gray-500 tracking-wider text-center">Actividad</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={10} className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                </tr>
              ))
            ) : rfis.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center p-12">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.gray[100] }}
                    >
                      <span className="text-3xl">📋</span>
                    </div>
                    <div>
                      <p className="text-base font-medium mb-1" style={{ color: colors.gray[900] }}>
                        No se encontraron RFIs
                      </p>
                      <p className="text-sm" style={{ color: colors.gray[500] }}>
                        Intenta ajustar los filtros o crea un nuevo RFI
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              rfis.map((rfi) => (
                <RfiTableRow 
                  key={rfi.id} 
                  rfi={rfi} 
                  onViewRfi={onViewRfi}
                  onRefresh={onRefresh}
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
        onPageChange={(newPage: number) =>
          setPagination((prev: any) => ({ ...prev, page: newPage }))
        }
        onItemsPerPageChange={(newTake: number) =>
          setPagination({ page: 1, take: newTake, totalItems: 0 })
        }
      />
    </div>
  );
}