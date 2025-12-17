// src/types/index.ts

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
  
  export enum BudgetTypeEnum {
    PRELIMINARY = 'PRELIMINARY',
    SCHEMATIC = 'SCHEMATIC',
    DETAILED = 'DETAILED',
    UPDATED = 'UPDATED',
    FINAL = 'FINAL',
  }
  
  export enum BudgetStatusEnum {
    DRAFT = 'DRAFT',
    UNDER_REVIEW = 'UNDER_REVIEW',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CLOSED = 'CLOSED',
  }
  
  // Define a proper Budget interface
  export interface Budget {
    id: string;
    name: string;
    description?: string;
    budgetType: BudgetTypeEnum;
    currency: 'PYG' | 'USD';
    versionNumber: number;
    startDate: string; // Consider Date
    endDate?: string; // Consider Date
    totalBudgetAmount: number;
    status: BudgetStatusEnum;
    createdBy: string;
    projectId: string;
    createdAt: string; // Consider Date
    updatedAt: string; // Consider Date
    // Add any other relevant budget fields
    // Example fields from CardPresupuesto (these might be calculated or part of a different summary DTO)
    calculatedTotal?: string; // e.g., "GS. 87.100.890" - this suggests a formatted string, ideally backend sends numbers
    fees?: string;            // "GS. 8.710.089"
    discount?: string;        // "GS. 4.355.044"
    totalInvestment?: string; // "GS. 91.455.934"
  
    overallTotalAmount: number;
    elementsByType: ElementTotalByType[];
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
    isTemp?: boolean; // Para grupos temporales
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