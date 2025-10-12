'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'buyer' | 'seller' | 'admin'
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (data: RegisterData) => Promise<void>
    logout: () => void
    forgotPassword: (email: string) => Promise<void>
    resetPassword: (token: string, password: string) => Promise<void>
    updateProfile: (data: UpdateProfileData) => Promise<void>
}

interface RegisterData {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: 'buyer' | 'seller'
}

interface UpdateProfileData {
    firstName: string
    lastName: string
    currentPassword?: string
    newPassword?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setLoading(false)
                return
            }

            const response = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            })

            setUser(response.data)
        } catch (error) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password })
            const { user, token } = response.data

            localStorage.setItem('token', token)
            setUser(user)
            toast.success('Login successful!')
            router.push('/dashboard')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed'
            toast.error(message)
            throw error
        }
    }

    const register = async (data: RegisterData) => {
        try {
            const response = await api.post('/auth/register', data)
            const { user, token } = response.data

            localStorage.setItem('token', token)
            setUser(user)
            toast.success('Registration successful!')
            router.push('/dashboard')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Registration failed'
            toast.error(message)
            throw error
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        router.push('/')
        toast.success('Logged out successfully')
    }

    const forgotPassword = async (email: string) => {
        try {
            await api.post('/auth/forgot-password', { email })
            toast.success('Password reset email sent!')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to send reset email'
            toast.error(message)
            throw error
        }
    }

    const resetPassword = async (token: string, password: string) => {
        try {
            await api.post('/auth/reset-password', { token, password })
            toast.success('Password reset successful!')
            router.push('/login')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Password reset failed'
            toast.error(message)
            throw error
        }
    }

    const updateProfile = async (data: UpdateProfileData) => {
        try {
            const response = await api.put('/auth/profile', data)
            setUser(response.data.user)
            toast.success('Profile updated successfully!')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Profile update failed'
            toast.error(message)
            throw error
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                forgotPassword,
                resetPassword,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}





