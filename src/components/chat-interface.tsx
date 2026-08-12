"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, CheckCheck } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  time: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Baklava is more than a dessert in Turkish culture—it's a symbol of hospitality, celebration, and heritage. Passed down through generations, it reflects the richness of Ottoman culinary tradition and the art of patience, precision, and care. Every layer tells a story, and every bite connects us to centuries of culture.",
    time: "10:42 AM",
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const now = new Date()
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input,
      time: timeString
    }
    
    setMessages((prev) => [...prev, newUserMsg])
    setInput("")

    // Fake AI Response for UI demonstration
    setTimeout(() => {
      const aiTime = new Date()
      const aiTimeString = aiTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const fakeAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Vay babayın kemiğine! Bunu dediğin eyi oldu. Şimdi sana Antep usulü efsane bir cevap hazırlıyım bekle zağar...",
        time: aiTimeString
      }
      setMessages((prev) => [...prev, fakeAiMsg])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full relative bg-transparent">
      
      {/* Chat Messages Area */}
      <ScrollArea className="flex-1 w-full z-10 px-4 md:px-12" ref={scrollRef}>
        <div className="flex flex-col py-10 gap-6 pb-32 max-w-[850px] mx-auto">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* Message Bubble */}
              <div 
                className={`relative max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-[1.75rem] shadow-[0_2px_15px_rgba(0,0,0,0.03)] leading-[1.6]
                  ${msg.role === "user" 
                    ? "bg-white text-[#1F2937] rounded-tr-sm" 
                    : "bg-[#F3F8F2] text-[#1F2937] rounded-tl-sm"
                  }`}
              >
                <p className="text-[15.5px] text-[#2D3748]">{msg.content}</p>
                
                {/* Timestamp and Checkmarks */}
                <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] text-[#718096] ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span>{msg.time}</span>
                  {msg.role === "user" && <CheckCheck className="w-4 h-4 text-[#5CB338]" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Floating Input Area (Pill Shaped) */}
      <div className="absolute bottom-8 w-full px-4 z-20 flex justify-center">
        <div className="w-full max-w-[850px]">
          <form 
            onSubmit={handleSend} 
            className="flex items-center gap-3 bg-white rounded-full p-2 pr-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all focus-within:shadow-[0_8px_30px_rgba(92,179,56,0.15)]"
          >
            {/* Attachment Button */}
            <button 
              type="button" 
              className="p-3 text-[#A0AEC0] hover:text-[#4A5568] hover:bg-gray-50 rounded-full transition-colors ml-1"
            >
              <Paperclip className="w-[22px] h-[22px]" />
            </button>
            
            {/* Input Field */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message baklavAI..."
              className="flex-1 bg-transparent border-0 outline-none text-[15.5px] placeholder:text-[#A0AEC0]"
            />
            
            {/* Send Button */}
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="flex items-center justify-center w-[46px] h-[46px] rounded-full bg-[#5CB338] hover:bg-[#4E9B2F] text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
