import { ChatInterface } from "@/components/chat-interface";
import { AddWordDialog } from "@/components/add-word-dialog";
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Compass, 
  BookMarked, 
  Settings, 
  HelpCircle,
  User,
  ChevronDown
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground p-0 md:p-3 md:pl-0 gap-2">
      {/* Premium Floating Sidebar */}
      <aside className="hidden md:flex flex-col w-[300px] bg-card rounded-r-[2.5rem] shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden relative z-20">
        {/* Logo Area */}
        <div className="pt-10 pb-6 px-10 flex items-center gap-3">
          <div className="text-4xl filter drop-shadow-sm transition-transform hover:scale-105 cursor-default">🥮</div>
          <h1 className="font-medium text-[22px] tracking-tight text-primary/90">
            baklav<span className="text-primary font-bold">AI</span>
          </h1>
        </div>

        {/* Action Area */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-1.5 mt-2">
          <SidebarButton icon={<MessageSquarePlus className="w-[18px] h-[18px]" />} label="Yeni Sohbet" active />
          
          <div className="my-1 border-t border-border/30 mx-2"></div>
          
          <SidebarButton icon={<MessageCircle className="w-[18px] h-[18px]" />} label="Sohbetler" />
          <SidebarButton icon={<Compass className="w-[18px] h-[18px]" />} label="Keşfet" />
          
          {/* AddWordDialog inside SidebarButton look */}
          <div className="w-full">
            <AddWordDialog />
          </div>

          <div className="my-1 border-t border-border/30 mx-2"></div>

          <SidebarButton icon={<Settings className="w-[18px] h-[18px]" />} label="Ayarlar" />
          <SidebarButton icon={<HelpCircle className="w-[18px] h-[18px]" />} label="Yardım & Destek" />
        </div>

        {/* Footer Profile Area */}
        <div className="p-6 pt-2">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-muted/50 rounded-2xl transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-foreground/80">Kullanıcı</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative bg-transparent overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden h-16 flex items-center justify-center border-b border-border/40 bg-card/80 backdrop-blur-md z-10 mx-2 rounded-b-3xl">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🥮</div>
            <h1 className="font-semibold text-lg tracking-tight">
              baklav<span className="text-primary font-bold">AI</span>
            </h1>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 w-full h-full">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

// Helper component for Sidebar items
function SidebarButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button 
      className={`flex items-center gap-4 px-4 py-3.5 rounded-[1.25rem] transition-all duration-200 w-full text-left
      ${active 
        ? "bg-secondary text-primary font-medium shadow-[0_2px_10px_rgba(92,179,56,0.05)]" 
        : "bg-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"}`}
    >
      <span className={active ? "text-primary" : "text-muted-foreground/70"}>{icon}</span>
      <span className="text-[15px]">{label}</span>
    </button>
  );
}
