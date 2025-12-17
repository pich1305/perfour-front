"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { colors } from '@/lib/config/colors';
import RfiApiClient from '@/lib/api/rfi.api';
import { RFI, RFIStatus, RFIPriority } from '@/lib/types';
import RfiTable from './RfiTable';
import RfiFiltersPanel from './RfiFiltersPanel';

interface RfiListProps {
  projectId: string;
  onRfiClick: (rfiId: string) => void;
  refreshTrigger: number;
  showMyBallOnly?: boolean;
}

export default function RfiList({ 
  projectId, 
  onRfiClick, 
  refreshTrigger,
  showMyBallOnly = false 
}: RfiListProps) {
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RFIStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<RFIPriority | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filtros avanzados
  const [assigneeFilter, setAssigneeFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  
  const [pagination, setPagination] = useState({
    page: 1,
    take: 20,
    totalItems: 0
  });

  const [statusCounts, setStatusCounts] = useState({
    open: 0,
    responded: 0,
    closed: 0,
    void: 0,
    total: 0
  });

  useEffect(() => {
    fetchRfis();
  }, [
    projectId, 
    statusFilter, 
    priorityFilter, 
    searchQuery, 
    assigneeFilter,
    dateFromFilter,
    dateToFilter,
    pagination.page, 
    pagination.take, 
    refreshTrigger,
    showMyBallOnly
  ]);

  const fetchRfis = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        take: pagination.take
      };

      // Filtros opcionales
      if (showMyBallOnly) {
        // UC-09: Obtener RFIs donde tengo la pelota
        params.ballInCourtId = 'current-user-id'; // TODO: Obtener del contexto
      }
      
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      if (searchQuery.trim()) params.search = searchQuery;
      if (assigneeFilter) params.assigneeId = assigneeFilter;
      if (dateFromFilter) params.dateFrom = dateFromFilter;
      if (dateToFilter) params.dateTo = dateToFilter;

      console.log('params', params)
      const data = await RfiApiClient.getRfis(projectId, params);
      
      setRfis(data.items);
      setPagination(prev => ({ ...prev, totalItems: data.total }));
      
      // UC-10: Métricas del dashboard vienen en meta
      // if (data.meta?.statusCounts) {
      //   setStatusCounts(data.meta.statusCounts);
      // }
    } catch (error) {
      console.error('Error fetching RFIs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    // UC-25: Exportar a PDF
    try {
      console.log('Exportar PDF con filtros:', { statusFilter, priorityFilter });
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="px-6 py-4 space-y-4" style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
        {/* Fila 1: Búsqueda y acciones */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: colors.gray[400] }}
            />
            <input
              type="text"
              placeholder="Buscar por número, título, pregunta..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: colors.gray[50],
                border: `1px solid ${colors.gray[200]}`,
                color: colors.gray[900]
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.gray[900];
                e.target.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.gray[200];
                e.target.style.backgroundColor = colors.gray[50];
              }}
            />
          </div>

          {/* Filtros rápidos */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value as any);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-3 py-2 text-sm rounded-lg appearance-none cursor-pointer"
            style={{
              backgroundColor: colors.gray[50],
              border: `1px solid ${colors.gray[200]}`,
              color: colors.gray[900]
            }}
          >
            <option value="ALL">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          {/* Botón filtros avanzados */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: showFilters ? colors.gray[900] : colors.gray[50],
              border: `1px solid ${colors.gray[200]}`,
              color: showFilters ? '#FFFFFF' : colors.gray[700]
            }}
          >
            <Filter size={16} />
            Filtros
          </button>

          {/* Exportar */}
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50"
            style={{
              border: `1px solid ${colors.gray[200]}`,
              color: colors.gray[700]
            }}
          >
            <Download size={16} />
            Exportar
          </button>
        </div>

        {/* Panel de filtros avanzados */}
        {showFilters && (
          <RfiFiltersPanel
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            dateFromFilter={dateFromFilter}
            setDateFromFilter={setDateFromFilter}
            dateToFilter={dateToFilter}
            setDateToFilter={setDateToFilter}
            onClearFilters={() => {
              setAssigneeFilter('');
              setDateFromFilter('');
              setDateToFilter('');
            }}
          />
        )}

        {/* TABS DE ESTADO */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setStatusFilter('ALL');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: statusFilter === 'ALL' ? colors.gray[900] : 'transparent',
              color: statusFilter === 'ALL' ? '#FFFFFF' : colors.gray[600]
            }}
          >
            Todos ({statusCounts.total})
          </button>
          <button
            onClick={() => {
              setStatusFilter('OPEN');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: statusFilter === 'OPEN' ? colors.blue.lightest : 'transparent',
              color: statusFilter === 'OPEN' ? colors.blue.primary : colors.gray[600]
            }}
          >
            Abiertos ({statusCounts.open})
          </button>
          <button
            onClick={() => {
              setStatusFilter('PENDING_OFFICIAL');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: statusFilter === 'PENDING_OFFICIAL' ? '#FEF3C7' : 'transparent',
              color: statusFilter === 'PENDING_OFFICIAL' ? '#92400E' : colors.gray[600]
            }}
          >
            Pendientes ({statusCounts.responded})
          </button>
          <button
            onClick={() => {
              setStatusFilter('CLOSED');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: statusFilter === 'CLOSED' ? colors.mint.lighter : 'transparent',
              color: statusFilter === 'CLOSED' ? colors.mint.darkest : colors.gray[600]
            }}
          >
            Cerrados ({statusCounts.closed})
          </button>
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        <RfiTable
          rfis={rfis}
          isLoading={isLoading}
          pagination={pagination}
          setPagination={setPagination}
          onViewRfi={onRfiClick}
          onRefresh={fetchRfis} // ← ✅ ESTO ES LO QUE FALTABA
        />
      </div>
    </div>
  );
}