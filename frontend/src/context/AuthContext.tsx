import React, { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { authAPI } from '../services/api'

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

    // check if already logged in when app opens
    useEffect(() => {
        loadStoredAuth()
    }, [])

    const loadStoredAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token')
            const storedUser = await AsyncStorage.getItem('user')
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
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    const login = async (email: string, password: string) => {
        const res = await authAPI.login({ email, password })
        const { token, user } = res.data
        await AsyncStorage.setItem('token', token)
        await AsyncStorage.setItem('user', JSON.stringify(user))
        setToken(token)
        setUser(user)
    }

    const logout = async () => {
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')
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