import { fangioClient } from '@/lib/api/clients';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  tokenType: string;
  user: User;
  accessToken: string;
  role: string; // o number, ajusta según tu API
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
      const response = await fangioClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('Login API error:', error.response.data);
        throw new Error(error.response.data.message || 'Error al iniciar sesión');
      }
      console.error('Login generic error:', error);
      throw new Error('Ocurrió un error inesperado durante el inicio de sesión.');
    }
  }

  static async signup(data: SignupData): Promise<User> {
    try {
      const response = await fangioClient.post<User>('/users', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Error al registrar la cuenta');
      }
      throw new Error('Ocurrió un error inesperado durante el registro.');
    }
  }
} 