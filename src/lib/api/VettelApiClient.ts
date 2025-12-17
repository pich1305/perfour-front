import type { TaskElement, TaskPackage } from '@/types';
import { VettelTaskStatus } from '@/types';
import { vettelClient } from '@/lib/config/clients';

function normalizeTaskElement(raw: any): TaskElement {
  const statusMapToFrontend: Record<string, VettelTaskStatus> = {
    NOT_STARTED: VettelTaskStatus.NOT_STARTED,
    IN_PROGRESS: VettelTaskStatus.IN_PROGRESS,
    PAUSED: VettelTaskStatus.PAUSED,
    COMPLETED: VettelTaskStatus.COMPLETED,
    OVERDUE: VettelTaskStatus.OVERDUE,
    CANCELLED: VettelTaskStatus.CANCELLED,
  } as const;

  const normalized: any = { ...raw };
  if (typeof normalized.status === 'string') {
    const upper = normalized.status.toUpperCase();
    const mapped = statusMapToFrontend[upper as keyof typeof statusMapToFrontend];
    if (mapped) normalized.status = mapped;
  }
  if (typeof normalized.progressPercentage === 'string') {
    const n = Number(normalized.progressPercentage);
    normalized.progressPercentage = isNaN(n) ? 0 : n;
  }
  if (Array.isArray(raw?.children)) {
    normalized.children = raw.children.map((c: any) => normalizeTaskElement(c));
  }
  return normalized as TaskElement;
}

export type AssignmentRole = 'RESPONSIBLE' | 'ACCOUNTABLE' | 'CONSULTED' | 'INFORMED';

export interface TaskAssignee {
  id: string;
  taskElementId: string;
  userId: string;
  role: AssignmentRole | string;
  isPrimaryAssignee: boolean;
  createdBy: string;
  assignedAt: string | Date;
}

export class VettelApiClient {
  static async createTaskPackage(projectId: string, data: any): Promise<TaskPackage> {
    const response = await vettelClient.post('/tasks-packages', { ...data, projectId });
    return response.data;
  }

  static async getTaskPackagesByProject(projectId: string): Promise<TaskPackage[]> {
    const response = await vettelClient.get(`/tasks-packages/project/${projectId}`);
    return response.data;
  }

  static async updateTaskPackage(id: string, data: Partial<TaskPackage>): Promise<TaskPackage> {
    const response = await vettelClient.put(`/tasks-packages/${id}`, data);
    return response.data;
  }

  static async deleteTaskPackage(id: string): Promise<void> {
    await vettelClient.delete(`/tasks-packages/${id}`);
  }

  static async getTaskElementsByPackage(taskPackageId: string): Promise<TaskElement[]> {
    const response = await vettelClient.get(`/task-elements/task-package/${taskPackageId}`);
    const raw = response.data;
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
    return list.map(normalizeTaskElement);
  }

  static async createTaskElement(data: Partial<TaskElement>): Promise<TaskElement> {
    const payload: any = { ...data };
    if (payload.status) {
      const map: Record<string, string> = {
        not_started: 'NOT_STARTED',
        in_progress: 'IN_PROGRESS',
        paused: 'PAUSED',
        completed: 'COMPLETED',
        overdue: 'OVERDUE',
        cancelled: 'CANCELLED',
      };
      if (typeof payload.status === 'string') {
        payload.status = map[payload.status] ?? String(payload.status).toUpperCase();
      }
    }
    const response = await vettelClient.post('/task-elements', payload);
    return normalizeTaskElement(response.data);
  }

  static async updateTaskElement(id: string, data: Partial<TaskElement>): Promise<TaskElement> {
    const payload: any = { ...data };
    if (payload.status) {
      const map: Record<string, string> = {
        not_started: 'NOT_STARTED',
        in_progress: 'IN_PROGRESS',
        paused: 'PAUSED',
        completed: 'COMPLETED',
        overdue: 'OVERDUE',
        cancelled: 'CANCELLED',
      };
      if (typeof payload.status === 'string') {
        payload.status = map[payload.status] ?? String(payload.status).toUpperCase();
      }
    }
    const response = await vettelClient.patch(`/task-elements/${id}`, payload);
    return normalizeTaskElement(response.data);
  }

  static async getTaskElementById(id: string): Promise<TaskElement> {
    const response = await vettelClient.get(`/task-elements/${id}`);
    return normalizeTaskElement(response.data);
  }

  static async deleteTaskElement(id: string): Promise<void> {
    await vettelClient.delete(`/task-elements/${id}`);
  }

  static async listTaskAssigneesByUser(userId: string): Promise<TaskAssignee[]> {
    try {
      const response = await vettelClient.get('/task-assignees', { params: { userId } });
      return Array.isArray(response.data) ? response.data : [];
    } catch (e: any) {
      if (e?.response?.status === 404) return [];
      return [];
    }
  }

  static async listTaskAssigneesByTaskElement(taskElementId: string): Promise<TaskAssignee[]> {
    try {
      const response = await vettelClient.get('/task-assignees', { params: { taskElementId } });
      return Array.isArray(response.data) ? response.data : [];
    } catch (e: any) {
      if (e?.response?.status === 404) return [];
      return [];
    }
  }

  static async getTaskAssigneeById(id: string): Promise<TaskAssignee> {
    const response = await vettelClient.get(`/task-assignees/${id}`);
    return response.data;
  }

  static async createTaskAssignee(data: {
    taskElementId: string;
    userId: string;
    role: AssignmentRole;
    isPrimaryAssignee?: boolean;
    createdBy: string;
  }): Promise<TaskAssignee> {
    const response = await vettelClient.post('/task-assignees', data);
    return response.data;
  }

  static async updateTaskAssignee(
    id: string,
    data: { role?: AssignmentRole; isPrimaryAssignee?: boolean }
  ): Promise<TaskAssignee> {
    const response = await vettelClient.put(`/task-assignees/${id}`, data);
    return response.data;
  }

  static async deleteTaskAssignee(id: string): Promise<void> {
    await vettelClient.delete(`/task-assignees/${id}`);
  }

  // Task dependencies
  static async createTaskDependency(data: {
    predecessorId: string;
    successorId: string;
    type: string; // e.g., 'FINISH_TO_START'
    lagDays?: number;
    createdBy: string;
  }): Promise<any> {
    const response = await vettelClient.post('/task-dependencies', data);
    return response.data;
  }

  static async deleteTaskDependency(id: string): Promise<void> {
    await vettelClient.delete(`/task-dependencies/${id}`);
  }

  static async listTaskDependenciesByTaskElement(taskElementId: string): Promise<any[]> {
    const response = await vettelClient.get(`/task-dependencies/by-task-element/${taskElementId}`);
    return Array.isArray(response.data) ? response.data : [];
  }
}


