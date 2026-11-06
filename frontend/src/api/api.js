// src/api/api.js
import axios from 'axios';

// Создаем один глобальный экземпляр Axios с базовым URL (Требование ТЗ)
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Адрес нашего запущенного Node.js сервера
  withCredentials: true,                // Нужно для передачи токенов/кук безопасности
});

// Перехватчик запросов (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    // Перед тем как запрос улетит на сервер, берем токен из хранилища браузера
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Если токен есть, автоматически добавляем его в заголовок Authorization (Bearer токен)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
