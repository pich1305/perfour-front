// src/types/index.ts

import { BudgetElement } from "../api/budgetElement.api";

export enum ProjectStatus {
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  POSTPONED = 'POSTPONED',
  FINISHED = 'FINISHED',
  MAINTENANCE = 'MAINTENANCE',
  CANCELLED = 'CANCELLED',
  PROPOSAL = "PROPOSAL"
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  workspaceId: number;
  userId: number;
  status: ProjectStatus;
  createdBy?: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  finishedAt?: Date | null;
  coverImage?: string;
  gallery?: string[];
}

// --- ENUMS ---
// Replicamos los enums del backend para mantener la consistencia.
export enum BudgetTypeEnum {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  INTERNAL = 'INTERNAL',
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export enum BudgetStatusEnum {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

// --- INTERFAZ PRINCIPAL ---
export interface Budget {
  id: string;
  name: string;
  description?: string; // Es `nullable`, por lo tanto opcional
  budgetType: BudgetTypeEnum;
  currency: 'PYG' | 'USD' | string; // Permitimos los conocidos, pero también otros por si acaso
  versionNumber: number;
  totalBudgetAmount: number;
  status: BudgetStatusEnum;
  projectId: string;
  createdById: string;
  updatedById?: string;
  approvedById?: string;
  approvedAt?: string; // La fecha se convierte en string en JSON
  approvedSignatureUrl?: string;
  createdAt: string;
  updatedAt: string;
  elements?: BudgetElement[]; // Asumiendo que tienes una interfaz BudgetElement
  comments?: BudgetComment[];
}

export interface BudgetComment {
  id: string;
  commentText: string;
  createdAt: string;
  createdBy: string;
  userId: string;
}

export interface ElementTotalByType {
  type: string;
  total_amount: number;
}

export enum VettelTaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum TaskElementType {
  GROUP = 'GROUP',
  SUBGROUP = 'SUBGROUP',
  SIMPLE_TASK = 'SIMPLE_TASK',
  MILESTONE = 'MILESTONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TaskElement {
  id: string;
  tasksPackageId: string;
  parentId?: string;
  name: string;
  description?: string;
  type: TaskElementType;
  plannedStartDate: string;
  plannedEndDate: string;
  durationDays?: number;
  actualStartDate?: string;
  actualEndDate?: string;
  completionDate?: Date;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  progressPercentage: number;
  status: VettelTaskStatus;
  priority: TaskPriority;
  assignedUserId?: string;
  assignedContractorText?: string;
  isCritical: boolean;
  slackDays: number;
  costEstimateElementId?: string;
  estimatedEffortHours?: number;
  actualEffortHours?: number;
  lastCommentAt?: Date;
  sortOrder?: number;
  commentsCount?: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isArchived: boolean;
}

export enum PackageStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum PackageType {
  COMPLETE = 'COMPLETE',            // Toda la obra
  PARTIAL = 'PARTIAL',              // Una parte o fase
  TEMPORAL = 'TEMPORAL',            // Agrupación por tiempo (ej. semestre)
  GEOGRAPHIC = 'GEOGRAPHIC',        // Por ubicación (planta baja, sector A)
  EXTERNAL = 'EXTERNAL',            // Terceros responsables
  CLIENT_VISIBLE = 'CLIENT_VISIBLE',// Enfocado a entregables o visibilidad del cliente
  MILESTONE_GROUP = 'MILESTONE_GROUP' // Agrupador de hitos importantes
}

export interface TaskPackage {
  id: string;
  projectId: string; // 🔗 Conecta con verstappen projects
  name: string;
  description?: string;
  packageType: PackageType;
  status: PackageStatus;
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  baselineStartDate?: Date;
  baselineEndDate?: Date;
  progressPercentage: number;
  isArchived: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}


export interface InventoryApiResponse {
  items: InventoryItem[];
  itemCount: number;
  page: number;
  take: number;
}

// Enum para el estado del inventario.
export enum InventoryStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETED = 'COMPLETED', // Asumo que este estado también existe
  OVERDELIVERED = 'OVERDELIVERED',
  CANCELLED = 'CANCELLED',
}

// --- INTERFAZ PRINCIPAL ---
export interface InventoryItem {
  id: string;
  name: string;
  description: string | null;
  internalCode?: string | null; // Opcional, puede no venir
  category: string | null;
  productType?: string | null; // Opcional, puede no venir
  unitOfMeasure: string;
  supplier: string | null;

  // ¡Importante! Estos valores vienen como strings desde la API.
  quantityExpected: string;
  quantityReceived: string;
  quantityPending: string;
  percentageReceived: string;

