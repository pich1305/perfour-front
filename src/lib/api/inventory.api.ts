import toast from "react-hot-toast";
import { alonsoClient } from "../config/clients";
import { CreateInventoryItemDto, InventoryApiResponse, InventoryItem, Relation } from "../types";

// Interfaz para los parámetros de la API
interface GetInventoryParams {
  projectId: string;
  page?: number;
  take?: number;
  name?: string;
  status?: string;
}

interface CreateRelationPayload {
  inventoryItemId: string;
  relatedService: 'BUDGET' | 'BILL' | 'TASK';
  relatedEntityId: string;
  createdById: string;
}

// La respuesta de la API ahora incluye el conteo total de items
export interface PaginatedInventoryResponse {
  items: InventoryItem[];
  itemCount: number;
}

class InventoryApiClient {
  static async getProjectInventory(params: GetInventoryParams): Promise<PaginatedInventoryResponse> {
    try {
      const response = await alonsoClient.get<InventoryApiResponse>(`/projects/${params.projectId}/inventory-items`, {
        params: {
          page: params.page,
          take: params.take,
          name: params.name,
          status: params.status,
        },
      });
      
      // Devolvemos tanto los items como el conteo total
      return {
        items: response.data.items || [],
        itemCount: response.data.itemCount || 0,
      };
    } catch (error) {
      console.error('Error al obtener el inventario del proyecto:', error);
      return { items: [], itemCount: 0 };
    }
  }

  /**
   * Obtiene los detalles completos de un único item de inventario por su ID.
   */
  static async getInventoryItemById(itemId: string): Promise<InventoryItem | null> {
    try {
      const response = await alonsoClient.get<InventoryItem>(`/inventory-items/${itemId}`);
      console.log('Inventory item response:', response.data);
      return response.data;

    } catch (error) {
      console.error(`Error al obtener el item de inventario con ID ${itemId}:`, error);
      return null;
    }
  }

  static async createRelation(payload: CreateRelationPayload): Promise<Relation> {
    try { 
      const response = await alonsoClient.post<Relation>(`/inventory-items-relations`, payload);
      return response.data as Relation;
    } catch (error) {
      console.error('Error al crear la relación:', error);
      throw error;
    }
  }

  static async createItem(itemData: CreateInventoryItemDto): Promise<InventoryItem> {
    try {
      const response = await alonsoClient.post<InventoryItem>('/inventory-items', itemData);
      return response.data;
    } catch (error) {
      console.error('Error al crear el item de inventario:', error);
      throw error; // Relanzamos el error para que el formulario lo maneje
    }
  }
  static async deleteItem(itemId: string): Promise<void> {
    try {
      const response = await alonsoClient.delete(`/inventory-items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar el item de inventario:', error);
      throw error;
    }
  }
}


export default InventoryApiClient;