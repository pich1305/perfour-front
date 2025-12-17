import { RFI } from '@/lib/types';

// ============================================================================
// TIPOS DE PARÁMETROS
// ============================================================================

interface GetRfisParams {
  page?: number;
  take?: number;
  status?: string;
  priority?: string;
  search?: string;
  assigneeId?: string;
  creatorId?: string;
  ballInCourtId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'rfiNumber';
  sortOrder?: 'asc' | 'desc';
}

interface GetRfisResponse {
  items: RFI[];
  total: number;
  page: number;
  take: number;
  meta?: {
    statusCounts: {
      total: number;
      open: number;
      responded: number;
      closed: number;
      void: number;
    };
  };
}

interface CreateRfiDto {
  title: string;
  question: string;
  proposedSolution?: string;
  drawingNumber?: string;
  specSection?: string;
  location?: string;
  scheduleImpact?: boolean;
  scheduleDays?: number;
  costImpact?: boolean;
  costAmount?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  assigneeId: string;
  status?: 'DRAFT' | 'OPEN';
  distributionList?: Array<{
    userId: string;
    role: 'REVIEWER' | 'WATCHER';
  }>;
}

interface UpdateRfiDto {
  title?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assigneeId?: string;
  scheduleImpact?: boolean;
  scheduleDays?: number;
  costImpact?: boolean;
  costAmount?: number;
  drawingNumber?: string;
  specSection?: string;
  location?: string;
}

interface ChangeStatusDto {
  status: 'OPEN' | 'PENDING_OFFICIAL' | 'CLOSED' | 'VOID';
  reason?: string;
}

interface CloseRfiDto {
  notes?: string;
}

interface VoidRfiDto {
  reason: string;
}

interface PassBallDto {
  toUserId: string;
  notes?: string;
}

interface AddCommentDto {
  body: string;
  type: 'COMMENT';
}

interface AddOfficialResponseDto {
  body: string;
  changeStatusTo?: 'PENDING_OFFICIAL';
}

interface DuplicateRfiDto {
  title?: string;
  copyAttachments?: boolean;
  copyDistribution?: boolean;
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class RfiApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Helper para obtener headers con autenticación
   */
  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Helper para manejar errores de respuesta
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(error.message || `Error ${response.status}`);
    }
    return response.json();
  }

  // ==========================================================================
  // ENDPOINTS DE RFIs
  // ==========================================================================


/**
 * UC-02: Listar RFIs del proyecto
 * GET /projects/{projectId}/rfis
 */
