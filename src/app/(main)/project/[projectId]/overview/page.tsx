interface Member {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

interface TeamWidgetProps {
  members: Member[];
}

export function TeamWidget({ members }: TeamWidgetProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Equipo del Proyecto</h3>
        <button className="text-xs font-semibold text-blue-600 hover:underline">Gestionar</button>
      </div>
      <ul className="space-y-3">
        {members.map(member => (
          <li key={member.id} className="flex items-center">
            {/* Avatar */}
            <img
              src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.initials}&background=random&color=fff`}
              alt={member.name}
              className="w-8 h-8 rounded-full mr-3 object-cover"
            />
            {/* Nombre */}
            <span className="text-sm font-medium text-gray-800">{member.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
interface TasksSummary {
  overdue: number;
  dueToday: number;
  nextMilestone: string;
}

interface TasksSummaryWidgetProps {
  summary: TasksSummary;
}

export function TasksSummaryWidget({ summary }: TasksSummaryWidgetProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Resumen de Tareas</h3>
      <div className="space-y-3">
        {/* Tareas Atrasadas */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tareas Atrasadas</span>
          <span className="font-bold text-sm text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            {summary.overdue}
          </span>
        </div>

        {/* Tareas para Hoy */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tareas para Hoy</span>
          <span className="font-bold text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {summary.dueToday}
          </span>
        </div>

        {/* Próximo Hito */}
        <div className="pt-3 border-t border-gray-100 mt-3">
            <p className="text-xs text-gray-500">Próximo Hito</p>
            <p className="text-sm font-semibold text-gray-900">{summary.nextMilestone}</p>
        </div>
      </div>
    </div>
  );
}
interface KeyMetricsCardProps {
  title: string;
  value: string;
  footer?: string;
  isWarning?: boolean;
}

export function RecentActivityWidget({ activities }: { activities: any[] }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
      <ul className="space-y-4">
        {activities.map(act => (
          <li key={act.id} className="flex items-center text-sm">
            <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
            <div>
              <span className="font-medium text-gray-900">{act.user}</span>
              <span className="text-gray-600"> {act.action} </span>
              <span className="font-medium text-blue-600">{act.target}</span>
              <p className="text-xs text-gray-400">{act.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function KeyMetricsCard({ title, value, footer, isWarning = false }: KeyMetricsCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${isWarning ? 'text-orange-500' : 'text-gray-900'}`}>{value}</p>
      {footer && <p className="mt-1 text-xs text-gray-400">{footer}</p>}
    </div>
  );
}
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
export default async function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  const overviewData = await getProjectOverviewData(params.projectId);

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