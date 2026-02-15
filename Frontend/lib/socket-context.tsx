"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { io, type Socket } from "socket.io-client"
import { toast } from "sonner"
import { mutate } from "swr"

interface SocketContextValue {
    socket: Socket | null
    isConnected: boolean
    onlineUsers: Set<string>
    sendMessage: (conversationId: string, content: string) => Promise<any>
    emitTyping: (conversationId: string, isTyping: boolean) => void
    markRead: (conversationId: string) => void
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

        const newSocket = io(apiUrl, {
            auth: { token },
            transports: ["websocket", "polling"],
        })

        socketRef.current = newSocket
        setSocket(newSocket)

        newSocket.on("connect", () => {
            setIsConnected(true)
        })

        newSocket.on("disconnect", () => {
            setIsConnected(false)
        })

        // Receive current list of online users on connect
        newSocket.on("onlineUsers", (userIds: string[]) => {
            setOnlineUsers(new Set(userIds))
        })

        newSocket.on("userOnline", (userId: string) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev)
                next.add(userId)
                return next
            })
        })

        newSocket.on("userOffline", (userId: string) => {
            setOnlineUsers((prev) => {
                const next = new Set(prev)
                next.delete(userId)
                return next
            })
        })

        // Show toast notification when a new message arrives
        newSocket.on("newMessage", (message: any) => {
            const senderName = message.sender?.name || "Someone"
            const content = message.content?.length > 50
                ? message.content.substring(0, 50) + "..."
                : message.content

            toast.info(`New message from ${senderName}`, {
                description: content,
                duration: 4000,
            })

            // Revalidate the unread count so sidebar badge updates
            mutate("unread-messages-count")
        })

        return () => {
            newSocket.disconnect()
            socketRef.current = null
        }
    }, [])

    const sendMessage = useCallback(
        (conversationId: string, content: string): Promise<any> => {
            return new Promise((resolve, reject) => {
                if (!socketRef.current) {
                    reject(new Error("Socket not connected"))
                    return
                }
                socketRef.current.emit(
                    "sendMessage",
                    { conversationId, content },
                    (response: any) => {
                        if (response.error) {
                            reject(new Error(response.error))
                        } else {
                            resolve(response)
                        }
                    }
                )
            })
        },
        []
    )

    const emitTyping = useCallback((conversationId: string, isTyping: boolean) => {
        socketRef.current?.emit("typing", { conversationId, isTyping })
    }, [])

    const markRead = useCallback((conversationId: string) => {
        socketRef.current?.emit("markRead", { conversationId })
        // Revalidate unread count after marking as read
        mutate("unread-messages-count")
    }, [])

    return (
        <SocketContext.Provider
            value={{ socket, isConnected, onlineUsers, sendMessage, emitTyping, markRead }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}
