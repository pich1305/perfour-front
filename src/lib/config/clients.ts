import axios from 'axios';
import { VERSTAPPEN_BASE_URL, HAMILTON_BASE_URL, FANGIO_BASE_URL, VETTEL_BASE_URL , ALONSO_BASE_URL} from './api';

export { VERSTAPPEN_BASE_URL };

function setupInterceptors(client: ReturnType<typeof axios.create>) {
  client.interceptors.response.use(
    response => response,
    error => {
      // Manejo de errores centralizado
      if (error.response) {
        // Log detallado del error
        console.error('API error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
          method: error.config?.method,
          headers: error.response.headers
        });
        
        // Log específico para errores 500
        if (error.response.status === 500) {
          console.error('Error 500 - Datos del servidor:', JSON.stringify(error.response.data, null, 2));
        }
      } else {
        // console.error('Network/API error:', error.message);
      }
      return Promise.reject(error);
    }
  );
  return client;
}

export const verstappenClient = setupInterceptors(axios.create({
  baseURL: VERSTAPPEN_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}));

export const hamiltonClient = setupInterceptors(axios.create({
  baseURL: HAMILTON_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}));

export const fangioClient = setupInterceptors(axios.create({
  baseURL: FANGIO_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})); 

export const vettelClient = setupInterceptors(axios.create({
  baseURL: VETTEL_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}))

export const alonsoClient = setupInterceptors(axios.create({
  baseURL: ALONSO_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
}))