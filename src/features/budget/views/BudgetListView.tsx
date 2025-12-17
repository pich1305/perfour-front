"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BudgetApiClient } from '@/lib/api/budget.api';
import BudgetListTable from '@/features/budget/components/BudgetListTable';
import type { Budget } from '@/lib/types';
import { Plus } from 'lucide-react';

import CreateBudgetPanel from '../components/panels/CreateBudgetPanel';
import BudgetViewPanel from '../components/panels/ViewBudgetPanel';
import toast from 'react-hot-toast';

export function BudgetListView() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [viewingBudgetId, setViewingBudgetId] = useState<string | null>(null);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isPanelOpen, setIsPanelOpen] = useState(false);


  useEffect(() => {
    if (!projectId) return;

    const fetchBudgets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await BudgetApiClient.getProjectBudgets(projectId);
        setBudgets(data);
      } catch (err) {
        console.error("Error fetching budget list:", err);
        setError("No se pudieron cargar los presupuestos.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgets();
  }, [projectId]);

  // Función para refrescar la lista después de crear un presupuesto
  const handleBudgetCreated = async () => {
    setIsPanelOpen(false); // Cierra el panel
    setIsLoading(true); // Muestra feedback de carga
    const data = await BudgetApiClient.getProjectBudgets(projectId); // Vuelve a cargar los datos
    setBudgets(data);
    setIsLoading(false);
  };

  const handleOpenViewPanel = (budgetId: string) => {
    setViewingBudgetId(budgetId);
  };

  const handleCloseViewPanel = () => {
    setViewingBudgetId(null);
  };

  const handleSelectBudget = (budgetId: string) => {
    router.push(`?budgetId=${budgetId}`);
  };
  // --- 1. AÑADE LAS NUEVAS FUNCIONES DE ACCIÓN ---
  const handleDeleteBudget = async (budgetId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) {
      try {
        await BudgetApiClient.deleteBudget(budgetId);
        toast.success("Presupuesto eliminado");
        // Refresca la lista de presupuestos
        setBudgets(budgets.filter(b => b.id !== budgetId));
      } catch (error) {
        toast.error("Error al eliminar el presupuesto");
      }
    }
  };

  const handleDuplicateBudget = async (budgetId: string) => {
    try {
      // Asumiendo que tienes un método 'clone' o 'duplicate' en tu API client
      // await BudgetApiClient.cloneBudget(budgetId);
      toast.success("Presupuesto duplicado (función no implementada)");
      // await fetchBudgets(); // Refresca la lista
    } catch (error) {
      toast.error("Error al duplicar el presupuesto");
    }
  };



  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center border rounded-lg bg-red-50 m-6">
        <h3 className="text-lg font-semibold text-red-700">Error</h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-3 px-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Budgets</h2>
        <button
          onClick={() => setIsPanelOpen(true)}
          className="inline-flex items-center gap-2 py-2 px-3.5 bg-violet-50 text-violet-700 text-sm font-medium rounded-lg hover:bg-violet-100 transition-colors"        >
          <Plus size={16} />
          Crear Presupuesto
        </button>
      </div>

      {budgets.length > 0 && (
        // --- 4. Pasamos la nueva función a la tabla ---
        <BudgetListTable
          budgets={budgets}
          onSelectBudget={handleSelectBudget}
          onOpenViewPanel={handleOpenViewPanel}
          onDeleteBudget={handleDeleteBudget}
          onDuplicateBudget={handleDuplicateBudget}
        />
      )}

      {isPanelOpen && (
        <CreateBudgetPanel
          projectId={projectId}
          onClose={() => setIsPanelOpen(false)}
          onBudgetCreated={handleBudgetCreated}
        />
      )}
      <BudgetViewPanel
        isOpen={!!viewingBudgetId}
        onClose={handleCloseViewPanel}
        budgetId={viewingBudgetId!}
      />
    </div>
  );
}