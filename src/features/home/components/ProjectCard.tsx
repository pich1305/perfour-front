// src/features/home/components/ProjectCard.tsx

'use client';

import { Users, Calendar, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  projectNumber: string;
  status: string;
  type: string;
  daysRemaining: number;
  progressPercentage: number;
  isDelayed: boolean;
  healthStatus: 'on_track' | 'at_risk' | 'delayed';
  memberCount: number;
  updatedAt: string;
}

// Status badges
const statusStyles: Record<string, string> = {
  'PLANNING': 'bg-gray-100 text-gray-700',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700',
  'COMPLETED': 'bg-green-100 text-green-700',
  'ON_HOLD': 'bg-orange-100 text-orange-700',
  'CANCELLED': 'bg-red-100 text-red-700',
};

// Health status indicators
const healthIndicators = {
  on_track: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'On Track',
  },
  at_risk: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    label: 'At Risk',
  },
  delayed: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    label: 'Delayed',
  },
};

export default function ProjectCard({ project }: { project: Project }) {
  const statusClass = statusStyles[project.status] || 'bg-gray-100 text-gray-700';
  const healthIndicator = healthIndicators[project.healthStatus];
  const HealthIcon = healthIndicator.icon;

  // Formatear fecha
  const formatDate = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return updated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      href={`/project/${project.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{project.projectNumber}</p>
          </div>
          
          {/* Health Status Icon */}
          <div className={`p-2 rounded-lg ${healthIndicator.bg}`}>
            <HealthIcon size={20} className={healthIndicator.color} />
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}
        >
          {project.status.replace('_', ' ')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="px-5 py-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className="text-xs font-bold text-gray-900">
            {project.progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              project.healthStatus === 'delayed'
                ? 'bg-red-500'
                : project.healthStatus === 'at_risk'
                ? 'bg-orange-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(project.progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 pt-4 space-y-3">
        {/* Members */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={16} />
            <span className="text-sm">Members</span>
          </div>
          <span className="font-semibold text-gray-900">{project.memberCount}</span>
        </div>

        {/* Days Remaining */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            <span className="text-sm">Days Left</span>
          </div>
          <span
            className={`font-semibold ${
              project.daysRemaining < 0
                ? 'text-red-600'
                : project.daysRemaining < 30
                ? 'text-orange-600'
                : 'text-gray-900'
            }`}
          >
            {project.daysRemaining < 0
              ? `${Math.abs(project.daysRemaining)} overdue`
              : project.daysRemaining}
          </span>
        </div>

        {/* Health Status */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp size={16} />
            <span className="text-sm">Status</span>
          </div>
          <span className={`text-sm font-semibold ${healthIndicator.color}`}>
            {healthIndicator.label}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Updated {formatDate(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}