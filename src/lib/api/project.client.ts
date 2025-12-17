// src/lib/api/project.api.ts
'use client';

import { verstappenClient } from '../config/clients';

// ✅ INTERCEPTOR DE RESPONSE para manejar errores
verstappenClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('[ProjectAPI] 401 Unauthorized - Token inválido o expirado');
      // Opcional: Redirigir al login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ProjectSummaryResponse {
  success: boolean;
  data: {
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
    projectsByStatus: {
      planning: number;
      inProgress: number;
      completed: number;
      onHold: number;
      cancelled: number;
    };
    metadata: {
      lastUpdated: string;
      userId: string;
      organizationId?: string;
    };
  };
}

export class ProjectApiClient {

  /**
   * Obtener resumen de proyectos para el dashboard
   * GET /projects/summary
   */
  static async getSummary(organizationId?: string, limit?: number): Promise<ProjectSummaryResponse['data']> {
    try {
      console.log('[ProjectAPI] Fetching summary...');
      
      const params = new URLSearchParams();
      if (organizationId) params.append('organizationId', organizationId);
      if (limit) params.append('limit', limit.toString());

      const url = `/projects/summary${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await verstappenClient.get<ProjectSummaryResponse>(url);

      console.log('[ProjectAPI] Summary fetched successfully');
      return response.data.data;
    } catch (error: any) {
      console.error('[ProjectAPI] Error fetching summary:', error);
      console.error('[ProjectAPI] Error details:', error.response?.data);
      throw error;
    }
  }

  /**
   * Obtener proyectos recientes (método antiguo, mantener por compatibilidad)
   * @deprecated Usar getSummary() en su lugar
   */
  static async getRecentProjects(userId: string) {
    try {
      const response = await verstappenClient.get(`/projects/user/${userId}/recent`);
      return response.data;
    } catch (error) {
      console.error('[ProjectAPI] Error fetching recent projects:', error);
      throw error;
    }
  }

  /**
   * Obtener un proyecto por ID
   */
  static async getById(projectId: string) {
    try {
      const response = await verstappenClient.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('[ProjectAPI] Error fetching project:', error);
      throw error;
    }
  }

  /**
   * Crear un proyecto
   */
  static async create(projectData: any) {
    try {
      const response = await verstappenClient.post('/projects', projectData);
      return response.data;
    } catch (error) {
      console.error('[ProjectAPI] Error creating project:', error);
      throw error;
    }
  }

  /**
   * Actualizar un proyecto
   */
  static async update(projectId: string, projectData: any) {
    try {
      const response = await verstappenClient.patch(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('[ProjectAPI] Error updating project:', error);
      throw error;
    }
  }

  /**
   * Eliminar un proyecto
   */
  static async delete(projectId: string) {
    try {
      const response = await verstappenClient.delete(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('[ProjectAPI] Error deleting project:', error);
      throw error;
    }
  }
}

// ✅ EXPORTAR INSTANCIA DE AXIOS por si necesitas usarla directamente
export default verstappenClient;