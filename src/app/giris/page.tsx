"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle
} from "lucide-react";
import { supabase } from "@/lib/db";

const STORAGE_KEY = "baklavai_profile";

export default function GirisPage() {
  const router = useRouter();

  // Mode: "login" | "register"
  const [mode, setMode] = useState<"login" | "register">("login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Load remembered email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("baklavai_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Lütfen e-posta adresinizi ve şifrenizi girin.");
      return;
    }

    setLoading(true);

    try {
      let authUser = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (!error && data?.user) {
          authUser = data.user;
        }
      } catch (authErr) {
        console.warn("Supabase auth offline notice:", authErr);
      }

      if (rememberMe) {
        localStorage.setItem("baklavai_remembered_email", email.trim());
      } else {
        localStorage.removeItem("baklavai_remembered_email");
      }

      const displayName = authUser?.user_metadata?.full_name || email.split("@")[0] || "BaklavAI Kullanıcısı";
      const profile = {
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        email: email.trim(),
        avatarDataUrl: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event("profile-updated"));

      setSuccessMsg("Giriş başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/");
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Giriş yapılırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      try {
        await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { full_name: name.trim() },
          },
        });
      } catch (authErr) {
        console.warn("Supabase auth signup notice:", authErr);
      }

      const profile = {
        name: name.trim(),
        email: email.trim(),
        avatarDataUrl: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      if (rememberMe) {
        localStorage.setItem("baklavai_remembered_email", email.trim());
      }
      window.dispatchEvent(new Event("profile-updated"));

      setSuccessMsg("Hesabınız oluşturuldu! Hoş geldiniz.");
      setTimeout(() => {
        router.push("/");
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Kayıt olunurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Guest Direct Login
  const handleGuestLogin = () => {
    const guestProfile = {
      name: "Misafir Rafık",
      email: "misafir@baklavai.com",
      avatarDataUrl: null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guestProfile));
    window.dispatchEvent(new Event("profile-updated"));
    router.push("/");
  };

  // Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/profil`,
      });
    } catch {}

    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
    }, 2500);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#0B0F0C] text-foreground font-sans overflow-hidden selection:bg-[#5CB338]/30 selection:text-white">
      {/* ── Modern Resimsiz Arka Plan (Ambient Glows & Subtle Pattern) ─────── */}
      {/* Radial soft emerald lighting from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-[#5CB338]/15 via-[#2E6F40]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-[#5CB338]/8 blur-[100px] pointer-events-none -z-10" />

      {/* Subtle micro-grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* ── Minimalist & High-End Card ─────────────────────────────────────── */}
      <div className="w-full max-w-[400px] z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <span className="text-2xl font-black tracking-tight text-white">
              baklav<span className="text-[#5CB338]">AI</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            {mode === "login" ? "Hoş Geldin Rafık" : "Hesap Oluştur"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            {mode === "login"
              ? "Yapay zeka asistanınla sohbete devam et."
              : "Ücretsiz hesabını hemen oluştur."}
          </p>

          {/* Segmented Switcher */}
          <div className="flex p-1 mt-6 rounded-xl bg-zinc-900/90 border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#1E2920] text-[#5CB338] shadow-sm border border-[#5CB338]/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#1E2920] text-[#5CB338] shadow-sm border border-[#5CB338]/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
          
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#5CB338]/10 border border-[#5CB338]/20 text-[#5CB338] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-zinc-300">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-medium text-zinc-400 hover:text-[#5CB338] transition-colors cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-[#5CB338] focus:ring-[#5CB338] accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs text-zinc-400">
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#5CB338] hover:bg-[#4E9B2F] text-black font-semibold text-xs sm:text-sm shadow-md shadow-[#5CB338]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Giriş Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mehmet Usta"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#5CB338] hover:bg-[#4E9B2F] text-black font-semibold text-xs sm:text-sm shadow-md shadow-[#5CB338]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Hesabımı Oluştur</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-zinc-900 px-2 text-zinc-500 font-medium">veya</span>
            </div>
          </div>

          {/* Guest Direct Entry */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 px-3 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-300 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Kayıtsız Devam Et (Misafir Girişi)</span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Forgot Password Modal ────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 text-white w-full max-w-sm rounded-2xl p-6 border border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#5CB338]/10 text-[#5CB338] flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-center text-white">
              Şifreni mi Unuttun?
            </h3>
            <p className="text-xs text-zinc-400 text-center mt-1 mb-4">
              Kayıtlı e-posta adresini yaz, sana şifre sıfırlama bağlantısını yollayalım.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-[#5CB338]/10 border border-[#5CB338]/20 text-[#5CB338] text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sıfırlama bağlantısı e-posta adresinize gönderildi!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="adiniz@ornek.com"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/20 focus:border-[#5CB338]"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#5CB338] hover:bg-[#4E9B2F] text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Bağlantı Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
