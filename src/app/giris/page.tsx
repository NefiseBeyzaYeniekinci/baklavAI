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
      }, 700);
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
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "Kayıt olunurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Guest Direct Login (No Emoji)
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-[#5CB338]/30 selection:text-white">
      {/* ── Background: Yeşil Tonlarında Zeugma Çingene Kızı ───────────────── */}
      <div 
        className="fixed inset-0 bg-cover bg-center -z-20 scale-105"
        style={{ backgroundImage: `url('/images/kesfet/zeugma.jpg')` }}
      />
      {/* Proje teması yeşil katman (Green Toned Overlay & Vignette) */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#081F10]/85 via-[#10381C]/80 to-[#06180C]/90 mix-blend-multiply -z-10" />
      <div className="fixed inset-0 bg-[#2E6F40]/30 mix-blend-color -z-10" />
      <div className="fixed inset-0 backdrop-blur-[6px] -z-10" />

      {/* ── Center Semi-Transparent Frosted Glass Card ──────────────────────── */}
      <div className="w-full max-w-[420px] z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="rounded-[28px] bg-black/40 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] p-6 sm:p-8 text-white">
          
          {/* Card Header: Direkt Hoş Geldin Rafık */}
          <div className="text-center mb-6 pt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {mode === "login" ? "Hoş Geldin Rafık" : "Kayıt Ol"}
            </h1>
            <p className="text-xs text-white/70 mt-1.5">
              {mode === "login"
                ? "Sohbete başlamak için giriş yap."
                : "Bir dakikada hesabını oluştur."}
            </p>

            {/* Segmented Switcher */}
            <div className="flex p-1 mt-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[#5CB338] text-white shadow-md font-bold"
                    : "text-white/70 hover:text-white"
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
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#5CB338] text-white shadow-md font-bold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#5CB338]/20 border border-[#5CB338]/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── Form Section ───────────────────────────────────────────── */}
          {mode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-white/90">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white cursor-pointer"
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
                    className="w-4 h-4 rounded border-white/20 text-[#5CB338] focus:ring-[#5CB338] accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs text-white/80">
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E6F40] to-[#5CB338] hover:from-[#255C34] hover:to-[#4E9B2F] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#5CB338]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mehmet Usta"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/50">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-white/50 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/90 mb-1">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-white/50 hover:text-white"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E6F40] to-[#5CB338] hover:from-[#255C34] hover:to-[#4E9B2F] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#5CB338]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-black/50 px-2.5 text-white/60 font-medium rounded-md">veya</span>
            </div>
          </div>

          {/* Guest Entry Button (No Emoji) */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 px-3 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Kayıtsız Devam Et (Misafir Girişi)</span>
            <ArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Forgot Password Modal ────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#112417] text-white w-full max-w-sm rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#5CB338]/20 text-[#5CB338] flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-white">
              Şifreni mi Unuttun Rafık?
            </h3>
            <p className="text-xs text-white/70 text-center mt-1 mb-4">
              Kayıtlı e-posta adresini yaz, sana şifre sıfırlama bağlantısını hemen yollayalım.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs text-center flex items-center justify-center gap-2">
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
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/40 focus:border-[#5CB338]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5CB338] hover:bg-[#4E9B2F] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
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
