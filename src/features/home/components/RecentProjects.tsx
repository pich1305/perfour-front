// src/features/home/components/RecentProjects.tsx

'use client';

import React, { useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import ProjectCard from './ProjectCard';
import ProjectListItem from './ProjectListItem';

interface Project {
  id: string;
  name: string;
  projectNumber: string;
  status: string;
  type: string;
  startDatePlanned: string;
  endDatePlanned: string;
  daysRemaining: number;
  daysElapsed: number;
  progressPercentage: number;
  isDelayed: boolean;
  healthStatus: 'on_track' | 'at_risk' | 'delayed';
  memberCount: number;
  updatedAt: string;
}

interface RecentProjectsProps {
  projects: Project[];
  isLoading: boolean;
}

export default function RecentProjects({ projects, isLoading }: RecentProjectsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');

  if (isLoading) {
    return (
      <section className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Proyectos Recientes</h2>
        </div>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-2">
      {/* Header con toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Proyectos Recientes</h2>
        
        {/* Toggle List/Grid */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List size={20} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 text-lg">No tienes proyectos recientes</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Crear Proyecto
          </button>
        </div>
      ) : (
        <>
          {/* Vista Grid */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Vista List */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectListItem key={project.id} project={project} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}