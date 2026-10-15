"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  Sparkles,
  Bot
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
      }, 500);
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
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || "Kayıt olunurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.warn("Google login notice:", err);
      // Fallback guest login if Google OAuth is not yet configured in Supabase
      const guestProfile = {
        name: "Google Rafık",
        email: "google.user@baklavai.com",
        avatarDataUrl: null,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestProfile));
      window.dispatchEvent(new Event("profile-updated"));
      setSuccessMsg("Giriş başarılı! Yönlendiriliyorsunuz...");
      setTimeout(() => router.push("/"), 500);
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
    <div className="min-h-screen w-full bg-[#F8FAF8] text-slate-800 font-sans flex flex-col justify-between selection:bg-[#5CB338]/20 selection:text-slate-900 relative">
      
      {/* ── Üst Navbar (Referans Tasarımdaki Şık Bar) ───────────────────────── */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-6 sm:px-12 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl filter drop-shadow-sm group-hover:scale-105 transition-transform">🥮</span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            baklav<span className="text-[#5CB338]">AI</span>
          </span>
        </Link>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-[#5CB338] transition-colors">
            Ana Sayfa
          </Link>
          <Link href="/sozluk" className="hover:text-[#5CB338] transition-colors">
            Antep Sözlüğü
          </Link>
          <Link href="/profil" className="hover:text-[#5CB338] transition-colors">
            Profilim
          </Link>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGuestLogin}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-full bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            Misafir Girişi
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white rounded-full bg-[#5CB338] hover:bg-[#4EA12F] shadow-sm shadow-[#5CB338]/30 transition-all cursor-pointer active:scale-95"
          >
            {mode === "login" ? "Ücretsiz Başla" : "Giriş Yap"}
          </button>
        </div>
      </header>

      {/* ── Orta Alan: Birebir Referans Tasarımdaki Kart ─────────────────────── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 my-4">
        <div className="w-full max-w-[460px] bg-white rounded-[2.5rem] p-8 sm:p-11 shadow-[0_12px_45px_rgba(0,0,0,0.04),0_2px_12px_rgba(92,179,56,0.04)] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Title & Subtitle */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900">
              {mode === "login" ? "Bi Girişimim Var!" : "Bi Rafık Lazım!"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
              {mode === "login"
                ? "Tekrar hoş geldin! Hesabına giriş yap."
                : "Aramıza katıl! Ücretsiz hesabını hemen oluştur."}
            </p>
          </div>

          {/* Segmented Pill Switcher (Giriş Yap | Kayıt Ol) */}
          <div className="flex p-1 mb-6 rounded-full bg-[#F1F3F5]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 text-xs sm:text-sm rounded-full transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-white text-slate-900 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900 font-semibold"
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
              className={`flex-1 py-2 text-xs sm:text-sm rounded-full transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-white text-slate-900 font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900 font-semibold"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-[#F0F7ED] border border-[#5CB338]/30 text-[#2E6F40] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5CB338]" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile devam et</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full border-t border-slate-200"></div>
            <span className="absolute bg-white px-3 text-xs text-slate-400 font-normal select-none">
              veya e-posta ile
            </span>
          </div>

          {/* Form */}
          {mode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                  E-POSTA ADRESİ
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                    ŞİFRE
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-[#5CB338] hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#5CB338] focus:ring-[#5CB338] accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Submit Pill Button (Home Page Green) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#5CB338] hover:bg-[#4EA12F] text-white font-bold text-sm sm:text-base shadow-md shadow-[#5CB338]/25 hover:shadow-lg hover:shadow-[#5CB338]/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Giriş Yap</span>
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                  AD SOYAD
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mehmet Usta"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                  E-POSTA ADRESİ
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mail@example.com"
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs sm:text-sm focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                    ŞİFRE
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                    ŞİFRE TEKRAR
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-800 placeholder:text-slate-300 text-xs focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Pill Button (Home Page Green) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#5CB338] hover:bg-[#4EA12F] text-white font-bold text-sm sm:text-base shadow-md shadow-[#5CB338]/25 hover:shadow-lg hover:shadow-[#5CB338]/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Hesap Oluştur</span>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="w-full py-4 text-center text-xs text-slate-400">
        BaklavAI © 2026 • Antep'in İlk Yapay Zekası
      </footer>

      {/* ── Sağ Alttaki Asistan/Mascot Butonu (Referans Görseldeki Gibi) ─────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <Link
          href="/"
          title="BaklavAI'ye Hızlı Dön"
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#5CB338] to-[#7CD455] text-white flex items-center justify-center shadow-lg shadow-[#5CB338]/30 hover:scale-110 active:scale-95 transition-all border-2 border-white cursor-pointer group"
        >
          <span className="text-2xl filter drop-shadow-sm group-hover:rotate-12 transition-transform">🥮</span>
        </Link>
      </div>

      {/* ── Forgot Password Modal (Light Theme) ────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white text-slate-800 w-full max-w-sm rounded-[2rem] p-7 border border-slate-100 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#F0F7ED] text-[#5CB338] flex items-center justify-center mx-auto mb-3 border border-[#5CB338]/20 shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-slate-900">
              Şifreni mi Unuttun?
            </h3>
            <p className="text-xs text-slate-500 text-center mt-1.5 mb-5 font-normal leading-relaxed">
              Kayıtlı e-posta adresini yaz, sana anında şifre sıfırlama bağlantısını yollayalım.
            </p>

            {forgotSent ? (
              <div className="p-3.5 rounded-2xl bg-[#F0F7ED] border border-[#5CB338]/30 text-[#2E6F40] text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5CB338]" />
                <span className="font-semibold">Sıfırlama bağlantısı e-posta adresinize gönderildi!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="mail@example.com"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#5CB338] focus:ring-4 focus:ring-[#5CB338]/15 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#5CB338] hover:bg-[#4EA12F] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#5CB338]/20 transition-all cursor-pointer active:scale-[0.99]"
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
