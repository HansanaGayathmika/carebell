import axios from 'axios'
import { Platform } from 'react-native'

const BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

// ── automatically add token to every request ───────────────
api.interceptors.request.use(async (config) => {
    let token = null

    if (Platform.OS === 'web') {
        token = localStorage.getItem('token')
    } else {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
        token = await AsyncStorage.getItem('token')
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const authAPI = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
}

export const patientAPI = {
    create: (data: any) => api.post('/patients', data),
    get: () => api.get('/patients'),
    update: (data: any) => api.put('/patients', data),
    delete: () => api.delete('/patients')
}

export const medicationAPI = {
    add: (data: any) => api.post('/medications', data),
    getAll: () => api.get('/medications'),
    update: (id: string, data: any) => api.put(`/medications/${id}`, data),
    delete: (id: string) => api.delete(`/medications/${id}`)
}

export default api