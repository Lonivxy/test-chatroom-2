"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Paperclip, Settings, Users, MessageCircle, Edit, Palette, Paintbrush } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: string
  timestamp: Date
  type: "text" | "file"
  fileName?: string
  fileUrl?: string
}

interface User {
  id: string
  name: string
  ip: string
  color: string
  isOnline: boolean
}

interface Theme {
  name: string
  primary: string
  secondary: string
  background: string
  foreground: string
  card: string
  cardForeground: string
  sidebar: string
  sidebarForeground: string
}

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [tempUserName, setTempUserName] = useState("")
  const [tempUserColor, setTempUserColor] = useState("#ea580c")
  const [currentTheme, setCurrentTheme] = useState<Theme>({
    name: "Orange",
    primary: "#ea580c",
    secondary: "#f97316",
    background: "#ffffff",
    foreground: "#4b5563",
    card: "#fffbeb",
    cardForeground: "#4b5563",
    sidebar: "#ffffff",
    sidebarForeground: "#4b5563",
  })
  const [tempTheme, setTempTheme] = useState<Theme>(currentTheme)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const colorOptions = [
    "#ea580c", // Orange
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange variant
    "#84cc16", // Lime
    "#ec4899", // Pink
  ]

  const themePresets: Theme[] = [
    {
      name: "Orange",
      primary: "#ea580c",
      secondary: "#f97316",
      background: "#ffffff",
      foreground: "#4b5563",
      card: "#fffbeb",
      cardForeground: "#4b5563",
      sidebar: "#ffffff",
      sidebarForeground: "#4b5563",
    },
    {
      name: "Blue",
      primary: "#3b82f6",
      secondary: "#60a5fa",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#eff6ff",
      cardForeground: "#1f2937",
      sidebar: "#f8fafc",
      sidebarForeground: "#1f2937",
    },
    {
      name: "Green",
      primary: "#10b981",
      secondary: "#34d399",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#ecfdf5",
      cardForeground: "#1f2937",
      sidebar: "#f0fdf4",
      sidebarForeground: "#1f2937",
    },
    {
      name: "Purple",
      primary: "#8b5cf6",
      secondary: "#a78bfa",
      background: "#ffffff",
      foreground: "#1f2937",
      card: "#f5f3ff",
      cardForeground: "#1f2937",
      sidebar: "#faf5ff",
      sidebarForeground: "#1f2937",
    },
    {
      name: "Dark",
      primary: "#f97316",
      secondary: "#fb923c",
      background: "#1f2937",
      foreground: "#f9fafb",
      card: "#374151",
      cardForeground: "#f9fafb",
      sidebar: "#111827",
      sidebarForeground: "#f9fafb",
    },
  ]

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    root.style.setProperty("--primary", theme.primary)
    root.style.setProperty("--secondary", theme.secondary)
    root.style.setProperty("--background", theme.background)
    root.style.setProperty("--foreground", theme.foreground)
    root.style.setProperty("--card", theme.card)
    root.style.setProperty("--card-foreground", theme.cardForeground)
    root.style.setProperty("--sidebar", theme.sidebar)
    root.style.setProperty("--sidebar-foreground", theme.sidebarForeground)
    root.style.setProperty("--sidebar-primary", theme.card)
    root.style.setProperty("--sidebar-primary-foreground", theme.cardForeground)
    root.style.setProperty("--sidebar-accent", theme.secondary)
    root.style.setProperty("--sidebar-accent-foreground", theme.background)
  }

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}`

        const savedUser = localStorage.getItem("chatUser")
        let user: User

        if (savedUser) {
          user = JSON.parse(savedUser)
        } else {
          user = {
            id: crypto.randomUUID(),
            name: mockIp,
            ip: mockIp,
            color: "#ea580c",
            isOnline: true,
          }
          localStorage.setItem("chatUser", JSON.stringify(user))
        }

        setCurrentUser(user)

        const savedTheme = localStorage.getItem("chatTheme")
        if (savedTheme) {
          const theme = JSON.parse(savedTheme)
          setCurrentTheme(theme)
          setTempTheme(theme)
          applyTheme(theme)
        } else {
          applyTheme(currentTheme)
        }

        const savedMessages = localStorage.getItem("chatMessages")
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages))
        }

        const savedUsers = localStorage.getItem("chatUsers")
        if (savedUsers) {
          setUsers(JSON.parse(savedUsers))
        } else {
          setUsers([user])
          localStorage.setItem("chatUsers", JSON.stringify([user]))
        }
      } catch (error) {
        console.error("Error initializing user:", error)
      }
    }

    initializeUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages))
    }
  }, [messages])

  const sendMessage = () => {
    if (!currentUser || (!currentMessage.trim() && !selectedFile)) return

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text: selectedFile ? `Shared file: ${selectedFile.name}` : currentMessage,
      sender: currentUser.name,
      timestamp: new Date(),
      type: selectedFile ? "file" : "text",
      fileName: selectedFile?.name,
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    }

    setMessages((prev) => [...prev, newMessage])
    setCurrentMessage("")
    setSelectedFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const openSettings = () => {
    if (currentUser) {
      setTempUserName(currentUser.name)
      setTempUserColor(currentUser.color)
      setTempTheme(currentTheme)
      setIsSettingsOpen(true)
    }
  }

  const saveUserSettings = () => {
    if (!currentUser) return

    const updatedUser = {
      ...currentUser,
      name: tempUserName.trim() || currentUser.ip,
      color: tempUserColor,
    }

    setCurrentUser(updatedUser)
    localStorage.setItem("chatUser", JSON.stringify(updatedUser))

    const updatedUsers = users.map((user) => (user.id === currentUser.id ? updatedUser : user))
    setUsers(updatedUsers)
    localStorage.setItem("chatUsers", JSON.stringify(updatedUsers))

    setCurrentTheme(tempTheme)
    localStorage.setItem("chatTheme", JSON.stringify(tempTheme))
    applyTheme(tempTheme)

    setIsSettingsOpen(false)
  }

  const resetToIP = () => {
    if (currentUser) {
      setTempUserName(currentUser.ip)
    }
  }

  const applyPresetTheme = (preset: Theme) => {
    setTempTheme(preset)
  }

  const updateThemeColor = (property: keyof Theme, color: string) => {
    setTempTheme((prev) => ({ ...prev, [property]: color }))
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback style={{ backgroundColor: currentUser.color }}>
                {currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold text-sidebar-foreground">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.ip}</p>
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" onClick={openSettings}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Settings
                  </DialogTitle>
                  <DialogDescription>
                    Customize your profile and app theme. All changes are saved locally.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="user" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="flex items-center gap-2">
                      <Paintbrush className="h-4 w-4" />
                      Theme
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="user" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Display Name
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="name"
                          value={tempUserName}
                          onChange={(e) => setTempUserName(e.target.value)}
                          placeholder="Enter your display name"
                          className="flex-1"
                        />
                        <Button variant="outline" size="sm" onClick={resetToIP}>
                          Use IP
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use your IP address ({currentUser?.ip})
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Avatar Color
                      </Label>
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            onClick={() => setTempUserColor(color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                              tempUserColor === color ? "border-foreground shadow-lg" : "border-border"
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback style={{ backgroundColor: tempUserColor }}>
                            {(tempUserName || currentUser?.ip || "").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">Preview</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="theme" className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label className="text-sm font-medium mb-3 block">Theme Presets</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {themePresets.map((preset) => (
                            <Button
                              key={preset.name}
                              variant={tempTheme.name === preset.name ? "default" : "outline"}
                              size="sm"
                              onClick={() => applyPresetTheme(preset)}
                              className="justify-start"
                            >
                              <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: preset.primary }} />
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Custom Colors</Label>
                        <div className="grid gap-3">
                          <div className="flex items-center gap-3">
                            <Label className="text-xs w-20">Primary</Label>
                            <input
                              type="color"
                              value={tempTheme.primary}
                              onChange={(e) => updateThemeColor("primary", e.target.value)}
                              className="w-12 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={tempTheme.primary}
                              onChange={(e) => updateThemeColor("primary", e.target.value)}
                              className="flex-1 text-xs"
                              placeholder="#ea580c"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="text-xs w-20">Secondary</Label>
                            <input
                              type="color"
                              value={tempTheme.secondary}
                              onChange={(e) => updateThemeColor("secondary", e.target.value)}
                              className="w-12 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={tempTheme.secondary}
                              onChange={(e) => updateThemeColor("secondary", e.target.value)}
                              className="flex-1 text-xs"
                              placeholder="#f97316"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="text-xs w-20">Background</Label>
                            <input
                              type="color"
                              value={tempTheme.background}
                              onChange={(e) => updateThemeColor("background", e.target.value)}
                              className="w-12 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={tempTheme.background}
                              onChange={(e) => updateThemeColor("background", e.target.value)}
                              className="flex-1 text-xs"
                              placeholder="#ffffff"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <Label className="text-xs w-20">Text</Label>
                            <input
                              type="color"
                              value={tempTheme.foreground}
                              onChange={(e) => updateThemeColor("foreground", e.target.value)}
                              className="w-12 h-8 rounded border border-border cursor-pointer"
                            />
                            <Input
                              value={tempTheme.foreground}
                              onChange={(e) => updateThemeColor("foreground", e.target.value)}
                              className="flex-1 text-xs"
                              placeholder="#4b5563"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveUserSettings}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <Users className="h-4 w-4 mr-2" />
              Users ({users.length})
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 p-4">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-3">Online Users</h3>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/10 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback style={{ backgroundColor: user.color }}>
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.ip}</p>
                </div>
                {user.isOnline && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    Online
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-card-foreground">General Chat</h1>
              <p className="text-sm text-muted-foreground">{users.length} users online</p>
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={openSettings}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback
                    style={{ backgroundColor: users.find((u) => u.name === message.sender)?.color || "#ea580c" }}
                  >
                    {message.sender.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{message.sender}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>
                  <Card className="p-3 bg-card border-border">
                    {message.type === "file" ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary" />
                        <span className="text-sm text-card-foreground">{message.fileName}</span>
                        {message.fileUrl && (
                          <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <a href={message.fileUrl} download={message.fileName} className="text-primary">
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{message.text}</p>
                    )}
                  </Card>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-background">
          {selectedFile && (
            <div className="mb-3 p-2 bg-muted rounded-lg flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground flex-1">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-input border-border"
            />

            <Button onClick={sendMessage} disabled={!currentMessage.trim() && !selectedFile} className="flex-shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
