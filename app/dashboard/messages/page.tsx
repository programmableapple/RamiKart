"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Send, MoreHorizontal, Phone, Video, ImageIcon, Paperclip, Smile } from "lucide-react"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

interface Contact {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  online?: boolean
}

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [activeContact, setActiveContact] = useState<Contact | null>(null)
  const [messageInput, setMessageInput] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Mock data
  useEffect(() => {
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://ui.shadcn.com/avatars/01.png",
        lastMessage: "Hey, are you still selling that camera?",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        online: true,
      },
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://ui.shadcn.com/avatars/02.png",
        lastMessage: "I'm interested in your iPhone listing",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        online: false,
      },
      {
        id: "3",
        name: "Robert Johnson",
        avatar: "https://ui.shadcn.com/avatars/03.png",
        lastMessage: "Is the price negotiable?",
        lastMessageTime: "Yesterday",
        unreadCount: 1,
        online: true,
      },
      {
        id: "4",
        name: "Emily Davis",
        avatar: "https://ui.shadcn.com/avatars/04.png",
        lastMessage: "Thanks for the quick response!",
        lastMessageTime: "Monday",
        unreadCount: 0,
        online: false,
      },
      {
        id: "5",
        name: "Michael Wilson",
        avatar: "https://ui.shadcn.com/avatars/05.png",
        lastMessage: "When can I pick it up?",
        lastMessageTime: "Monday",
        unreadCount: 0,
        online: true,
      },
    ]

    const mockMessages: Message[] = [
      {
        id: "1",
        senderId: "1",
        receiverId: "current-user",
        content: "Hey, are you still selling that camera?",
        timestamp: "2023-04-15T10:30:00Z",
        read: true,
      },
      {
        id: "2",
        senderId: "current-user",
        receiverId: "1",
        content: "Yes, it's still available!",
        timestamp: "2023-04-15T10:35:00Z",
        read: true,
      },
      {
        id: "3",
        senderId: "1",
        receiverId: "current-user",
        content: "Great! What's the lowest you can go on the price?",
        timestamp: "2023-04-15T10:40:00Z",
        read: true,
      },
      {
        id: "4",
        senderId: "current-user",
        receiverId: "1",
        content: "I can do $220, but that's my final offer.",
        timestamp: "2023-04-15T10:45:00Z",
        read: true,
      },
      {
        id: "5",
        senderId: "1",
        receiverId: "current-user",
        content: "That works for me. When and where can we meet?",
        timestamp: "2023-04-15T10:50:00Z",
        read: false,
      },
      {
        id: "6",
        senderId: "1",
        receiverId: "current-user",
        content: "Also, do you have the original box and accessories?",
        timestamp: "2023-04-15T10:51:00Z",
        read: false,
      },
    ]

    setContacts(mockContacts)
    setMessages(mockMessages)
    setActiveContact(mockContacts[0])
  }, [])

  const filteredContacts = contacts.filter((contact) => {
    if (activeTab === "unread" && !contact.unreadCount) {
      return false
    }

    if (searchQuery) {
      return contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeContact) return

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "current-user",
      receiverId: activeContact.id,
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: false,
    }

    setMessages([...messages, newMessage])
    setMessageInput("")

    // Update last message in contacts
    setContacts(
      contacts.map((contact) => {
        if (contact.id === activeContact.id) {
          return {
            ...contact,
            lastMessage: messageInput,
            lastMessageTime: "Just now",
          }
        }
        return contact
      }),
    )
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Messages" text="Chat with buyers and sellers." />

      <Card className="border-none shadow-md overflow-hidden">
        <div className="grid h-[calc(85vh-10rem)] grid-cols-1 md:grid-cols-3">
          {/* Contacts sidebar */}
          <div className="border-r border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search contacts..."
                  className="pl-9 border-emerald-100 focus-visible:ring-emerald-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
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
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
                      activeContact?.id === contact.id ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                    }`}
                    onClick={() => setActiveContact(contact)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10 border border-emerald-100 dark:border-emerald-900">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{contact.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{contact.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unreadCount ? (
                      <Badge className="bg-emerald-500 text-white">{contact.unreadCount}</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className="col-span-2 flex flex-col">
            {activeContact ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-emerald-100 dark:border-emerald-900">
                      <AvatarImage src={activeContact.avatar || "/placeholder.svg"} alt={activeContact.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                        {activeContact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeContact.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeContact.online ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.senderId === "current-user"
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? "text-emerald-100" : "text-gray-500"}`}>
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      className="flex-1 border-emerald-100 focus-visible:ring-emerald-500"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 rounded-full"
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                    <Send className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">No conversation selected</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Choose a contact to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </DashboardShell>
  )
}
