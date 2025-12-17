// src/features/home/components/ProjectStats.tsx

'use client';

import { Briefcase, CheckCircle, Clock, Users, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalMembers: number;
  averageMembersPerProject: number;
  projectsCreatedThisMonth: number;
  pendingInvitations: number;
}

interface ProjectStatsProps {
  stats?: Stats;
  isLoading: boolean;
}

export default function ProjectStats({ stats, isLoading }: ProjectStatsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 w-[320px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stats</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      icon: Briefcase,
      label: 'Total Projects',
      value: stats.totalProjects,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: TrendingUp,
      label: 'Active',
      value: stats.activeProjects,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: CheckCircle,
      label: 'Completed',
      value: stats.completedProjects,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Clock,
      label: 'On Hold',
      value: stats.onHoldProjects,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: stats.totalMembers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: Calendar,
      label: 'Created This Month',
      value: stats.projectsCreatedThisMonth,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm w-[320px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-5">Project Stats</h3>

      <div className="space-y-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  <Icon size={20} className={item.color} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">{item.value}</span>
            </div>
          );
        })}
      </div>

      {/* Average Info */}
      <div className="mt-5 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Avg. Members/Project</span>
          <span className="font-semibold text-gray-900">
            {stats.averageMembersPerProject}
          </span>
        </div>
      </div>

      {/* Pending Invitations (si hay) */}
      {stats.pendingInvitations > 0 && (
        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>{stats.pendingInvitations}</strong> pending invitation
            {stats.pendingInvitations !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
