"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BudgetListView } from '@/features/budget/views/BudgetListView';
import ModalPresupuesto from '@/features/budget/views/BudgetDetailView';

function BudgetPageContent() {
  const searchParams = useSearchParams();
  const selectedBudgetId = searchParams.get('budgetId');

  if (selectedBudgetId) {
    return <ModalPresupuesto budgetId={selectedBudgetId} onUpdate={() => {}} />;
  } else {
    return <BudgetListView />;
  }
}

export default function BudgetPage() {
  return (
    
    <Suspense fallback={<div className="p-6 text-center animate-pulse">Cargando...</div>}>
      <BudgetPageContent />
    </Suspense>
  );
}