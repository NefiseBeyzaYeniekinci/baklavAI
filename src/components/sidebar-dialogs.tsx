import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { ReactElement, ReactNode } from "react"
import { History } from "lucide-react"

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

// 1. Sohbetler (History) Content
export function ChatsContent() {
  return (
    <div className="flex flex-col gap-3">
      {[
        { title: "Küşleme nerede yenir?", time: "Bugün, 14:20" },
        { title: "Sahre için mekan önerisi", time: "Dün, 09:15" },
        { title: "Yuvalama tarifi", time: "3 gün önce" },
      ].map((chat, i) => (
        <DialogClose
          key={i}
          onClick={() => sendChatMessage(chat.title)}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left border border-transparent hover:border-border/50 cursor-pointer w-full"
        >
          <History className="w-5 h-5 text-muted-foreground/60 shrink-0" />
          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-foreground/90">{chat.title}</span>
            <span className="text-[11px] text-muted-foreground">{chat.time}</span>
          </div>
        </DialogClose>
      ))}
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
