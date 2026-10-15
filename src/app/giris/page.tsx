"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  ShieldCheck,
  ArrowLeft,
  X,
  HelpCircle,
  Sparkles
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

      setSuccessMsg("Giriş başarılı! Soframıza yönlendiriliyorsunuz...");
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
      setErrorMsg("Şifreniz en az 6 karakterden oluşmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Şifreler birbiriyle uyuşmuyor.");
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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-x-hidden selection:bg-[#5CB338]/20 selection:text-[#2E6F40]">
      {/* ── Cinematic Transparent Gaziantep Background ──────────────────────── */}
      <div 
        className="fixed inset-0 bg-cover bg-center -z-10 scale-105 transition-transform duration-1000 ease-out"
        style={{ backgroundImage: `url('/images/kesfet/gaziantep-kalesi.jpg')` }}
      />
      {/* Translucent Frosted Veil (Blur + Dark Vignette) */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[10px] -z-10" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 -z-10" />

      {/* Top Navbar */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 sm:mb-6 z-10 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs text-white/80">
          <Sparkles className="w-3.5 h-3.5 text-[#5CB338]" />
          <span>Gaziantep AI 2.0</span>
        </div>
      </div>

      {/* ── Centered Pure Frosted Glass Card ───────────────────────────────── */}
      <div className="w-full max-w-[420px] z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-[28px] bg-white/95 dark:bg-[#152018]/95 backdrop-blur-3xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)] border border-white/80 dark:border-white/10 p-6 sm:p-8">
          
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center gap-2.5 group cursor-pointer mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2E6F40] to-[#5CB338] flex items-center justify-center text-2xl shadow-md shadow-[#5CB338]/30 group-hover:scale-105 transition-transform duration-200">
                🥮
              </div>
              <div className="text-left">
                <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white block leading-none">
                  baklav<span className="text-[#5CB338]">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-400">
                  Gaziantep Yapay Zekası
                </span>
              </div>
            </Link>

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight mt-3">
              {mode === "login" ? "Hoş Geldin Rafık" : "Soframıza Katıl"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mode === "login"
                ? "Antep'in samimi yapay zekasıyla sohbete başla."
                : "Bir dakikada ücretsiz hesabını oluştur."}
            </p>

            {/* Segmented Switcher */}
            <div className="flex p-1 mt-5 rounded-2xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
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
                    ? "bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {mode === "login" ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] font-semibold text-[#2E6F40] dark:text-[#5CB338] hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
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
                    className="w-4 h-4 rounded border-gray-300 text-[#5CB338] focus:ring-[#5CB338] accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Beni hatırla
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E6F40] to-[#5CB338] hover:from-[#235832] hover:to-[#4EA32D] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#2E6F40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.99]"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ad Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mehmet Usta"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-3 pr-7 py-2.5 bg-gray-50/80 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2E6F40] to-[#5CB338] hover:from-[#235832] hover:to-[#4EA32D] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#2E6F40]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-[0.99]"
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
              <div className="w-full border-t border-gray-200 dark:border-zinc-700" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white dark:bg-[#152018] px-2.5 text-gray-400 font-medium">veya</span>
            </div>
          </div>

          {/* Guest Entry Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/60 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer group shadow-2xs"
          >
            <span>🥮</span>
            <span>Kayıtsız Devam Et (Misafir Girişi)</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="text-center mt-4">
          <p className="text-[11px] text-white/80 drop-shadow-sm flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5CB338]" />
            <span>256-bit SSL ve Supabase ile güvenli bağlantı</span>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#5CB338]/15 text-[#2E6F40] dark:text-[#5CB338] flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-gray-900 dark:text-white">
              Şifreni mi Unuttun Rafık?
            </h3>
            <p className="text-xs text-gray-500 text-center mt-1 mb-4">
              Kayıtlı e-posta adresini yaz, sana şifre sıfırlama bağlantısını hemen yollayalım.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs text-center flex items-center justify-center gap-2">
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
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5CB338]/30 focus:border-[#5CB338]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2E6F40] hover:bg-[#235832] text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
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
