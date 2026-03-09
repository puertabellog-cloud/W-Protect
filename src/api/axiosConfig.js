import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Interceptor para agregar el token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirigir al login si el token no es válido
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;