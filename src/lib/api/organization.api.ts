import { fangioClient } from '../config/clients';

export class OrganizationApiClient {
    /**
     * Obtiene las organizaciones por ID de usuario
     * @param userId ID del usuario
     * @returns El presupuesto
     */
    static async getOrganizationsByUserId(userId: string) {
        try {
            const response = await fangioClient.get(`/organizations/user/${userId}`);
            console.log('response organizations', response);
            return response.data;
        } catch (error) {
            console.error('Error al obtener las organizaciones:', error);
            throw error;
        }
    }
}