"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Send, MoreHorizontal, Plus, Loader2, MessageCircle, ArrowLeft } from "lucide-react"
import { useNetwork } from "@/lib/network-context"
import { useSocket } from "@/lib/socket-context"
import { useAuth } from "@/lib/auth-context"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Message {
  _id: string
  conversation: string
  sender: {
    _id: string
    name: string
    userName: string
    avatar?: string
  }
  content: string
  read: boolean
  createdAt: string
}

interface Participant {
  _id: string
  name: string
  userName: string
  avatar?: string
  email?: string
}

interface Conversation {
  _id: string
  participants: Participant[]
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
}

interface SearchUser {
  _id: string
  name: string
  userName: string
  avatar?: string
  email?: string
}

export default function MessagesPage() {
  const { get, post, patch } = useNetwork()
  const { socket, onlineUsers, sendMessage, emitTyping, markRead, isConnected } = useSocket()
  const { user: currentUser } = useAuth()

  const [activeTab, setActiveTab] = useState("all")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({})

  // New conversation dialog
  const [newChatOpen, setNewChatOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentUserId = currentUser?._id || (currentUser as any)?.id || ""

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await get<{ conversations: Conversation[] }>("/api/messages/conversations")
      setConversations(data.conversations)
    } catch {
      // Error handled by network context
    } finally {
      setIsLoadingConversations(false)
    }
  }, [get])

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId: string) => {
      setIsLoadingMessages(true)
      try {
        const data = await get<{ messages: Message[] }>(
          `/api/messages/conversations/${conversationId}`
        )
        setMessages(data.messages)
        scrollToBottom()
      } catch {
        // Error handled by network context
      } finally {
        setIsLoadingMessages(false)
      }
    },
    [get, scrollToBottom]
  )

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: { message: Message; conversationId: string }) => {
      const { message, conversationId } = data

      // Update messages if this conversation is active
      setActiveConversation((current) => {
        if (current?._id === conversationId) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m._id === message._id)) return prev
            return [...prev, message]
          })
          scrollToBottom()
          // Mark as read since user is viewing this conversation
          markRead(conversationId)
        }
        return current
      })

      // Update conversation list
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv._id === conversationId) {
              return {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount:
                  activeConversation?._id === conversationId
                    ? conv.unreadCount
                    : conv.unreadCount + 1,
              }
            }
            return conv
          })
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      )
    }

    const handleMessageSent = (data: { message: Message; conversationId: string }) => {
      const { message, conversationId } = data

      setActiveConversation((current) => {
        if (current?._id === conversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev
            return [...prev, message]
          })
          scrollToBottom()
        }
        return current
      })

      // Update conversation list
      setConversations((prev) =>
        prev
          .map((conv) => {
            if (conv._id === conversationId) {
              return {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
              }
            }
            return conv
          })
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          )
      )
    }

    const handleTyping = (data: {
      conversationId: string
      userId: string
      isTyping: boolean
    }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => ({
          ...prev,
          [`${data.conversationId}-${data.userId}`]: data.isTyping,
        }))
      }
    }

    const handleMessagesRead = (data: { conversationId: string; readBy: string }) => {
      // Update read status on messages
      if (data.readBy !== currentUserId) {
        setMessages((prev) =>
          prev.map((m) => (m.sender._id === currentUserId ? { ...m, read: true } : m))
        )
      }
    }

    socket.on("newMessage", handleNewMessage)
    socket.on("messageSent", handleMessageSent)
    socket.on("userTyping", handleTyping)
    socket.on("messagesRead", handleMessagesRead)

    return () => {
      socket.off("newMessage", handleNewMessage)
      socket.off("messageSent", handleMessageSent)
      socket.off("userTyping", handleTyping)
      socket.off("messagesRead", handleMessagesRead)
    }
  }, [socket, currentUserId, scrollToBottom, markRead, activeConversation?._id])

  // Select a conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation)
    await fetchMessages(conversation._id)

    // Mark messages as read
    if (conversation.unreadCount > 0) {
      markRead(conversation._id)
      setConversations((prev) =>
        prev.map((c) => (c._id === conversation._id ? { ...c, unreadCount: 0 } : c))
      )
    }
  }

  // Send a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation || isSending) return

    const content = messageInput.trim()
    setMessageInput("")
    setIsSending(true)

    try {
      await sendMessage(activeConversation._id, content)
      emitTyping(activeConversation._id, false)
    } catch {
      // Restore input on failure
      setMessageInput(content)
    } finally {
      setIsSending(false)
    }
  }

  // Handle typing indicator
  const handleInputChange = (value: string) => {
    setMessageInput(value)

    if (activeConversation) {
      emitTyping(activeConversation._id, true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      typingTimeoutRef.current = setTimeout(() => {
        if (activeConversation) {
          emitTyping(activeConversation._id, false)
        }
      }, 2000)
    }
  }

  // Search users for new conversation
  useEffect(() => {
    if (userSearchQuery.trim().length < 2) {
      setSearchResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await get<{ users: SearchUser[] }>(
          `/api/messages/users/search?q=${encodeURIComponent(userSearchQuery)}`
        )
        setSearchResults(data.users)
      } catch {
        // Error handled by network context
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [userSearchQuery, get])

  // Start a new conversation
  const handleStartConversation = async (userId: string) => {
    try {
      const data = await post<{ conversation: Conversation; existing: boolean }>(
        "/api/messages/conversations",
        { participantId: userId }
      )

      setNewChatOpen(false)
      setUserSearchQuery("")
      setSearchResults([])

      if (data.existing) {
        // Navigate to existing conversation
        const existingConv = conversations.find((c) => c._id === data.conversation._id)
        if (existingConv) {
          handleSelectConversation(existingConv)
        } else {
          await fetchConversations()
          handleSelectConversation(data.conversation)
        }
      } else {
        // Add new conversation and select it
        setConversations((prev) => [{ ...data.conversation, unreadCount: 0 }, ...prev])
        setActiveConversation({ ...data.conversation, unreadCount: 0 })
        setMessages([])
      }
    } catch {
      // Error handled by network context
    }
  }

  // Get the other participant in a conversation
  const getOtherParticipant = (conv: Conversation): Participant => {
    return (
      conv.participants.find((p) => p._id !== currentUserId) || conv.participants[0]
    )
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (activeTab === "unread" && !conv.unreadCount) return false

    if (searchQuery) {
      const otherUser = getOtherParticipant(conv)
      return (
        otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        otherUser.userName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return true
  })

  // Check if someone is typing in the active conversation
  const isOtherUserTyping =
    activeConversation &&
    Object.entries(typingUsers).some(
      ([key, isTyping]) => key.startsWith(activeConversation._id) && isTyping
    )

  return (
    <DashboardShell>
      <DashboardHeader heading="Messages" text="Chat with buyers and sellers." />

      <Card className="border-none shadow-md overflow-hidden">
        <div className="grid h-[calc(85vh-10rem)] grid-cols-1 md:grid-cols-3">
          {/* Contacts sidebar - hidden on mobile when a conversation is active */}
          <div className={`border-r border-gray-200 dark:border-gray-800 ${activeConversation ? "hidden md:block" : "block"}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search contacts..."
                    className="pl-9 border-emerald-100 focus-visible:ring-emerald-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={newChatOpen} onOpenChange={setNewChatOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-full shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>New Conversation</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                        <Input
                          placeholder="Search by name, username, or email..."
                          className="pl-9"
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="mt-4 max-h-64 overflow-y-auto space-y-1">
                        {isSearching ? (
                          <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                              onClick={() => handleStartConversation(user._id)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={
                                    user.avatar
                                      ? `${API_URL}${user.avatar}`
                                      : undefined
                                  }
                                  alt={user.name}
                                />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-gray-500">@{user.userName}</p>
                              </div>
                            </div>
                          ))
                        ) : userSearchQuery.length >= 2 ? (
                          <p className="text-center text-sm text-gray-500 py-4">
                            No users found
                          </p>
                        ) : (
                          <p className="text-center text-sm text-gray-500 py-4">
                            Type at least 2 characters to search
                          </p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="mt-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
                  >
                    Unread
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <ScrollArea className="h-[calc(85vh-14rem)]">
              <div className="space-y-1 p-2">
                {isLoadingConversations ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {searchQuery
                        ? "No contacts match your search"
                        : activeTab === "unread"
                          ? "No unread messages"
                          : "No conversations yet"}
                    </p>
                    {!searchQuery && activeTab === "all" && (
                      <Button
                        variant="link"
                        className="text-emerald-600 mt-2"
                        onClick={() => setNewChatOpen(true)}
                      >
                        Start a new conversation
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const otherUser = getOtherParticipant(conv)
                    const isOnline = onlineUsers.has(otherUser._id)

                    return (
                      <div
                        key={conv._id}
                        className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${activeConversation?._id === conv._id
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : ""
                          }`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-emerald-100 dark:border-emerald-900">
                            <AvatarImage
                              src={
                                otherUser.avatar
                                  ? `${API_URL}${otherUser.avatar}`
                                  : undefined
                              }
                              alt={otherUser.name}
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                              {otherUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">{otherUser.name}</h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {conv.lastMessageAt
                                ? formatMessageTime(conv.lastMessageAt)
                                : ""}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {conv.lastMessage || "No messages yet"}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-emerald-500 text-white">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat area - hidden on mobile when no conversation is active */}
          <div className={`col-span-2 overflow-y-auto ${activeConversation ? "block" : "hidden md:block"}`}>
            {activeConversation ? (
              <div>
                {/* Chat header */}
                {(() => {
                  const otherUser = getOtherParticipant(activeConversation)
                  const isOnline = onlineUsers.has(otherUser._id)
                  return (
                    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="md:hidden shrink-0"
                          onClick={() => setActiveConversation(null)}
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-emerald-100 dark:border-emerald-900">
                            <AvatarImage
                              src={
                                otherUser.avatar
                                  ? `${API_URL}${otherUser.avatar}`
                                  : undefined
                              }
                              alt={otherUser.name}
                            />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                              {otherUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{otherUser.name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isOtherUserTyping
                              ? "Typing..."
                              : isOnline
                                ? "Online"
                                : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })()}

                {/* Messages */}
                <ScrollArea className="h-[calc(85vh-20rem)] p-4">
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full py-8">
                      <div className="text-center">
                        <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No messages yet. Say hello!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isCurrentUser = message.sender._id === currentUserId
                        return (
                          <div
                            key={message._id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                                }`}
                            >
                              <p>{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-100" : "text-gray-500"
                                  }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Typing indicator */}
                {isOtherUserTyping && (
                  <div className="px-4 pb-1">
                    <span className="text-xs text-gray-400 italic animate-pulse">
                      Typing...
                    </span>
                  </div>
                )}

                {/* Message input */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Type a message..."
                      className="flex-1 border-emerald-100 focus-visible:ring-emerald-500"
                      value={messageInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      disabled={isSending}
                    />
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Send className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No conversation selected</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose a contact or start a new conversation
                  </p>
                  <Button
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setNewChatOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </DashboardShell>
  )
}
