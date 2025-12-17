// src/features/home/components/ProjectListItem.tsx

'use client';

import { Users, Calendar, TrendingUp, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  projectNumber: string;
  status: string;
  type: string;
  daysRemaining: number;
  progressPercentage: number;
  healthStatus: 'on_track' | 'at_risk' | 'delayed';
  memberCount: number;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  'PLANNING': 'bg-gray-100 text-gray-700',
  'IN_PROGRESS': 'bg-blue-100 text-blue-700',
  'COMPLETED': 'bg-green-100 text-green-700',
  'ON_HOLD': 'bg-orange-100 text-orange-700',
  'CANCELLED': 'bg-red-100 text-red-700',
};

const healthIndicators = {
  on_track: {
    icon: CheckCircle,
    color: 'text-green-600',
  },
  at_risk: {
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
  delayed: {
    icon: AlertTriangle,
    color: 'text-red-600',
  },
};

export default function ProjectListItem({ project }: { project: Project }) {
  const statusClass = statusStyles[project.status] || 'bg-gray-100 text-gray-700';
  const healthIndicator = healthIndicators[project.healthStatus];
  const HealthIcon = healthIndicator.icon;

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="p-4 flex items-center gap-4">
        {/* Health Icon */}
        <div className="flex-shrink-0">
          <HealthIcon size={24} className={healthIndicator.color} />
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${statusClass}`}
            >
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-500">{project.projectNumber}</p>
        </div>

        {/* Progress Bar */}
        <div className="hidden md:flex flex-col items-end gap-1 w-32">
          <span className="text-xs font-medium text-gray-600">
            {project.progressPercentage}%
          </span>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
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
        <div className="hidden lg:flex items-center gap-6">
          {/* Members */}
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {project.memberCount}
            </span>
          </div>

          {/* Days */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span
              className={`text-sm font-medium ${
                project.daysRemaining < 0
                  ? 'text-red-600'
                  : project.daysRemaining < 30
                  ? 'text-orange-600'
                  : 'text-gray-900'
              }`}
            >
              {project.daysRemaining < 0
                ? `${Math.abs(project.daysRemaining)}d overdue`
                : `${project.daysRemaining}d left`}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
      </div>
    </Link>
  );
}