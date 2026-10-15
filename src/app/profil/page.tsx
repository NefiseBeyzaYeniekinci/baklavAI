"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Camera,
  User,
  Lock,
  Save,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  ShieldAlert,
} from "lucide-react"
import { supabase } from "@/lib/db"

/* ─── Types ─────────────────────────────────────────────── */
type Profile = {
  name: string
  email: string
  avatarDataUrl: string | null
}

const DEFAULT_PROFILE: Profile = {
  name: "BaklavAI Kullanıcısı",
  email: "kullanici@ornek.com",
  avatarDataUrl: null,
}

const STORAGE_KEY = "baklavai_profile"

/* ─── Page ───────────────────────────────────────────────── */
export default function ProfilPage() {
  /* profile state */
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  /* password state */
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  /* ui state */
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState("")
  const [saving, setSaving] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  /* load from localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const parsed: Profile = stored ? JSON.parse(stored) : DEFAULT_PROFILE
      setName(parsed.name)
      setEmail(parsed.email)
      setAvatarPreview(parsed.avatarDataUrl)
    } catch {
      setName(DEFAULT_PROFILE.name)
      setEmail(DEFAULT_PROFILE.email)
    }
  }, [])

  const toast = useCallback((msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg)
      setSuccessMsg("")
      setTimeout(() => setErrorMsg(""), 4000)
    } else {
      setSuccessMsg(msg)
      setErrorMsg("")
      setTimeout(() => setSuccessMsg(""), 4000)
    }
  }, [])

  /* ── Avatar ── */
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast("Dosya boyutu 3 MB'ı geçemez.", true)
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  /* ── Save Profile ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast("İsim boş bırakılamaz.", true); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const updated: Profile = { name: name.trim(), email: email.trim(), avatarDataUrl: avatarPreview }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSaving(false)
    toast("Profil bilgileriniz güncellendi! ✅")
  }

  /* ── Update Password ── */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) { toast("Mevcut şifrenizi girin.", true); return }
    if (newPassword.length < 6) { toast("Yeni şifre en az 6 karakter olmalı.", true); return }
    if (newPassword !== confirmPassword) { toast("Şifreler eşleşmiyor.", true); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setSaving(false)
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    toast("Şifreniz güncellendi! 🔒")
  }

  /* ── Logout ── */
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem(STORAGE_KEY)
    window.location.href = "/giris"
  }

  /* ── Delete Account ── */
  const handleDeleteAccount = async () => {
    if (deleteInput !== "HESABIMI SİL") { toast("Onay metnini doğru yazın.", true); return }
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.clear()
    window.location.href = "/giris"
  }

  /* ── Password Strength ── */
  const pwStrength = Math.min(4, Math.floor(newPassword.length / 3))

  /* ─── UI ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F8FAF8] text-foreground">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/60 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all border border-border/50 hover:scale-105 active:scale-95"
            title="Sohbete dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl filter drop-shadow-xs group-hover:scale-105 transition-transform">🥮</span>
            <h1 className="font-bold text-xl tracking-tight text-foreground">
              Baklav<span className="text-primary font-extrabold">AI</span>
            </h1>
          </Link>
        </div>
        <span className="text-sm text-muted-foreground font-medium hidden sm:block">Profil Ayarları</span>
      </header>

      {/* Main */}
      <main className="max-w-[720px] mx-auto px-4 md:px-6 py-10 space-y-6">

        {/* Toast messages */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary border border-primary/30 text-primary text-sm font-semibold animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-in fade-in duration-300">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* ── CARD 1: Avatar + Basic Info ── */}
        <section className="bg-white border border-border/60 rounded-3xl p-6 md:p-8 shadow-[0_3px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Profil Bilgileri</h2>
              <p className="text-xs text-muted-foreground">İsim, e-posta ve profil resminizi düzenleyin</p>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Profil" referrerPolicy="no-referrer" crossOrigin="anonymous" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-muted-foreground/50" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer"
                title="Fotoğraf seç"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-primary hover:underline cursor-pointer text-left"
              >
                Fotoğraf Yükle
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors cursor-pointer text-left flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Fotoğrafı kaldır
                </button>
              )}
              <p className="text-[11px] text-muted-foreground/60">JPG, PNG · maks. 3 MB</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">Kullanıcı Adı *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Adınız"
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-[#F8FAF8] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">E-posta Adresi</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
                className="w-full px-4 py-3 rounded-2xl border border-border/80 bg-[#F8FAF8] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
            </button>
          </form>
        </section>

        {/* ── CARD 2: Password ── */}
        <section className="bg-white border border-border/60 rounded-3xl p-6 md:p-8 shadow-[0_3px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Şifre Güncelle</h2>
              <p className="text-xs text-muted-foreground">Güvenliğiniz için düzenli aralıklarla şifrenizi güncelleyin</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* Current password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">Mevcut Şifre</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut şifreniz"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-border/80 bg-[#F8FAF8] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">Yeni Şifre</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-border/80 bg-[#F8FAF8] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* strength bar */}
              {newPassword.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= pwStrength
                        ? pwStrength <= 1 ? "bg-red-400" : pwStrength <= 2 ? "bg-amber-400" : pwStrength <= 3 ? "bg-yellow-400" : "bg-primary"
                        : "bg-muted"
                    }`} />
                  ))}
                </div>
              )}
            </div>
            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground/80">Yeni Şifre (Tekrar)</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  className={`w-full px-4 py-3 pr-11 rounded-2xl border bg-[#F8FAF8] text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
                    confirmPassword && confirmPassword !== newPassword ? "border-red-300 focus:border-red-400" : "border-border/80 focus:border-primary"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-red-500 font-medium">Şifreler eşleşmiyor</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {saving ? "Güncelleniyor…" : "Şifreyi Güncelle"}
            </button>
          </form>
        </section>

        {/* ── CARD 3: Danger Zone ── */}
        <section className="bg-white border border-red-100 rounded-3xl p-6 md:p-8 shadow-[0_3px_16px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Tehlikeli Bölge</h2>
              <p className="text-xs text-muted-foreground">Bu işlemler geri alınamaz</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Logout */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20">
              <div>
                <p className="text-sm font-semibold text-foreground">Çıkış Yap</p>
                <p className="text-xs text-muted-foreground mt-0.5">Oturumunuzu kapatın</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border/70 bg-white hover:bg-muted/50 text-sm font-semibold text-foreground/80 hover:text-foreground transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-red-200 bg-red-50/40">
              <div>
                <p className="text-sm font-semibold text-red-700">Hesabı Sil</p>
                <p className="text-xs text-red-500/80 mt-0.5">Tüm verilerin kalıcı olarak silinir</p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Hesabı Sil
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Delete Confirm Overlay ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-red-200 shadow-2xl rounded-3xl max-w-md w-full p-7 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}
              className="absolute top-5 right-5 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">Hesabı Silmek İstediğinize Emin Misiniz?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Bu işlem geri alınamaz. Tüm sohbet geçmişiniz, sözlük katkılarınız ve profil bilgileriniz kalıcı olarak silinir.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground/80 block">
                Onaylamak için aşağıya <span className="text-red-600 font-extrabold">HESABIMI SİL</span> yazın
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                placeholder="HESABIMI SİL"
                className="w-full px-4 py-3 rounded-2xl border border-red-200 bg-red-50/40 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all"
              />
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "HESABIMI SİL"}
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Hesabımı Kalıcı Olarak Sil
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteInput("") }}
                className="w-full py-2.5 rounded-2xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
              >
                Vazgeç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

