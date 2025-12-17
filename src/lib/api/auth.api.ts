import { fangioClient } from "../config/clients";

// 1. Interfaz User actualizada según tu JSON real
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null; // Antes era profilePictureUrl
  subscriptionPlan: string;  // "FREE"
  subscriptionStatus: string; // "ACTIVE"
  trialActive: boolean;
  trialEndsAt: string;
  trialDaysRemaining: number;
  isEmailVerified: boolean;
  is2faEnabled: boolean;
}

// 2. Definimos qué hay dentro de "data"
export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User; // El usuario anidado aquí
  subscription: any; // Puedes tiparlo mejor si vas a usar los datos de suscripción
  organizations: any[];
}

// 3. La respuesta completa de la API (Top Level)
export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthResponseData; // Aquí está el accessToken y el user
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class AuthApiClient {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // Axios devuelve un objeto con { data, status, headers... }
      // Tu API devuelve dentro de 'data' el objeto { success, message, data: {...} }
      const response = await fangioClient.post<LoginResponse>('/auth/login', credentials);
      console.log('Login response eba:', response);
      return response.data; 
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (apiMessage) {
        console.error('Login API error:', error.response.data);
        throw new Error(apiMessage);
      }
      console.error('Login generic error:', error);
      throw new Error('No se pudo contactar al servidor de autenticación (CORS/Red).');
    }
  }

  static async logout(): Promise<void> {
    try {
      await fangioClient.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw new Error('No se pudo cerrar sesión.');
    }
  }
  static async signup(data: SignupData): Promise<User> {
    try {
      const response = await fangioClient.post<User>('/auth/register', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error al registrar la cuenta');
      }
      throw new Error('Ocurrió un error inesperado durante el registro.');
    }
  }

  static async me(): Promise<{ user: User }> {
    console.log('Fangio Client:', fangioClient);
    const response = await fangioClient.get('/auth/me');
    return response.data.data;
  }
}