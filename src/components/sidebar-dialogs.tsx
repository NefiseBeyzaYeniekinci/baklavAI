import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { ReactElement, ReactNode, useState, useEffect } from "react"
import { History, MessageCircle, Trash2, ArrowRight } from "lucide-react"

// Generic wrapper for our sidebar buttons that need dialogs
export function SidebarDialog({
  trigger,
  title,
  description,
  children
}: {
  trigger: ReactElement
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[480px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const sendChatMessage = (text: string) => {
  window.dispatchEvent(new CustomEvent('send-chat-message', { detail: text }));
}

// 1. Sohbetler (History) Content - Real Persistent Chat History
export function ChatsContent() {
  const [sessions, setSessions] = useState<any[]>([])

  const loadSessions = () => {
    try {
      const stored = localStorage.getItem("baklavai_chat_sessions")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setSessions(parsed)
          return
        }
      }
      setSessions([])
    } catch {
      setSessions([])
    }
  }

  useEffect(() => {
    loadSessions()
    window.addEventListener("chats-updated", loadSessions)
    return () => window.removeEventListener("chats-updated", loadSessions)
  }, [])

  const handleSelectSession = (session: any) => {
    window.dispatchEvent(new CustomEvent('load-chat-session', { detail: session }))
  }

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      const stored = localStorage.getItem("baklavai_chat_sessions")
      if (stored) {
        const parsed = JSON.parse(stored)
        const filtered = parsed.filter((s: any) => s.id !== id)
        localStorage.setItem("baklavai_chat_sessions", JSON.stringify(filtered))
        setSessions(filtered)
        const activeId = localStorage.getItem("baklavai_active_session_id")
        if (activeId === id) {
          localStorage.removeItem("baklavai_active_session_id")
          window.dispatchEvent(new Event("reset-chat"))
        }
      }
    } catch {}
  }

  const handleClearAll = () => {
    localStorage.removeItem("baklavai_chat_sessions")
    localStorage.removeItem("baklavai_active_session_id")
    setSessions([])
    window.dispatchEvent(new Event("reset-chat"))
  }

  // Format date in Turkish
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Bugün"
    try {
      const date = new Date(isoString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      if (diffDays === 0) return `Bugün, ${timeStr}`
      if (diffDays === 1) return `Dün, ${timeStr}`
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    } catch {
      return "Bugün"
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center mb-3">
          <MessageCircle className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-foreground">Henüz kayıtlı sohbetin yok rafık</p>
        <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-[260px]">
          BaklavAI ile yaptığın tüm konuşmalar otomatik olarak buraya kaydedilir.
        </p>
        <DialogClose
          onClick={() => sendChatMessage("Selamın aleyküm rafık, Antep'te bugün ne yiyek?")}
          className="px-4 py-2 rounded-full bg-secondary text-primary hover:bg-secondary/80 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Örnek sohbet başlat</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </DialogClose>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {sessions.length} Sohbet Kaydedildi
        </span>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium cursor-pointer"
        >
          Tümünü Temizle
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
        {sessions.map((session) => (
          <DialogClose
            key={session.id}
            onClick={() => handleSelectSession(session)}
            className="group flex items-center justify-between p-3 rounded-2xl hover:bg-secondary/40 transition-all text-left border border-border/40 hover:border-primary/20 cursor-pointer w-full"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-xl bg-muted/60 group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary flex items-center justify-center shrink-0 transition-colors">
                <History className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-foreground/90 truncate max-w-[260px]">
                  {session.title || "İsimsiz Sohbet"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDate(session.updatedAt || session.createdAt)} • {session.messages?.length || 0} mesaj
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => handleDeleteSession(e, session.id)}
              className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Sohbeti Sil"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </DialogClose>
        ))}
      </div>
    </div>
  )
}

// 2. Ayarlar (Settings) Content
export function SettingsContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 p-3 border rounded-xl">
        <label className="text-sm font-medium text-foreground">Kullanıcı Adı</label>
        <input 
          type="text" 
          defaultValue="BaklavAI Kullanıcısı"
          className="text-sm p-2 rounded-md border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
        />
      </div>
      
      <div className="flex flex-col gap-1.5 p-3 border rounded-xl">
        <label className="text-sm font-medium text-foreground">E-posta Adresi</label>
        <input 
          type="email" 
          defaultValue="kullanici@ornek.com"
          className="text-sm p-2 rounded-md border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
        />
      </div>

      <div className="flex flex-col gap-1.5 p-3 border rounded-xl">
        <label className="text-sm font-medium text-foreground">Yeni Şifre</label>
        <input 
          type="password" 
          placeholder="••••••••"
          className="text-sm p-2 rounded-md border bg-background/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
        />
      </div>

      <button className="mt-2 w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-xl transition-colors">
        Değişiklikleri Kaydet
      </button>
    </div>
  )
}

// 4. Yardım (Help) Content
export function HelpContent() {
  return (
    <div className="flex flex-col gap-4 text-sm text-foreground/80">
      <p>BaklavAI, Gaziantep kültürünü ve şivesini dijital dünyaya taşımak için tasarlanmış özel bir yapay zekadır.</p>
      
      <div className="p-3 bg-muted rounded-xl space-y-2 mt-2">
        <h4 className="font-medium text-foreground">İletişim</h4>
        <p className="text-xs">Hata bildirimi veya önerileriniz için:</p>
        <a href="mailto:destek@baklavai.com" className="text-primary font-medium">destek@baklavai.com</a>
      </div>
    </div>
  )
}
