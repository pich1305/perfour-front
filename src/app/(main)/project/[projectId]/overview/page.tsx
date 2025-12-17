import { TeamWidget, TasksSummaryWidget, RecentActivityWidget, KeyMetricsCard } from './components';

// --- Simulación de Data Fetching para el Overview ---
// En una app real, llamarías a un endpoint: `/api/projects/${projectId}/overview`
async function getProjectOverviewData(projectId: string) {
  // Simulamos una espera de la API
  await new Promise(resolve => setTimeout(resolve, 300));

  // Devolvemos datos de ejemplo para los widgets
  return {
    kpis: {
      progress: 68,
      daysRemaining: 42,
      budgetSpent: 158300,
      budgetTotal: 250000,
    },
    recentActivity: [
      { id: 1, user: 'Elena Rodriguez', action: 'completó la tarea', target: '02.01.03 Hormigón', time: 'Hace 2 horas' },
      { id: 2, user: 'David Kim', action: 'añadió un nuevo RFI', target: 'Planos Estructurales', time: 'Hace 5 horas' },
      { id: 3, user: 'Enzo Benza', action: 'actualizó el presupuesto', target: '01.01 Movilización', time: 'Ayer' },
    ],
    team: [
      { id: 'u1', name: 'Elena Rodriguez', initials: 'ER', avatarUrl: '/avatars/elena.png' },
      { id: 'u2', name: 'David Kim', initials: 'DK', avatarUrl: '/avatars/david.png' },
      { id: 'u3', name: 'Sarah Chen', initials: 'SC' },
      { id: 'u4', name: 'Enzo Benza', initials: 'EB' },
    ],
    tasksSummary: {
      overdue: 3,
      dueToday: 5,
      nextMilestone: 'Finalización de Estructura',
    }
  };
}

// --- Componente de Página (Server Component) ---
export default async function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const overviewData = await getProjectOverviewData(projectId);

  return (
    <div className="p-6 space-y-6">
      {/* Fila superior con los KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KeyMetricsCard title="Progreso del Proyecto" value={`${overviewData.kpis.progress}%`} />
        <KeyMetricsCard title="Días Restantes" value={overviewData.kpis.daysRemaining.toString()} />
        <KeyMetricsCard 
          title="Presupuesto Gastado" 
          value={`$${overviewData.kpis.budgetSpent.toLocaleString()}`} 
          footer={`de $${overviewData.kpis.budgetTotal.toLocaleString()}`}
        />
        <KeyMetricsCard title="Tareas Atrasadas" value={overviewData.tasksSummary.overdue.toString()} isWarning />
      </div>

      {/* Fila inferior con widgets de detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal (ocupa 2 de 3 espacios en pantallas grandes) */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivityWidget activities={overviewData.recentActivity} />
        </div>
        
        {/* Columna lateral (ocupa 1 de 3 espacios) */}
        <div className="space-y-6">
          <TasksSummaryWidget summary={overviewData.tasksSummary} />
          <TeamWidget members={overviewData.team} />
        </div>
      </div>
    </div>
  );
}


// // src/app/(main)/project/[projectId]/overview/page.tsx

// export default function ProjectOverviewPage() {
//     return (
//       <div>
//         <h2 className="text-2xl font-semibold mb-4">Dashboard de Overview</h2>
//         <p>Aquí va todo el contenido que diseñamos para la pestaña de Overview...</p>
//         {/* Aquí irían tus componentes <RecentTasks />, <BudgetSummary />, etc. */}
//       </div>
//     );
//   }