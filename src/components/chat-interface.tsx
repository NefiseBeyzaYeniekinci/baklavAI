"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, Paperclip, CheckCheck, Loader2, ArrowDown, ThumbsUp, ThumbsDown, RotateCw, Copy, Check } from "lucide-react"
import ReactMarkdown from "react-markdown"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, "like" | "dislike">>({})

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isAutoScrollEnabled = useRef(true)

  // Keep sessionIdRef in sync
  useEffect(() => {
    sessionIdRef.current = currentSessionId
  }, [currentSessionId])

  // Helper to persist current session to localStorage
  const persistSession = useCallback((sId: string, msgs: Message[]) => {
    if (!msgs || msgs.length === 0) return
    try {
      const stored = localStorage.getItem("baklavai_chat_sessions")
      let sessions: any[] = stored ? JSON.parse(stored) : []
      if (!Array.isArray(sessions)) sessions = []

      const firstUserMsg = msgs.find((m) => m.role === "user")?.content || "Sohbet"
      const title = firstUserMsg.length > 40 ? firstUserMsg.slice(0, 40) + "..." : firstUserMsg
      const nowStr = new Date().toISOString()

      const existingIndex = sessions.findIndex((s: any) => s.id === sId)
      if (existingIndex >= 0) {
        sessions[existingIndex] = {
          ...sessions[existingIndex],
          messages: msgs,
          updatedAt: nowStr,
        }
      } else {
        sessions.unshift({
          id: sId,
          title,
          createdAt: nowStr,
          updatedAt: nowStr,
          messages: msgs,
        })
      }

      localStorage.setItem("baklavai_chat_sessions", JSON.stringify(sessions))
      localStorage.setItem("baklavai_active_session_id", sId)
      window.dispatchEvent(new Event("chats-updated"))
    } catch (e) {
      console.warn("Sohbet kaydedilemedi:", e)
    }
  }, [])

  // Load active session on mount
  useEffect(() => {
    try {
      const activeId = localStorage.getItem("baklavai_active_session_id")
      const stored = localStorage.getItem("baklavai_chat_sessions")
      if (stored) {
        const sessions = JSON.parse(stored)
        if (Array.isArray(sessions) && sessions.length > 0) {
          const current = activeId ? sessions.find((s: any) => s.id === activeId) || sessions[0] : sessions[0]
          if (current && current.messages?.length > 0) {
            setCurrentSessionId(current.id)
            sessionIdRef.current = current.id
            setMessages(current.messages)
            localStorage.setItem("baklavai_active_session_id", current.id)
          }
        }
      }
    } catch {}
  }, [])

  // Listen for reset chat event from sidebar "Yeni Sohbet" button
  useEffect(() => {
    const handleResetChat = () => {
      setCurrentSessionId(null)
      sessionIdRef.current = null
      localStorage.removeItem("baklavai_active_session_id")
      setMessages([])
      setInput("")
      setIsLoading(false)
      setReactions({})
    }

    window.addEventListener('reset-chat', handleResetChat)
    return () => window.removeEventListener('reset-chat', handleResetChat)
  }, [])

  // Listen for load-chat-session event from sidebar history dialog
  useEffect(() => {
    const handleLoadSession = (e: CustomEvent) => {
      const session = e.detail
      if (session && session.id && session.messages) {
        setCurrentSessionId(session.id)
        sessionIdRef.current = session.id
        setMessages(session.messages)
        localStorage.setItem("baklavai_active_session_id", session.id)
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
              top: scrollContainerRef.current.scrollHeight,
              behavior: "smooth"
            })
          }
        }, 80)
      }
    }

    window.addEventListener('load-chat-session', handleLoadSession as EventListener)
    return () => window.removeEventListener('load-chat-session', handleLoadSession as EventListener)
  }, [])

  // Check scroll position to show/hide scroll-to-bottom button and control auto-scroll
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight

    const nearBottom = distanceFromBottom < 120
    isAutoScrollEnabled.current = nearBottom
    setShowScrollBottom(!nearBottom)
  }

  // Scroll to bottom helper
  const scrollToBottom = useCallback((force = false) => {
    if (!scrollContainerRef.current) return
    if (force || isAutoScrollEnabled.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: force ? "smooth" : "auto"
      })
    }
  }, [])

  // Auto scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Core function to send message to /api/chat with streaming
  const sendMessageToApi = async (userText: string, customHistory?: Message[]) => {
    if (!userText.trim() || isLoading) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      time: timeString
    }

    // Ensure active session ID
    let sId = sessionIdRef.current
    if (!sId) {
      sId = Date.now().toString()
      setCurrentSessionId(sId)
      sessionIdRef.current = sId
      localStorage.setItem("baklavai_active_session_id", sId)
    }

    const currentBase = customHistory || messages
    const updatedMessages = [...currentBase, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    isAutoScrollEnabled.current = true

    // Persist immediately with user message
    persistSession(sId, updatedMessages)

    // Force scroll down when sending user message
    setTimeout(() => scrollToBottom(true), 50)

    // Prepare assistant placeholder message
    const assistantMsgId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      time: timeString
    }

    // Add empty assistant message that will be populated via stream
    setMessages((prev) => [...prev, assistantMessage])

    try {
      // Get custom words from localStorage
      let customWords = []
      try {
        const stored = localStorage.getItem("baklavai_custom_words")
        if (stored) {
          customWords = JSON.parse(stored)
        }
      } catch (e) {
        console.error("Local storage okunamadı:", e)
      }

      // Convert messages to API format
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: apiMessages,
          customWords
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || "Sunucudan yanıt alınamadı.")
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("Yanıt akışı başlatılamadı.")
      }

      const decoder = new TextDecoder()
      let accumulatedText = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: accumulatedText }
              : msg
          )
        )

        // Keep scrolling to bottom while streaming if user hasn't scrolled up
        if (isAutoScrollEnabled.current && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
      }

      // Persist completed conversation with assistant message
      const completedMessages = [
        ...updatedMessages,
        {
          id: assistantMsgId,
          role: "assistant" as const,
          content: accumulatedText,
          time: timeString
        }
      ]
      persistSession(sId, completedMessages)
    } catch (error: any) {
      console.error("Mesaj gönderilirken hata oluştu:", error)
      const errorContent = `Aboov rafık, bir aksilik oldu zağar! 😔\n\n_${error.message || "Bir hata oluştu, lütfen tekrar deneyin."}_`

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: errorContent }
            : msg
        )
      )

      const errorMessages = [
        ...updatedMessages,
        {
          id: assistantMsgId,
          role: "assistant" as const,
          content: errorContent,
          time: timeString
        }
      ]
      persistSession(sId, errorMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle regenerating an answer
  const handleRegenerate = (assistantId: string) => {
    if (isLoading) return
    const index = messages.findIndex(m => m.id === assistantId)
    if (index <= 0) return

    // Find the preceding user message
    let lastUserMessage: Message | null = null
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessage = messages[i]
        break
      }
    }

    if (!lastUserMessage) return

    // Slice messages up to before this assistant message and user message
    const previousHistory = messages.slice(0, index - 1)
    sendMessageToApi(lastUserMessage.content, previousHistory)
  }

  // Handle copying message content to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId((curr) => (curr === id ? null : curr))
    }, 2000)
  }

  // Handle like/dislike reactions
  const handleReaction = (id: string, type: "like" | "dislike") => {
    setReactions(prev => ({
      ...prev,
      [id]: prev[id] === type ? undefined as any : type
    }))
  }

  // Listen for custom events from other components (sidebar, add-word dialog, etc.)
  useEffect(() => {
    const handleSendCustomMessage = (e: CustomEvent) => {
      const text = e.detail
      if (!text) return
      sendMessageToApi(text)
    }

    window.addEventListener('send-chat-message', handleSendCustomMessage as EventListener)
    return () => window.removeEventListener('send-chat-message', handleSendCustomMessage as EventListener)
  }, [messages, isLoading])

  // Check URL query parameter on load (e.g. redirected from /kesfet with ?q=...)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const q = params.get("q")
      if (q) {
        window.history.replaceState({}, "", window.location.pathname)
        setTimeout(() => {
          sendMessageToApi(q)
        }, 150)
      }
    }
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput("")
    sendMessageToApi(text)
  }

  // Reusable input form
  const renderInputForm = (isCentered = false) => (
    <form 
      onSubmit={handleSend} 
      className={`flex items-center gap-3 bg-white rounded-full transition-all border border-border/60 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 ${
        isCentered 
          ? "p-2.5 pr-3 shadow-[0_6px_30px_rgba(0,0,0,0.06)]" 
          : "p-2 pr-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
      }`}
    >
      {/* Attachment Button */}
      <button 
        type="button" 
        className="p-2.5 text-[#A0AEC0] hover:text-[#4A5568] hover:bg-gray-100/70 rounded-full transition-colors ml-1 cursor-pointer shrink-0"
        title="Ek ekle (Yakında)"
      >
        <Paperclip className="w-5 h-5" />
      </button>
      
      {/* Input Field */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isLoading ? "BaklavAI cevap veriyor..." : "BaklavAI'ye bir şeyler sor rafık..."}
        disabled={isLoading}
        autoFocus={isCentered}
        className="flex-1 bg-transparent border-0 outline-none text-base text-foreground placeholder:text-[#A0AEC0] disabled:opacity-60 min-w-0"
      />
      
      {/* Send Button */}
      <button 
        type="submit" 
        disabled={!input.trim() || isLoading}
        className="flex items-center justify-center w-[42px] h-[42px] sm:w-[44px] sm:h-[44px] rounded-full bg-[#5CB338] hover:bg-[#4E9B2F] text-white shadow-xs transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-4 h-4 ml-0.5" />
        )}
      </button>
    </form>
  )

  return (
    <div className="flex flex-col h-full w-full min-h-0 relative overflow-hidden bg-transparent">
      
      {/* When NO messages yet: Pure Minimalist Gemini style in Antep theme */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 w-full max-w-[760px] mx-auto text-center animate-in fade-in duration-400">
          
          {/* Headline matching user request */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-foreground/90 mb-6 sm:mb-8">
            <span className="text-primary font-bold">Rafık</span> nerden başlıyak bugün?
          </h1>

          {/* Centered Input Pill */}
          <div className="w-full max-w-[680px]">
            {renderInputForm(true)}
          </div>

        </div>
      ) : (
        /* When messages exist: Full Chat History + Fixed Bottom Bar */
        <>
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto min-h-0 w-full px-3 sm:px-6 md:px-12 overscroll-contain"
          >
            <div className="flex flex-col py-4 sm:py-8 gap-5 sm:gap-8 max-w-[850px] mx-auto min-h-full">
              {messages.map((msg) => {
                // Modern Minimal Typing Indicator
                if (msg.role === "assistant" && !msg.content) {
                  return (
                    <div key={msg.id} className="flex w-full justify-start items-center py-2 animate-in fade-in duration-300">
                      <div className="flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-muted/40 border border-border/40">
                        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 rounded-full bg-primary/70 animate-bounce"></span>
                      </div>
                    </div>
                  )
                }

                // User Message (Crisp, clean bubble on the right)
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex w-full justify-end">
                      <div className="max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-[1.4rem] bg-white text-[#1F2937] border border-border/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] leading-relaxed">
                        <p className="text-[15px]">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-2 text-[10.5px] text-muted-foreground/70">
                          <span>{msg.time}</span>
                          <CheckCheck className="w-3.5 h-3.5 text-primary" />
                        </div>
                      </div>
                    </div>
                  )
                }

                // Assistant Message: PURE FREE-FLOWING (NO ICON, NO 'BaklavAI' LABEL, NO BOX CONTAINER!)
                return (
                  <div key={msg.id} className="flex w-full justify-start items-start">
                    <div className="flex-1 min-w-0">
                      {/* Markdown Text directly rendered */}
                      <div className="text-[15.5px] text-foreground/90 leading-relaxed markdown-content space-y-2.5">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc pl-5 my-1.5 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 my-1.5 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                            h1: ({ children }) => <h1 className="text-lg font-bold text-foreground my-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold text-foreground my-1.5">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold text-foreground my-1">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-3 border-primary/40 pl-3 italic my-1.5 text-muted-foreground">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* 4 Clean Minimal Action Buttons (Like, Dislike, Regenerate, Copy) */}
                      <div className="flex items-center gap-1 mt-3 pt-1 text-muted-foreground/60 select-none">
                        {/* 1. Like Button */}
                        <button
                          type="button"
                          onClick={() => handleReaction(msg.id, "like")}
                          className={`p-1.5 rounded-lg hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer ${
                            reactions[msg.id] === "like" ? "text-primary bg-secondary/80" : ""
                          }`}
                          title="Cevabı Beğen"
                        >
                          <ThumbsUp className="w-[17px] h-[17px]" />
                        </button>

                        {/* 2. Dislike Button */}
                        <button
                          type="button"
                          onClick={() => handleReaction(msg.id, "dislike")}
                          className={`p-1.5 rounded-lg hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer ${
                            reactions[msg.id] === "dislike" ? "text-red-500 bg-red-50" : ""
                          }`}
                          title="Cevabı Beğenme"
                        >
                          <ThumbsDown className="w-[17px] h-[17px]" />
                        </button>

                        {/* 3. Regenerate Button */}
                        <button
                          type="button"
                          onClick={() => handleRegenerate(msg.id)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer disabled:opacity-40"
                          title="Cevabı Yeniden Oluştur"
                        >
                          <RotateCw className="w-[17px] h-[17px]" />
                        </button>

                        {/* 4. Copy Button */}
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 rounded-lg hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
                          title="Cevabı Kopyala"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-[17px] h-[17px] text-primary" />
                          ) : (
                            <Copy className="w-[17px] h-[17px]" />
                          )}
                        </button>

                        {/* Subtle Timestamp */}
                        <span className="text-[11px] text-muted-foreground/40 ml-2">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>

          {/* Floating Jump to Bottom Button */}
          {showScrollBottom && (
            <button
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-24 right-8 md:right-16 z-30 p-2.5 rounded-full bg-white text-muted-foreground hover:text-primary shadow-lg border border-border/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="En aşağı kaydır"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          )}

          {/* Fixed Bottom Input Area (During active conversation) */}
          <div className="shrink-0 w-full px-3 sm:px-4 pt-2 pb-3 sm:pb-6 z-20 flex justify-center bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="w-full max-w-[850px]">
              {renderInputForm(false)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
