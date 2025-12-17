import { hamiltonClient } from '../config/clients';
import { BudgetRelatedResponse } from '../types/budget-related';

export class BudgetApiClient {
    /**
     * Obtiene un presupuesto específico por ID
     * @param budgetId ID del presupuesto
     * @returns El presupuesto
     */
    static async getBudgetById(budgetId: string) {
        try {
            const response = await hamiltonClient.get(`/budgets/${budgetId}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener el presupuesto:', error);
            throw error;
        }
    }

    /**
     * Obtiene un presupuesto específico por ID
     * @param budgetId ID del presupuesto
     * @returns El presupuesto
     */
    static async getProjectBudgets(projectId: string) {
        try {
            const response = await hamiltonClient.get(`/project/${projectId}/budgets`);
            return response.data.items;
        } catch (error) {
            console.error('Error al obtener los presupuestos del proyecto:', error);
            throw error;
        }
    }

    static async createBudget(projectId: string, budgetData: any) {
        try {
            const response = await hamiltonClient.post('/budgets', {
                ...budgetData,
                projectId,
            });
            return response.data;
        } catch (error) {
            console.error('Error al crear el presupuesto:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los presupuestos
     * @returns Lista de presupuestos
     */
    static async getAllBudgets() {
        try {
            const response = await hamiltonClient.get('/budgets');
            return response.data;
        } catch (error) {
            console.error('Error al obtener los presupuestos:', error);
            throw error;
        }
    }

    /**
     * Elimina un presupuesto por ID
     * @param budgetId ID del presupuesto a eliminar
     * @returns Respuesta de la operación
     */
    static async deleteBudget(budgetId: string) {
        try {
            const response = await hamiltonClient.delete(`/budgets/${budgetId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error al eliminar el presupuesto:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Actualiza un presupuesto existente por ID
     * @param budgetId ID del presupuesto
     * @param budgetData Datos a actualizar
     * @returns El presupuesto actualizado
     */
    static async updateBudget(budgetId: string, budgetData: any) {
        try {
            const response = await hamiltonClient.put(`/budgets/${budgetId}`, budgetData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar el presupuesto:', error);
            throw error;
        }
    }

    /**
   * Obtener presupuestos de un proyecto con sus elementos
   */
  static async getBudgetsWithElements(projectId: string): Promise<BudgetRelatedResponse> {
    const params = new URLSearchParams({
      include: 'elements',
      'fields[budget]': 'id,name',
      'fields[elements]': 'id,parentId,name,type,elementLevel'
    });
    try{
        const response = await hamiltonClient.get(`/project/${projectId}/budgets?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener los presupuestos con elementos:', error);
        throw error;
    }
    }
}