async getRfis(projectId: string, params: GetRfisParams = {}): Promise<GetRfisResponse> {
  const queryParams = new URLSearchParams();

  // Siempre incluir page y take
  queryParams.append('page', (params.page || 1).toString());
  queryParams.append('take', (params.take || 20).toString());

  // Filtros opcionales
  if (params.status) queryParams.append('status', params.status);
  if (params.priority) queryParams.append('priority', params.priority);
  if (params.search) queryParams.append('search', params.search);
  if (params.assigneeId) queryParams.append('assigneeId', params.assigneeId);
  if (params.creatorId) queryParams.append('creatorId', params.creatorId);
  if (params.ballInCourtId) queryParams.append('ballInCourtId', params.ballInCourtId);
  if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(
    `${this.baseUrl}/projects/${projectId}/rfis?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: this.getHeaders()
    }
  );

  const data = await this.handleResponse<any>(response);

  // ✅ ADAPTADOR: Si el backend devuelve array directo, transformarlo
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: params.page || 1,
      take: params.take || 20,
      meta: {
        statusCounts: this.calculateStatusCounts(data)
      }
    };
  }

  // Si ya viene con estructura correcta, devolverlo tal cual
  return data;
}

/**
 * Helper para calcular contadores de estado desde los items
 */
private calculateStatusCounts(rfis: RFI[]) {
  const counts = {
    total: rfis.length,
    open: 0,
    responded: 0,
    closed: 0,
    void: 0
  };

  rfis.forEach(rfi => {
    switch (rfi.status) {
      case 'OPEN':
        counts.open++;
        break;
      case 'RESPONDED':
        counts.responded++;
        break;
      case 'CLOSED':
        counts.closed++;
        break;
      case 'VOID':
        counts.void++;
        break;
    }
  });

  return counts;
}

  /**
   * UC-03: Obtener RFI por ID
   * GET /projects/{projectId}/rfis/{rfiId}
   */
  async getRfiById(projectId: string, rfiId: string): Promise<RFI> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse<RFI>(response);
  }

  /**
   * UC-01: Crear RFI
   * POST /projects/{projectId}/rfis
   */
  async createRfi(projectId: string, data: CreateRfiDto): Promise<RFI> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse<RFI>(response);
  }

  /**
   * UC-04: Actualizar RFI
   * PATCH /projects/{projectId}/rfis/{rfiId}
   */
  async updateRfi(projectId: string, rfiId: string, data: UpdateRfiDto): Promise<RFI> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse<RFI>(response);
  }

  /**
   * UC-05: Cambiar estado del RFI
   * POST /projects/{projectId}/rfis/{rfiId}/status
   */
  async changeStatus(projectId: string, rfiId: string, data: ChangeStatusDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/status`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-06: Cerrar RFI
   * POST /projects/{projectId}/rfis/{rfiId}/close
   */
  async closeRfi(projectId: string, rfiId: string, data: CloseRfiDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/close`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-07: Anular RFI
   * POST /projects/{projectId}/rfis/{rfiId}/void
   */
  async voidRfi(projectId: string, rfiId: string, data: VoidRfiDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/void`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-08: Pasar la pelota (Ball in Court)
   * POST /projects/{projectId}/rfis/{rfiId}/pass-ball
   */
  async passBall(projectId: string, rfiId: string, data: PassBallDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/pass-ball`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-09: Obtener RFIs donde tengo la pelota
   * GET /projects/{projectId}/rfis/my-ball
   */
  async getMyBallRfis(projectId: string): Promise<GetRfisResponse> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/my-ball`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse<GetRfisResponse>(response);
  }

  /**
   * UC-10: Dashboard de métricas
   * GET /projects/{projectId}/rfis/dashboard
   */
  async getDashboard(projectId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/dashboard`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  // ==========================================================================
  // ENDPOINTS DE RESPONSES
  // ==========================================================================

  /**
   * UC-11: Listar respuestas de un RFI
   * GET /projects/{projectId}/rfis/{rfiId}/responses
   */
  async getResponses(projectId: string, rfiId: string, params?: {
    type?: 'COMMENT' | 'OFFICIAL_RESPONSE';
    authorId?: string;
    includeAttachments?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.authorId) queryParams.append('authorId', params.authorId);
    if (params?.includeAttachments !== undefined) {
      queryParams.append('includeAttachments', params.includeAttachments.toString());
    }

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/responses?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-12: Agregar comentario
   * POST /projects/{projectId}/rfis/{rfiId}/responses
   */
  async addComment(projectId: string, rfiId: string, data: AddCommentDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/responses`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-13: Agregar respuesta oficial
   * POST /projects/{projectId}/rfis/{rfiId}/official-response
   */
  async addOfficialResponse(projectId: string, rfiId: string, data: AddOfficialResponseDto): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/official-response`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-14: Obtener respuesta oficial
   * GET /projects/{projectId}/rfis/{rfiId}/official-response
   */
  async getOfficialResponse(projectId: string, rfiId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/official-response`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  // ==========================================================================
  // ENDPOINTS DE ATTACHMENTS
  // ==========================================================================

  /**
   * UC-15: Subir adjunto al RFI
   * POST /projects/{projectId}/rfis/{rfiId}/attachments
   */
  async uploadRfiAttachment(projectId: string, rfiId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/attachments`,
      {
        method: 'POST',
        headers,
        body: formData
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-16: Subir adjunto a una respuesta
   * POST /projects/{projectId}/rfis/{rfiId}/responses/{responseId}/attachments
   */
  async uploadResponseAttachment(
    projectId: string,
    rfiId: string,
    responseId: string,
    file: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/responses/${responseId}/attachments`,
      {
        method: 'POST',
        headers,
        body: formData
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-17: Listar adjuntos de un RFI
   * GET /projects/{projectId}/rfis/{rfiId}/attachments
   */
  async getAttachments(projectId: string, rfiId: string, params?: {
    belongsTo?: 'rfi' | 'responses' | 'all';
    fileType?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.belongsTo) queryParams.append('belongsTo', params.belongsTo);
    if (params?.fileType) queryParams.append('fileType', params.fileType);

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/attachments?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-18: Eliminar adjunto
   * DELETE /projects/{projectId}/rfis/{rfiId}/attachments/{attachmentId}
   */
  async deleteAttachment(projectId: string, rfiId: string, attachmentId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/attachments/${attachmentId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  // ==========================================================================
  // ENDPOINTS DE DISTRIBUTION
  // ==========================================================================

  /**
   * UC-19: Agregar a lista de distribución
   * POST /projects/{projectId}/rfis/{rfiId}/distribution
   */
  async addToDistribution(projectId: string, rfiId: string, data: {
    userId: string;
    role: 'REVIEWER' | 'WATCHER';
  }): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/distribution`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-20: Obtener lista de distribución
   * GET /projects/{projectId}/rfis/{rfiId}/distribution
   */
  async getDistribution(projectId: string, rfiId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/distribution`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-21: Actualizar rol en distribución
   * PATCH /projects/{projectId}/rfis/{rfiId}/distribution/{distributionId}
   */
  async updateDistributionRole(
    projectId: string,
    rfiId: string,
    distributionId: string,
    data: { role: 'REVIEWER' | 'WATCHER' }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/distribution/${distributionId}`,
      {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-22: Eliminar de lista de distribución
   * DELETE /projects/{projectId}/rfis/{rfiId}/distribution/{distributionId}
   */
  async removeFromDistribution(
    projectId: string,
    rfiId: string,
    distributionId: string
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/distribution/${distributionId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  // ==========================================================================
  // ENDPOINTS DE HISTORY
  // ==========================================================================

  /**
   * UC-23: Obtener historial de un RFI
   * GET /projects/{projectId}/rfis/{rfiId}/history
   */
  async getHistory(projectId: string, rfiId: string, params?: {
    action?: string;
    actorId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.action) queryParams.append('action', params.action);
    if (params?.actorId) queryParams.append('actorId', params.actorId);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/history?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-24: Timeline del RFI
   * GET /projects/{projectId}/rfis/{rfiId}/timeline
   */
  async getTimeline(projectId: string, rfiId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/timeline`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  // ==========================================================================
  // ENDPOINTS ESPECIALES
  // ==========================================================================

  /**
   * UC-25: Exportar RFI a PDF
   * GET /projects/{projectId}/rfis/{rfiId}/export/pdf
   */
  async exportToPdf(projectId: string, rfiId: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/export/pdf`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Error al exportar PDF');
    }

    return response.blob();
  }

  /**
   * UC-26: Duplicar RFI
   * POST /projects/{projectId}/rfis/{rfiId}/duplicate
   */
  async duplicateRfi(projectId: string, rfiId: string, data: DuplicateRfiDto): Promise<RFI> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/${rfiId}/duplicate`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );

    return this.handleResponse<RFI>(response);
  }

  /**
   * UC-27: Buscar RFIs
   * GET /projects/{projectId}/rfis/search
   */
  async searchRfis(projectId: string, query: string, filters?: GetRfisParams): Promise<GetRfisResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);

    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);
    if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);

    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/rfis/search?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse<GetRfisResponse>(response);
  }

  /**
   * UC-28: Notificaciones pendientes
   * GET /users/me/rfis/notifications
   */
  async getNotifications(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/users/me/rfis/notifications`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }

  /**
   * UC-29: Estadísticas del usuario
   * GET /users/{userId}/rfis/stats
   */
  async getUserStats(userId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/rfis/stats`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    return this.handleResponse(response);
  }
}

// Exportar instancia única
export default new RfiApiClient();