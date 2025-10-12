'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
    socket: Socket | null
    connected: boolean
    joinConversation: (conversationId: string) => void
    leaveConversation: (conversationId: string) => void
    sendMessage: (conversationId: string, content: string) => void
    startTyping: (conversationId: string) => void
    stopTyping: (conversationId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [connected, setConnected] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect()
                setSocket(null)
                setConnected(false)
            }
            return
        }

        const token = localStorage.getItem('token')
        if (!token) return

        const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling'],
        })

        newSocket.on('connect', () => {
            console.log('Socket connected')
            setConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected')
            setConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setConnected(false)
        })

        setSocket(newSocket)

        return () => {
            newSocket.disconnect()
        }
    }, [user])

    const joinConversation = (conversationId: string) => {
        if (socket) {
            socket.emit('join_conversation', conversationId)
        }
    }

    const leaveConversation = (conversationId: string) => {
        if (socket) {
            socket.emit('leave_conversation', conversationId)
        }
    }

    const sendMessage = (conversationId: string, content: string) => {
        if (socket) {
            socket.emit('send_message', {
                conversationId,
                message: {
                    content,
                    senderId: user?.id,
                },
            })
        }
    }

    const startTyping = (conversationId: string) => {
        if (socket) {
            socket.emit('typing_start', conversationId)
        }
    }

    const stopTyping = (conversationId: string) => {
        if (socket) {
            socket.emit('typing_stop', conversationId)
        }
    }

    return (
        <SocketContext.Provider
            value={{
                socket,
                connected,
                joinConversation,
                leaveConversation,
                sendMessage,
                startTyping,
                stopTyping,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
}





