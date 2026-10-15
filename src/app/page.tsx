"use client";

import { ChatInterface } from "@/components/chat-interface";
import { AddWordDialog } from "@/components/add-word-dialog";
import { 
  SidebarDialog, 
  ChatsContent, 
  HelpContent 
} from "@/components/sidebar-dialogs";
import Link from "next/link";
import { 
  MessageSquarePlus, 
  MessageCircle, 
  Settings, 
  HelpCircle,
  User,
  ChevronDown,
  BookOpen
} from "lucide-react";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [userProfile, setUserProfile] = useState({
    name: "BaklavAI Kullanıcısı",
    email: "kullanici@ornek.com",
    avatarDataUrl: null as string | null,
  });

  useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem("baklavai_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name || parsed.email) {
            setUserProfile(parsed);
          }
        }
      } catch {}
    };
    loadProfile();
    window.addEventListener("profile-updated", loadProfile);
    return () => window.removeEventListener("profile-updated", loadProfile);
  }, []);

  const handleNewChat = () => {
    window.dispatchEvent(new Event("reset-chat"));
  };

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
          {/* Yeni Sohbet (Reloads to clear chat) */}
          <div onClick={handleNewChat}>
            <SidebarButton icon={<MessageSquarePlus className="w-[18px] h-[18px]" />} label="Yeni Sohbet" active />
          </div>
          
          <div className="my-1 border-t border-border/30 mx-2"></div>
          
          {/* Sohbetler Dialog */}
          <SidebarDialog 
            title="Geçmiş Sohbetler" 
            description="Önceki muhabbetlerinize buradan ulaşabilirsiniz."
            trigger={<SidebarButton icon={<MessageCircle className="w-[18px] h-[18px]" />} label="Sohbetler" />}
          >
            <ChatsContent />
          </SidebarDialog>

          {/* Topluluk Sözlüğü Sayfası */}
          <Link href="/sozluk" className="w-full block">
            <SidebarButton icon={<BookOpen className="w-[18px] h-[18px]" />} label="Antep Sözlüğü" />
          </Link>

          <div className="my-1 border-t border-border/30 mx-2"></div>

          {/* Ayarlar → Profil Sayfası */}
          <Link href="/profil" className="w-full block">
            <SidebarButton icon={<Settings className="w-[18px] h-[18px]" />} label="Ayarlar" />
          </Link>

          {/* Yardım Dialog */}
          <SidebarDialog 
            title="Yardım & Destek" 
            trigger={<SidebarButton icon={<HelpCircle className="w-[18px] h-[18px]" />} label="Yardım & Destek" />}
          >
            <HelpContent />
          </SidebarDialog>
        </div>

        {/* Footer Profile Area */}
        <div className="p-6 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center justify-between px-4 py-3 bg-transparent hover:bg-muted/50 outline-none rounded-2xl transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-sm border border-primary/20 overflow-hidden">
                  {userProfile.avatarDataUrl ? (
                    <img src={userProfile.avatarDataUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    userProfile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground/90 truncate max-w-[130px]">
                    {userProfile.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[130px]">
                    {userProfile.email}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground/60" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] rounded-2xl p-2 shadow-lg">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{userProfile.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/profil">
                  <DropdownMenuItem className="cursor-pointer rounded-xl">Profilimi Görüntüle</DropdownMenuItem>
                </Link>
                <Link href="/giris">
                  <DropdownMenuItem className="cursor-pointer rounded-xl font-medium text-primary">Giriş Yap / Hesap Değiştir</DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <Link href="/giris" onClick={() => {
                localStorage.removeItem("baklavai_profile");
                window.dispatchEvent(new Event("profile-updated"));
              }}>
                <DropdownMenuItem className="cursor-pointer rounded-xl text-red-600 focus:text-red-600 focus:bg-red-50">Çıkış Yap</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative bg-transparent overflow-hidden min-h-0">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="md:hidden h-16 shrink-0 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-md z-10 px-4 mx-2 rounded-b-3xl">
          <div className="flex items-center gap-2">
            <div className="text-2xl">🥮</div>
            <h1 className="font-semibold text-lg tracking-tight">
              baklav<span className="text-primary font-bold">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/sozluk"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-semibold hover:bg-secondary/80 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sözlük</span>
            </Link>
            <Link 
              href="/giris"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span>Giriş</span>
            </Link>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 w-full h-full min-h-0 flex flex-col">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}

// Helper component for Sidebar items
// We wrap it in forwardRef so DialogTrigger can inject props into it
import { forwardRef } from "react";

const SidebarButton = forwardRef<HTMLButtonElement, { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }>(
  ({ icon, label, active = false, ...props }, ref) => {
    return (
      <button 
        ref={ref}
        {...props}
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
);
SidebarButton.displayName = "SidebarButton";
