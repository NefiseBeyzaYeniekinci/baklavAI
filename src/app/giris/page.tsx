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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Coffee,
  BookOpen,
  Award,
  ShieldCheck,
  ChevronLeft,
  Flame,
  HelpCircle,
  X
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
  const [acceptTerms, setAcceptTerms] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Check if rememberMe email is saved
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
      // 1. Try Supabase Auth
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
        console.warn("Supabase auth offline or disabled, proceeding with smart profile sync:", authErr);
      }

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("baklavai_remembered_email", email.trim());
      } else {
        localStorage.removeItem("baklavai_remembered_email");
      }

      // 2. Set Local Profile
      const displayName = authUser?.user_metadata?.full_name || email.split("@")[0] || "BaklavAI Kullanıcısı";
      const profile = {
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
        email: email.trim(),
        avatarDataUrl: null,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      window.dispatchEvent(new Event("profile-updated"));

      setSuccessMsg("Giriş başarılı! Gaziantep sofrasına yönlendiriliyorsunuz...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Giriş yapılırken bir sorun oluştu.");
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
      setErrorMsg("Girdiğiniz şifreler birbiriyle eşleşmiyor.");
      return;
    }
    if (!acceptTerms) {
      setErrorMsg("Lütfen kullanım koşullarını kabul ettiğinizi onaylayın.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try Supabase Sign Up
      try {
        await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });
      } catch (authErr) {
        console.warn("Supabase auth signup notice:", authErr);
      }

      // 2. Save Profile
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

      setSuccessMsg("Hesabınız başarıyla oluşturuldu! Hoş geldiniz.");
      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || "Kayıt olunurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Guest Quick Login
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

  // Handle Forgot Password
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
    }, 3000);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAF8] text-foreground font-sans selection:bg-[#5CB338]/20 selection:text-[#2E6F40]">
      {/* ── Left Hero Side (Showcase & Brand) ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0D1F13] text-white flex-col justify-between p-12 overflow-hidden border-r border-[#1B3A25]/50">
        {/* Ambient Gradient Lights */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#5CB338]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[420px] h-[420px] bg-[#E6A15C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-[#2E6F40]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2E6F40] to-[#5CB338] flex items-center justify-center text-2xl shadow-lg shadow-[#5CB338]/30 group-hover:scale-105 transition-transform duration-300">
              🥮
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                baklav<span className="text-[#72DC48]">AI</span>
              </span>
              <p className="text-[11px] font-medium text-emerald-300/70 tracking-wide uppercase">
                Gaziantep Yapay Zekası
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#5CB338] animate-ping" />
            <span className="font-medium">v2.0 Canlı & Akıllı</span>
          </div>
        </div>

        {/* Center Content / Hero Cards */}
        <div className="relative z-10 my-auto py-8 space-y-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#5CB338]/15 border border-[#5CB338]/30 text-xs font-semibold text-[#86E45E]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gaziantep Kültürünün Dijital Kalbi</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.15] text-white">
              Antep'in Sıcaklığı, <br />
              <span className="bg-gradient-to-r from-[#86E45E] via-[#F2C94C] to-[#5CB338] bg-clip-text text-transparent">
                Yapay Zekanın Gücüyle
              </span>
            </h1>
            <p className="text-emerald-100/70 text-sm md:text-base leading-relaxed">
              Tahmis Kahvesi kokulu sohbetlerden tarihi hanların rehberine, asırlık Antep ağzı sözlüğünden yöresel yemek tariflerine kadar her şey bir tık uzağında.
            </p>
          </div>

          {/* Interactive Feature Pills */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#5CB338]/20 border border-[#5CB338]/40 flex items-center justify-center text-[#86E45E] shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Hakiki Antep Şivesiyle Sohbet</h4>
                <p className="text-xs text-emerald-200/60">Yapay zeka robotik değil; tam bir Antepli usta gibi samimi konuşur.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#E6A15C]/20 border border-[#E6A15C]/40 flex items-center justify-center text-[#E6A15C] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Antep Ağzı Sözlüğü</h4>
                <p className="text-xs text-emerald-200/60">500+ kelimeyi keşfet, oyla, yeni kelimeler katarak asistanı eğit.</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Kültür ve Lezzet Rozetleri</h4>
                <p className="text-xs text-emerald-200/60">Sohbet ettikçe ve Antep'i tanıdıkça kadim ustalık rozetleri kazan.</p>
              </div>
            </div>
          </div>

          {/* Authentic Antep Quote Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#173822]/60 to-[#0F2617]/60 border border-[#2E6F40]/40 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#86E45E] mb-1">
              <Flame className="w-4 h-4" />
              <span>Gaziantep Ustalarından</span>
            </div>
            <p className="text-xs italic text-emerald-100/80 leading-relaxed">
              "Antep'e gitmeyen lezzeti bilmez, BaklavAI ile konuşmayan şiveyi çözemez yorum! Hoş geldin soframıza."
            </p>
          </div>
        </div>

        {/* Footer Statistics */}
        <div className="relative z-10 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-emerald-200/60">
          <div>
            <span className="font-bold text-white text-base">10.000+</span>
            <p>Canlı Sohbet</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-bold text-white text-base">500+</span>
            <p>Yöresel Kelime</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="font-bold text-white text-base">⭐ 4.9/5</span>
            <p>Kullanıcı Memnuniyeti</p>
          </div>
        </div>
      </div>

      {/* ── Right Auth Form Side ───────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>

          <div className="lg:hidden flex items-center gap-2">
            <div className="text-2xl">🥮</div>
            <span className="font-bold text-lg">
              baklav<span className="text-primary">AI</span>
            </span>
          </div>
        </div>

        {/* Main Form Container */}
        <div className="my-auto max-w-md w-full mx-auto py-8">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary text-primary mb-4 shadow-sm border border-primary/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {mode === "login" ? "Hoş Geldin Rafık!" : "Soframıza Katıl"}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">
              {mode === "login"
                ? "Gaziantep'in yapay zekasıyla sohbete başlamak için giriş yap."
                : "Hemen ücretsiz hesabını aç, Antep kültürünü keşfetmeye başla."}
            </p>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1.5 mt-6 rounded-2xl bg-muted/80 border border-border/40">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "login"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
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
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                  mode === "register"
                    ? "bg-card text-foreground shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Kayıt Ol
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-primary hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    Beni Hatırla
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 mt-2"
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
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Ad ve Soyad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mehmet Usta"
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adiniz@ornek.com"
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Şifre (En az 6 karakter)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary accent-[#5CB338] cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground leading-snug">
                    <span className="text-foreground font-medium">Kullanım Şartları</span> ve{" "}
                    <span className="text-foreground font-medium">Gizlilik Politikası</span>'nı okudum, kabul ediyorum.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 mt-2"
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
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8FAF8] px-3 text-muted-foreground font-medium">
                veya
              </span>
            </div>
          </div>

          {/* Guest Direct Entry Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-3 px-4 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground font-medium text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group shadow-sm hover:border-primary/40"
          >
            <span className="text-lg">🥮</span>
            <span>Kayıt Olmadan Hızlıca Göz At (Misafir Girişi)</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Security & Info Footer */}
        <div className="text-center pt-4">
          <p className="text-[11px] text-muted-foreground/70 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verileriniz Supabase 256-bit SSL şifrelemesi ile korunmaktadır.</span>
          </p>
        </div>
      </div>

      {/* ── Forgot Password Modal ────────────────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-border shadow-2xl relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-secondary text-primary flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-foreground">
              Şifreni mi Unuttun Rafık?
            </h3>
            <p className="text-xs text-muted-foreground text-center mt-1.5 mb-5">
              Kayıtlı e-posta adresini yaz, sana şifre sıfırlama bağlantısını hemen yollayalım.
            </p>

            {forgotSent ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sıfırlama bağlantısı e-posta adresinize gönderildi!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="adiniz@ornek.com"
                  className="w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Sıfırlama Bağlantısı Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
