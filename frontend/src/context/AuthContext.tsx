import React, { createContext, useContext, useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { authAPI } from '../services/api'

// ── storage helper — uses localStorage on web, AsyncStorage on phone
const storage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key)
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
        return AsyncStorage.getItem(key)
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value)
            return
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
        AsyncStorage.setItem(key, value)
    },
    removeItem: async (key: string) => {
        if (Platform.OS === 'web') {
            localStorage.removeItem(key)
            return
        }
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default
        AsyncStorage.removeItem(key)
    }
}

type User = {
    id: string
    name: string
    email: string
}

type AuthContextType = {
    user: User | null
    token: string | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadStoredAuth() }, [])

    const loadStoredAuth = async () => {
        try {
            const storedToken = await storage.getItem('token')
            const storedUser = await storage.getItem('user')
            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser))
            }
        } catch (err) {
            console.log('Auth load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const register = async (name: string, email: string, password: string) => {
        const res = await authAPI.register({ name, email, password })
        const { token, user } = res.data
        await storage.setItem('token', token)
        await storage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    const login = async (email: string, password: string) => {
        const res = await authAPI.login({ email, password })
        const { token, user } = res.data
        await storage.setItem('token', token)
        await storage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    const logout = async () => {
        await storage.removeItem('token')
        await storage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)