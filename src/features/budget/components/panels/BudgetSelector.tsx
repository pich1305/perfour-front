// components/budget/BudgetSelector.tsx
"use client";

import { useState, useEffect } from 'react';
import { Search, Loader2, X, ArrowLeft } from 'lucide-react';
import { colors } from '@/lib/config/colors';
import { BudgetRelated, BudgetElementRelatedNode } from '@/lib/types/budget-related';
import { BudgetApiClient } from '@/lib/api/budget.api';
import { buildBudgetTree, sortBudgetTree } from '../../utils/budgetTreeBuilder';
import BudgetElementTree from '../BudgetElementTree';

interface BudgetSelectorProps {
  projectId: string;
  currentBudgetElementId?: string;
  onSelect: (budgetElementId: string, budgetElementName: string) => void;
  onCancel: () => void;
}

export default function BudgetSelector({
  projectId,
  currentBudgetElementId,
  onSelect,
  onCancel
}: BudgetSelectorProps) {
  const [budgets, setBudgets] = useState<BudgetRelated[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(currentBudgetElementId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBudgetIds, setExpandedBudgetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadBudgets();
  }, [projectId]);

  const loadBudgets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await BudgetApiClient.getBudgetsWithElements(projectId);
      setBudgets(response.items);

      if (response.items.length > 0) {
        setExpandedBudgetIds(new Set([response.items[0].id]));
      }
    } catch (err) {
      console.error('Error loading budgets:', err);
      setError('Error al cargar los presupuestos');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBudgetExpansion = (budgetId: string) => {
    const newExpanded = new Set(expandedBudgetIds);
    if (newExpanded.has(budgetId)) {
      newExpanded.delete(budgetId);
    } else {
      newExpanded.add(budgetId);
    }
    setExpandedBudgetIds(newExpanded);
  };

  const handleConfirm = () => {
    if (!selectedItemId) return;

    let selectedItemName = '';
    for (const budget of budgets) {
      const item = budget.elements.find(el => el.id === selectedItemId);
      if (item) {
        selectedItemName = item.name;
        break;
      }
    }

    onSelect(selectedItemId, selectedItemName);
  };

  const filteredBudgets = budgets.filter(budget =>
    budget.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    budget.elements.some(el =>
      el.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      {/* Header con botón volver */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm font-medium transition-colors"
          style={{ color: colors.blue.primary }}
        >
          <ArrowLeft size={16} />
        </button>
        {/* Título */}
        <div>
          <h3
            className="text-lg font-bold"
            style={{ color: colors.blue.primary }}
          >
            Seleccionar Elemento de Presupuesto
          </h3>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={18} style={{ color: colors.gray[500] }} />
        </button>
      </div>
      <p className="text-sm mt-1" style={{ color: colors.gray[500] }}>
        Elige un item para relacionar con este inventario
      </p>



      {/* Buscador */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: colors.gray[400] }}
        />
        <input
          type="text"
          placeholder="Buscar presupuesto o elemento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: colors.gray[300],
            backgroundColor: colors.gray[50]
          }}
        />
      </div>

      {/* Contenido */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2
              size={32}
              className="animate-spin mb-3"
              style={{ color: colors.blue.primary }}
            />
            <p className="text-sm" style={{ color: colors.gray[500] }}>
              Cargando presupuestos...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm mb-3" style={{ color: colors.coral.dark }}>{error}</p>
            <button
              onClick={loadBudgets}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: colors.blue.primary,
                color: '#FFFFFF'
              }}
            >
              Reintentar
            </button>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.gray[500] }}>
              No se encontraron presupuestos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBudgets.map(budget => {
              const tree = sortBudgetTree(buildBudgetTree(budget.elements));
              const isExpanded = expandedBudgetIds.has(budget.id);

              return (
                <div
                  key={budget.id}
                  className="border rounded-xl overflow-hidden"
                  style={{ borderColor: colors.gray[200] }}
                >
                  {/* Budget Header */}
                  <button
                    onClick={() => toggleBudgetExpansion(budget.id)}
                    className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    style={{ backgroundColor: isExpanded ? colors.gray[50] : 'transparent' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: colors.blue.lightest }}
                      >
                        <span className="text-sm" style={{ color: colors.blue.primary }}>📊</span>
                      </div>
                      <div className="text-left">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: colors.blue.primary }}
                        >
                          {budget.name}
                        </p>
                        <p className="text-xs" style={{ color: colors.gray[500] }}>
                          {budget.elementsCount} elementos
                        </p>
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: colors.gray[400] }}>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>

                  {/* Budget Tree */}
                  {isExpanded && (
                    <div className="px-3 py-2 border-t" style={{ borderColor: colors.gray[200] }}>
                      <BudgetElementTree
                        nodes={tree}
                        selectedItemId={selectedItemId}
                        onSelectItem={setSelectedItemId}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4 border-t" style={{ borderTop: `1px solid ${colors.gray[200]}` }}>
        {/* <button
          onClick={onCancel}
          className="flex-1 py-2.5 px-4 border-2 font-semibold rounded-xl transition-colors text-sm"
          style={{
            borderColor: colors.gray[300],
            color: colors.gray[700]
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[50]}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          Cancelar
        </button> */}
<button
  onClick={handleConfirm}
  disabled={!selectedItemId}
  className="flex-1 py-2.5 px-4 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
  style={{
    background: selectedItemId ? colors.gradients.relationBar : colors.gray[300], // ← Usar gradiente Bridge
    color: '#FFFFFF'
  }}
>
  Confirmar
</button>
      </div>
    </div>
  );
}