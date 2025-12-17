"use client";

import { colors } from '@/lib/config/colors';
import { X } from 'lucide-react';

interface RfiFiltersPanelProps {
  assigneeFilter: string;
  setAssigneeFilter: (value: string) => void;
  dateFromFilter: string;
  setDateFromFilter: (value: string) => void;
  dateToFilter: string;
  setDateToFilter: (value: string) => void;
  onClearFilters: () => void;
}

export default function RfiFiltersPanel({
  assigneeFilter,
  setAssigneeFilter,
  dateFromFilter,
  setDateFromFilter,
  dateToFilter,
  setDateToFilter,
  onClearFilters
}: RfiFiltersPanelProps) {
  return (
    <div
      className="p-4 rounded-lg space-y-3"
      style={{
        backgroundColor: colors.gray[50],
        border: `1px solid ${colors.gray[200]}`
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: colors.gray[900] }}>
          Filtros Avanzados
        </span>
        <button
          onClick={onClearFilters}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <X size={14} />
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Asignado a */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.gray[600] }}>
            Asignado a
          </label>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.gray[200]}`,
              color: colors.gray[900]
            }}
          >
            <option value="">Todos</option>
            <option value="user-1">Carlos Gómez</option>
            <option value="user-2">María López</option>
            <option value="user-3">Juan Pérez</option>
          </select>
        </div>

        {/* Fecha desde */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.gray[600] }}>
            Desde
          </label>
          <input
            type="date"
            value={dateFromFilter}
            onChange={(e) => setDateFromFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.gray[200]}`,
              color: colors.gray[900]
            }}
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: colors.gray[600] }}>
            Hasta
          </label>
          <input
            type="date"
            value={dateToFilter}
            onChange={(e) => setDateToFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: `1px solid ${colors.gray[200]}`,
              color: colors.gray[900]
            }}
          />
        </div>
      </div>
    </div>
  );
}