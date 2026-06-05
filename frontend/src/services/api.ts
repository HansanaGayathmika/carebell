import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ── change this to your computer's IP address ──────────────
// don't use localhost — your phone can't reach your laptop with localhost
// find your IP: run "ipconfig" in terminal → look for IPv4 Address
const BASE_URL = 'http://192.168.1.162:5000/api'

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

// ── automatically add token to every request ───────────────
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// ── auth ────────────────────────────────────────────────────
export const authAPI = {
    register: (data: { name: string; email: string; password: string }) =>
        api.post('/auth/register', data),

    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),

    getMe: () =>
        api.get('/auth/me')
}

// ── patients ────────────────────────────────────────────────
export const patientAPI = {
    create: (data: any) => api.post('/patients', data),
    get: () => api.get('/patients'),
    update: (data: any) => api.put('/patients', data),
    delete: () => api.delete('/patients')
}

// ── medications ─────────────────────────────────────────────
export const medicationAPI = {
    add: (data: any) => api.post('/medications', data),
    getAll: () => api.get('/medications'),
    update: (id: string, data: any) => api.put(`/medications/${id}`, data),
    delete: (id: string) => api.delete(`/medications/${id}`)
}

export default api