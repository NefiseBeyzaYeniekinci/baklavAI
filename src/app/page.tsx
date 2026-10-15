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
  BookOpen,
  Menu,
  X,
  Sparkles
} from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/db";
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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatarDataUrl: string | null;
  }>({
    name: "BaklavAI Kullanıcısı",
    email: "kullanici@ornek.com",
    avatarDataUrl: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check Supabase session (captures OAuth callback if redirected from Google)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const profile = {
            name:
              u.user_metadata?.full_name ||
              u.user_metadata?.name ||
              u.email?.split("@")[0] ||
              "BaklavAI Kullanıcısı",
            email: u.email || "",
            avatarDataUrl: u.user_metadata?.avatar_url || null,
          };
          localStorage.setItem("baklavai_profile", JSON.stringify(profile));
          setUserProfile(profile);
          setIsCheckingAuth(false);
          return;
        }
      } catch (e) {
        console.warn("Session check notice:", e);
      }

      // 2. Check localStorage profile
      try {
        const saved = localStorage.getItem("baklavai_profile");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.name || parsed.email)) {
            setUserProfile(parsed);
            setIsCheckingAuth(false);
            return;
          }
        }
      } catch {}

      // 3. Not authenticated -> redirect to /giris
      router.replace("/giris");
    };

    checkAuth();

    // Listen for auth state change from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u = session.user;
        const profile = {
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split("@")[0] ||
            "BaklavAI Kullanıcısı",
          email: u.email || "",
          avatarDataUrl: u.user_metadata?.avatar_url || null,
        };
        localStorage.setItem("baklavai_profile", JSON.stringify(profile));
        setUserProfile(profile);
        setIsCheckingAuth(false);
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("baklavai_profile");
        router.replace("/giris");
      }
    });

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

    window.addEventListener("profile-updated", loadProfile);
    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener("profile-updated", loadProfile);
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem("baklavai_profile");
    window.dispatchEvent(new Event("profile-updated"));
    router.replace("/giris");
  };

  const handleNewChat = () => {
    window.dispatchEvent(new Event("reset-chat"));
  };

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAF8]">
        <div className="flex flex-col items-center gap-3 animate-in fade-in duration-200">
          <div className="text-4xl animate-bounce">🥮</div>
          <div className="font-semibold text-slate-700 text-sm tracking-wide">
            Baklav<span className="text-[#5CB338]">AI</span> açılıyor...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground p-0 md:p-3 md:pl-0 gap-2">
      {/* Premium Floating Sidebar */}
      <aside className="hidden md:flex flex-col w-[300px] bg-card rounded-r-[2.5rem] shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden relative z-20">
        {/* Logo Area */}
        <div className="pt-10 pb-6 px-10 flex items-center gap-3">
          <div className="text-4xl filter drop-shadow-sm transition-transform hover:scale-105 cursor-default">🥮</div>
          <h1 className="font-medium text-[22px] tracking-tight text-primary/90">
            Baklav<span className="text-primary font-bold">AI</span>
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
              <div onClick={handleLogout} className="cursor-pointer">
                <DropdownMenuItem className="cursor-pointer rounded-xl text-red-600 focus:text-red-600 focus:bg-red-50">
                  Çıkış Yap
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative bg-transparent overflow-hidden min-h-0">
        {/* Mobile Header (Shown on Mobile & Tablet < md) */}
        <header className="md:hidden h-14 shrink-0 flex items-center justify-between border-b border-border/40 bg-card/80 backdrop-blur-md z-10 px-3 mx-2 mt-1 rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-muted text-foreground transition-colors cursor-pointer"
              title="Menüyü Aç"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🥮</span>
              <h1 className="font-semibold text-base tracking-tight text-foreground">
                Baklav<span className="text-primary font-bold">AI</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link 
              href="/sozluk"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-secondary text-primary text-xs font-semibold hover:bg-secondary/80 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sözlük</span>
            </Link>
            <Link 
              href="/giris"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{userProfile.name.split(" ")[0] || "Giriş"}</span>
            </Link>
          </div>
        </header>

        {/* Mobile & Tablet Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Panel */}
            <div className="relative w-[300px] max-w-[85vw] bg-card h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
              {/* Drawer Top Branding */}
              <div className="p-5 flex items-center justify-between border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">🥮</span>
                  <div>
                    <h2 className="font-bold text-lg leading-tight text-foreground">
                      Baklav<span className="text-primary">AI</span>
                    </h2>
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                      Gaziantep Asistanı
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                <div onClick={() => { handleNewChat(); setMobileMenuOpen(false); }}>
                  <SidebarButton icon={<MessageSquarePlus className="w-[18px] h-[18px]" />} label="Yeni Sohbet" active />
                </div>

                <div className="my-2 border-t border-border/30"></div>

                <SidebarDialog 
                  title="Geçmiş Sohbetler" 
                  description="Önceki muhabbetlerinize buradan ulaşabilirsiniz."
                  trigger={<SidebarButton icon={<MessageCircle className="w-[18px] h-[18px]" />} label="Sohbetler" />}
                >
                  <ChatsContent />
                </SidebarDialog>

                <Link href="/sozluk" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <SidebarButton icon={<BookOpen className="w-[18px] h-[18px]" />} label="Antep Sözlüğü" />
                </Link>

                <div className="my-2 border-t border-border/30"></div>

                <Link href="/profil" className="w-full block" onClick={() => setMobileMenuOpen(false)}>
                  <SidebarButton icon={<Settings className="w-[18px] h-[18px]" />} label="Profil & Rozetler" />
                </Link>

                <SidebarDialog 
                  title="Yardım & Destek" 
                  trigger={<SidebarButton icon={<HelpCircle className="w-[18px] h-[18px]" />} label="Yardım & Destek" />}
                >
                  <HelpContent />
                </SidebarDialog>
              </div>

              {/* Drawer Footer User Card */}
              <div className="p-4 border-t border-border/40 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-sm border border-primary/20 overflow-hidden">
                      {userProfile.avatarDataUrl ? (
                        <img src={userProfile.avatarDataUrl} alt={userProfile.name} className="w-full h-full object-cover" />
                      ) : (
                        userProfile.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                        {userProfile.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/giris"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-medium bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                  >
                    Giriş / Hesap
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="py-2 text-center text-xs font-medium border border-border text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
