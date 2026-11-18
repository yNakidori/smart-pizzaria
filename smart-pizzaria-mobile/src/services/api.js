import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Coloque o IP real do seu computador e mantenha o /api/v1
const baseURL = 'http://192.168.15.8:3000/api/v1';
const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@SmartPizzaria:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;