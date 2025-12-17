// src/app/(main)/home/page.tsx

'use client';

import { useAuth } from '@/features/auth/hooks/use-auth.hook';
import { useState, useEffect } from 'react';
import RecentProjects from '@/features/home/components/RecentProjects';
import { ProjectApiClient } from '@/lib/api/project.client';
import ProjectStats from '@/features/home/components/ProjectStats';

interface ProjectSummary {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
    totalMembers: number;
    averageMembersPerProject: number;
    projectsCreatedThisMonth: number;
    pendingInvitations: number;
  };
  recentProjects: Array<{
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
  }>;
  alerts: Array<{
    type: string;
    message: string;
    projectId: string;
    projectName: string;
  }>;
}

export default function HomePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      const fetchSummary = async () => {
        setIsLoading(true);
        try {
          const data = await ProjectApiClient.getSummary();
          setSummary(data);
        } catch (error) {
          console.error('Error fetching summary:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSummary();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  return (
    <div className="mx-6 my-2">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ¡Hola, {user?.firstName || 'Perfi'}!
      </h1>

      {/* Layout: Projects arriba, Stats abajo a la izquierda */}
      <div className="space-y-6">
        {/* Proyectos Recientes - Ocupa todo el ancho */}
        <RecentProjects
          projects={summary?.recentProjects || []}
          isLoading={isLoading}
        />

        {/* Project Stats - Abajo a la izquierda */}
        <div className="w-fit">
          <ProjectStats 
            stats={summary?.stats} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
}