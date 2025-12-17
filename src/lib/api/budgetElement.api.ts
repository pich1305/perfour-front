// Importamos el cliente base (asumimos que es una instancia de Axios o similar)
import { hamiltonClient } from '@/lib/config/clients';

// --- Definición de Tipos y Enums ---
export enum ElementLevelEnum {
  CATEGORY = 'CATEGORY',
  SUBCATEGORY = 'SUBCATEGORY',
  ITEM = 'ITEM'
}

export enum ElementTypeEnum {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  HONORARIES = 'HONORARIES',
  TAXES = 'TAXES',
  UNEXPECTED = 'UNEXPECTED'
}

export interface BudgetElement {
  id: string;
  name: string;
  description?: string;
  elementLevel: ElementLevelEnum;
  type: ElementTypeEnum;
  unitOfMeasure?: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  status: string;
  budgetId: string;
  parentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  children?: BudgetElement[];
}

// --- Interfaces de Respuesta de API (si son necesarias) ---
export interface BudgetElementResponse {
  status: string;
  data: BudgetElement;
  message: string;
}

export interface BudgetElementsResponse {
  status: string;
  data: {
    totalAmount: number;
    elements: BudgetElement[];
    // ... otros metadatos ...
  };
  message: string;
}

// --- Implementación del Cliente API (Singleton Pattern) ---
class BudgetElementApiClient {
  private static instance: BudgetElementApiClient;

  private constructor() {}

  public static getInstance(): BudgetElementApiClient {
    if (!BudgetElementApiClient.instance) {
      BudgetElementApiClient.instance = new BudgetElementApiClient();
    }
    return BudgetElementApiClient.instance;
  }

  // Método para obtener todos los elementos de un presupuesto
  async getByBudgetId(budgetId: string): Promise<BudgetElementsResponse> {
    const response = await hamiltonClient.get(`/budget-elements?budgetId=${budgetId}`);
    return response.data; // Asumiendo que la data ya tiene el formato BudgetElementsResponse
  }

  // Método para crear un nuevo elemento
  async create(elementData: Omit<BudgetElement, 'id'>): Promise<BudgetElement> {
    const response = await hamiltonClient.post<BudgetElementResponse>(`/budget-elements`, elementData);
    return response.data.data;
  }

  // Método para actualizar un elemento existente
  async update(id: string, updates: Partial<BudgetElement>): Promise<BudgetElement> {
    const response = await hamiltonClient.put<BudgetElementResponse>(`/budget-elements/${id}`, updates);
    return response.data.data;
  }

  // Método para eliminar un elemento
  async delete(id: string): Promise<void> {
    await hamiltonClient.delete(`/budget-elements/${id}`);
  }
  
  // Método para clonar un elemento
  async cloneElement(elementId: string): Promise<any> {
    const response = await hamiltonClient.post(`/budget-elements/${elementId}/clone`);
    return response.data;
  }
}

// Exportamos la instancia única para usar en toda la aplicación
export const budgetElementApiClient = BudgetElementApiClient.getInstance();