  // Fechas (pueden ser nulas)
  expectedDeliveryDate: string | null;
  orderedDate: string | null;

  // Timestamps (vienen como strings en formato ISO)
  createdAt: string;
  updatedAt: string;

  status: InventoryStatus;
  notes?: string | null; // Opcional, puede no venir
  budgetElementId?: string | null; // Opcional
  projectId?: string | null; // Opcional

  // IDs de auditoría
  createdById: string;
  updatedById: string | null;

  // Campo interno del backend, opcional en el frontend
  domainEventRegistry?: any[];
  receptions?: Reception[];
  relations: Relation[];
}

export interface Relation
{ 
  id: string;
  inventoryItemId: string;
  relatedService: string;
  relatedEntityId: string;
  cachedName: string;
  cachedCode: string | null;
  cachedStatus: string;
  createdAt: string;
  createdById: string;
}

export interface Reception {
  id: string;
  inventoryItemId: string;
  quantityReceived: string; // Comes as a string from the API
  receivedDate: string;     // Comes as a string (YYYY-MM-DD)
  condition: 'good' | string; // 'good' or other possible values
  notes: string | null;
  createdById: string;
  createdAt: string;        // Comes as an ISO date string
}
export interface CreateInventoryItemDto {
  projectId: string;
  name: string;
  unitOfMeasure: string;
  quantityExpected: number;
  createdById: string;
  description?: string;
  category?: string;
  productType?: string;
  supplier?: string;
  expectedDeliveryDate?: string | null;
  orderedDate?: string | null;
  notes?: string;
}

// ==========================================
// 1. Enums (Asegúrate de que coincidan con tu Backend)
// ==========================================

export type RFIStatus = 'OPEN' | 'CLOSED' | 'DRAFT' | 'VOID' | 'RESPONDED' | 'PENDING_OFFICIAL'; // Agrega los que falten
export type RFIPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RFIResponseType = 'COMMENT' | 'ANSWER' | 'REJECTION'; 
export type HistoryAction = 'CREATED' | 'UPDATED' | 'STATUS_CHANGE' | 'ASSIGNED';
export type DistributionRole = 'WATCHER' | 'REVIEWER' | 'APPROVER';
export type AttachmentType = 'IMAGE' | 'PDF' | 'DOCUMENT' | 'OTHER';

// ==========================================
// 2. Sub-Entidades (Hijos del RFI)
// ==========================================

export interface RFIAttachment {
    id: string;
    name: string;
    fileUrl: string;
    fileType: AttachmentType;
    sizeBytes: number;
    uploaderId: string;
    uploaderName: string;
    uploadedAt: string; // Las fechas vienen como string en JSON
    rfiId?: string;
    responseId?: string;
}

export interface RFIDistribution {
    id: string;
    rfiId: string;
    userId: string;
    userName: string;
    role: DistributionRole;
}

export interface RFIHistory {
    id: string;
    rfiId: string;
    actorId: string;
    actorName: string;
    action: HistoryAction;
    description: string;
    previousValue?: string;
    newValue?: string;
    timestamp: string; // Date -> string
}

export interface RFIResponse {
    id: string;
    rfiId: string;
    authorId: string;
    authorName: string;
    body: string;
    type: RFIResponseType;
    isOfficial: boolean;
    createdAt: string; // Date -> string
    attachments?: RFIAttachment[];
}

// ==========================================
// 3. Entidad Principal (RFI Model)
// ==========================================

export interface RFI {
    id: string;
    projectId: string;
    rfiNumber: string;
    title: string;
    question: string;
    
    // Campos Opcionales
    proposedSolution?: string;
    drawingNumber?: string;
    specSection?: string;
    location?: string;
    
    // Booleanos y Números
    scheduleImpact: boolean;
    scheduleDays?: number;
    costImpact: boolean;
    costAmount?: number;
    
    // Enums y Estado
    status: RFIStatus;
    priority: RFIPriority;
    
    // IDs Relacionados
    ballInCourtId?: string;
    ballInCourtName?: string;
    createdById: string;
    createdByName?: string;
    assigneeId: string;
    assigneeName?: string;

    // Fechas (Strings en el frontend)
    dueDate: string; 
    createdAt: string;
    closedAt?: string;
    
    // Relaciones (Arrays opcionales)
    responses?: RFIResponse[];
    attachments?: RFIAttachment[];
    distribution?: RFIDistribution[];
    history?: RFIHistory[];
}

// ==========================================
// 4. Respuesta de la API (Wrapper)
// ==========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

// Esta es la interfaz específica que usarás en tu servicio del front
export type GetRFIByIdResponse = ApiResponse<RFI>;