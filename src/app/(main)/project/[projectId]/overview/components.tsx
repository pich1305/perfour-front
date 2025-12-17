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