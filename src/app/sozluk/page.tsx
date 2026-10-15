"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy, 
  MessageCircle, 
  CheckCircle2,
  X,
  Quote,
  MessageSquareQuote,
  ScrollText,
  Bookmark
} from "lucide-react"

type EntryCategory = "kelime" | "deyim" | "atasozu"

type DictionaryEntry = {
  id: string
  word: string
  meaning: string
  example?: string
  author: string
  date: string
  category: EntryCategory
  upvotes: number
  downvotes: number
}

const INITIAL_ENTRIES: DictionaryEntry[] = [
  // 1. YÖRESEL KELİMELER
  {
    id: "1",
    word: "Acer",
    meaning: "Yeni, hiç kullanılmamış, gıcır gıcır.",
    example: "Acer araba aldım ağam, baklava yediricim size.",
    author: "Kadir Usta",
    date: "10 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "2",
    word: "Bahdeniz",
    meaning: "Maydanoz.",
    example: "Lahmacunun yanına taze bahdeniz koymamışlar, ele lahmacun mu olur!",
    author: "Mehmet Usta",
    date: "12 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "3",
    word: "Süllüm",
    meaning: "Merdiven (özellikle ahşap seyyar basamaklı merdiven).",
    example: "Dama çıkıcam da süllümü nereye koydunuz rafık?",
    author: "Antepli Ahmet",
    date: "13 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "4",
    word: "Sahre",
    meaning: "Gaziantep usulü hafta sonu mesiresi, ailecek yapılan mangallı kır pikniği geleneği.",
    example: "Hava tam sahrelik böön, Dülükbaba'ya gidiyik mi?",
    author: "Zehra Bacı",
    date: "14 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "5",
    word: "Rafık",
    meaning: "Arkadaş, dost, yoldaş, canciğer ahbap.",
    example: "Nasılsın rafık, ne var ne yok Antep'te?",
    author: "Barış Usta",
    date: "14 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "6",
    word: "Zağar",
    meaning: "Zahir, herhalde, galiba, besbelli.",
    example: "Dükkanı erken kapatmış zağar, yarın sabah uğrarız.",
    author: "Mustafa Çavuş",
    date: "14 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "7",
    word: "Sahan",
    meaning: "Bakır veya çelikten yapılmış yayvan yemek kabı, tabak.",
    example: "Küşlemeyi sıcak sahanda getirin ki yağı donmasın.",
    author: "Kadir Usta",
    date: "14 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "8",
    word: "Hedik",
    meaning: "Haşlanmış aşurelik buğday veya nohut karışımı.",
    example: "Çocuğun dişi çıktı, komşulara birer kase hedik dağıtın.",
    author: "Fatma Teyze",
    date: "15 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "9",
    word: "Bıldır",
    meaning: "Geçen sene, bir önceki yıl.",
    example: "Bıldır Antep'e bu vakitler çok kar yağmıştı.",
    author: "Ali Yorum",
    date: "15 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "10",
    word: "Hayat",
    meaning: "Geleneksel taş Antep evlerinin geniş iç avlusu.",
    example: "Yaz akşamları serin serin hayatta oturup mırra içerik.",
    author: "Gülseren Hanım",
    date: "15 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "11",
    word: "Cıncık",
    meaning: "Cam veya porselen kırığı, küçük parça.",
    example: "Ayağını yere basma rafık, bardağın cıncığı batmasın!",
    author: "Cahit Usta",
    date: "15 Ekim 2026",
    category: "kelime",
    upvotes: 1,
    downvotes: 0
  },

  // 2. ANTEP DEYİMLERİ
  {
    id: "12",
    word: "Ağzı sahre yeri gibi olmak",
    meaning: "Çok neşeli, tatlı dilli konuşup etrafındakileri güldürmek, sohbeti şenlendirmek.",
    example: "Ahmet ağamın gene ağzı sahre yeri gibi, milleti kırıp geçiriyor.",
    author: "İbrahim Usta",
    date: "15 Ekim 2026",
    category: "deyim",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "13",
    word: "Hıssst sesi gelmek",
    meaning: "Antep baklavasının çıtırlığını, tazeliğini ve tül inceliğindeki yufkalarının kalitesini ifade eden meşhur söz.",
    example: "Baklavayı ters çevirip ısırdın mı damağından 'hıssst' sesi gelecek!",
    author: "Güllü Usta",
    date: "15 Ekim 2026",
    category: "deyim",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "14",
    word: "Gözü çökelek kesmek",
    meaning: "Beklenmedik bir durum veya korku karşısında şaşkınlıktan donakalmak, nutku tutulmak.",
    example: "Hesabı görünce rafığın gözü çökelek kesti zağar.",
    author: "Ali Kemiksiz",
    date: "15 Ekim 2026",
    category: "deyim",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "15",
    word: "Aklı sahrede kalmak",
    meaning: "Aklı işte veya derste değil, dışarıda, piknikte ve eğlencede olmak; dikkati dağılmak.",
    example: "Ders dinlemiyor ki, aklı sahrede kalmış böön.",
    author: "Muallim Bey",
    date: "15 Ekim 2026",
    category: "deyim",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "16",
    word: "Karnı bakır sahan dövmek",
    meaning: "Açlıktan karnı guruldamak, çok fazla acıkmak.",
    example: "Çabuk bir nohut dürümü sar usta, karnımız bakır sahan dövüyor.",
    author: "Dürümcü Cahit",
    date: "15 Ekim 2026",
    category: "deyim",
    upvotes: 1,
    downvotes: 0
  },

  // 3. ANTEP ATASÖZLERİ
  {
    id: "17",
    word: "Aşı pişen avradın yüzü güler, ocağı tüten evin dumanı tüter",
    meaning: "Evinde yemeği ve bereketi olan ailenin huzuru, neşesi yerinde olur.",
    example: "Akşama tencerede yuvalama kaynayınca ev şenlendi.",
    author: "Zehra Bacı",
    date: "15 Ekim 2026",
    category: "atasozu",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "18",
    word: "Fıstığın kabuğu çatlamazsa içi bilinmez",
    meaning: "Bir insanın gerçek karakteri ve olgunluğu zor zamanlarda sınanmadan veya konuşmadan anlaşılmaz.",
    example: "Hemen hüküm verme, fıstığın kabuğu çatlamazsa içi bilinmez.",
    author: "Kadir Usta",
    date: "15 Ekim 2026",
    category: "atasozu",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "19",
    word: "Erken kalkan beyran içer, geç kalkan soğuk su",
    meaning: "İşine erkenden koyulan insan rızkını ve en tazesini alır; tembellik edip geç kalkan ise fırsatları kaçırır.",
    example: "Sabah saat beşte kalktık da sıcak beyranı yakaladık.",
    author: "Metanet Çırağı",
    date: "15 Ekim 2026",
    category: "atasozu",
    upvotes: 1,
    downvotes: 0
  },
  {
    id: "20",
    word: "Misafir kısmetiyle gelir, küşlemeyle ağırlanır",
    meaning: "Gaziantep misafirperverliğinin zenginliğini ve ikram geleneğinin kıymetini anlatan ata sözü.",
    example: "Yatılı misafir geldi mi soframızda küşleme eksik olmaz.",
    author: "Antepli Ahmet",
    date: "15 Ekim 2026",
    category: "atasozu",
    upvotes: 1,
    downvotes: 0
  }
]

type FilterTab = "all" | "kelime" | "deyim" | "atasozu"

export default function SozlukPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<FilterTab>("all")
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  
  // New entry form state
  const [newTitle, setNewTitle] = useState("")
  const [newMeaning, setNewMeaning] = useState("")
  const [newExample, setNewExample] = useState("")
  const [newCategory, setNewCategory] = useState<EntryCategory>("kelime")
  const [showAddForm, setShowAddForm] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Load entries from backend API with fallback
  useEffect(() => {
    fetch("/api/dictionary")
      .then(res => res.json())
      .then(data => {
        if (data.words && Array.isArray(data.words) && data.words.length > 0) {
          const mapped: DictionaryEntry[] = data.words.map((w: any) => ({
            id: String(w.id),
            word: w.word,
            meaning: w.meaning,
            example: w.example || undefined,
            author: w.author || "Topluluk",
            date: w.created_at ? new Date(w.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "Bugün",
            category: (w.category as EntryCategory) || "kelime",
            upvotes: 1,
            downvotes: 0
          }));

          // INITIAL_ENTRIES always wins for preset data (correct categories).
          // Only add DB entries whose words are NOT in INITIAL_ENTRIES (user-added).
          const initialWords = new Set(INITIAL_ENTRIES.map(e => e.word.toLowerCase()));
          const userAddedFromDB = mapped.filter(m => !initialWords.has(m.word.toLowerCase()));
          const combined = [...INITIAL_ENTRIES, ...userAddedFromDB];
          setEntries(combined);
        } else {
          setEntries(INITIAL_ENTRIES);
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem("baklavai_community_dictionary");
          setEntries(stored ? JSON.parse(stored) : INITIAL_ENTRIES);
        } catch {
          setEntries(INITIAL_ENTRIES);
        }
      });
  }, []);

  // Handle adding new entry
  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMeaning.trim()) return;

    const titleText = newTitle.trim();
    const meaningText = newMeaning.trim();
    const exampleText = newExample.trim();

    const now = new Date();
    const dateString = now.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

    const localItem: DictionaryEntry = {
      id: Date.now().toString(),
      word: titleText,
      meaning: meaningText,
      example: exampleText || undefined,
      author: "Siz (Kullanıcı)",
      date: dateString,
      category: newCategory,
      upvotes: 1,
      downvotes: 0
    };

    setEntries(prev => [localItem, ...prev]);
    setNewTitle("");
    setNewMeaning("");
    setNewExample("");
    setNewCategory("kelime");
    setShowAddForm(false);
    
    const catLabel = newCategory === "kelime" ? "kelime" : newCategory === "deyim" ? "deyim" : "atasözü";
    setSuccessMsg(`"${titleText}" (${catLabel}) sözlüğe eklendi ve BaklavAI hafızasına kaydedildi!`);
    setTimeout(() => setSuccessMsg(""), 4000);

    // Persist to backend DB
    try {
      const res = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: titleText,
          meaning: meaningText,
          example: exampleText || undefined,
          author: "Siz (Kullanıcı)",
          category: newCategory
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.word?.id) {
          setEntries(prev => prev.map(w => w.id === localItem.id ? { ...w, id: String(data.word.id) } : w));
        }
      }
    } catch (err) {
      console.error("Kayıt DB'ye eklenemedi:", err);
    }
  };

  // Copy handler
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Available initial letters for alphabetical filter bar
  const alphabetLetters = useMemo(() => {
    const letters = new Set<string>();
    entries.forEach(item => {
      const first = item.word.charAt(0).toUpperCase();
      if (first) letters.add(first);
    });
    return Array.from(letters).sort((a, b) => a.localeCompare(b, "tr"));
  }, [entries]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: entries.length,
      kelime: entries.filter(e => e.category === "kelime").length,
      deyim: entries.filter(e => e.category === "deyim").length,
      atasozu: entries.filter(e => e.category === "atasozu").length,
    }
  }, [entries]);

  // Filter and search
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Letter filter
      if (selectedLetter && item.word.charAt(0).toUpperCase() !== selectedLetter) {
        return false;
      }

      // Search match
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchTitle = item.word.toLowerCase().includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        const matchExample = item.example ? item.example.toLowerCase().includes(q) : false;
        const matchCategory = 
          (item.category === "kelime" && "kelime".includes(q)) ||
          (item.category === "deyim" && "deyim".includes(q)) ||
          (item.category === "atasozu" && "atasözü".includes(q));

        return matchTitle || matchMeaning || matchExample || matchCategory;
      }

      return true;
    });
  }, [entries, search, selectedCategory, selectedLetter]);

  // Badge helper
  const getCategoryBadge = (category: EntryCategory) => {
    switch (category) {
      case "deyim":
        return {
          label: "Antep Deyimi",
          icon: <MessageSquareQuote className="w-3 h-3" />,
          classes: "bg-amber-50 text-amber-700 border-amber-200/70"
        };
      case "atasozu":
        return {
          label: "Antep Atasözü",
          icon: <ScrollText className="w-3 h-3" />,
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200/70"
        };
      default:
        return {
          label: "Yöresel Kelime",
          icon: <Bookmark className="w-3 h-3" />,
          classes: "bg-blue-50 text-blue-700 border-blue-200/70"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-foreground flex flex-col selection:bg-primary/20">
      
      {/* 1. Modern Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border/60 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        
        {/* SOL: Geri Oku + Logomuz */}
        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="w-10 h-10 rounded-2xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all border border-border/50 hover:scale-105 active:scale-95 cursor-pointer"
            title="Sohbete dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="text-3xl filter drop-shadow-xs group-hover:scale-105 transition-transform">🥮</span>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight text-foreground">
                baklav<span className="text-primary font-extrabold">AI</span>
              </h1>
            </div>
          </Link>
        </div>

        {/* SAĞ: Yeni Ekle Butonu */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary hover:bg-primary/90 text-white text-xs md:text-sm font-semibold transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Kelime / Deyim Ekle</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {/* Modern Minimal Hero Section */}
        <div className="text-center max-w-[680px] mx-auto mb-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            Gaziantep Kültür <span className="text-primary">Sözlüğü</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-3 leading-relaxed">
            Antep&apos;in kadim şivesi, kuşaktan kuşağa aktarılan deyimleri ve atasözleri. Buradaki tüm kayıtları <strong>BaklavAI</strong> bilir ve sohbetlerinde yaşatır.
          </p>

          {/* Clean Modern Floating Search Pill */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kelime, deyim, atasözü veya anlam ara... (Örn: Bahdeniz, Sahre, Hıssst)"
              className="w-full pl-11 pr-4 py-3 rounded-full border border-border/80 bg-white text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-full bg-muted cursor-pointer"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-secondary border border-primary/30 text-primary text-sm font-semibold flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-primary" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 3. Modern Category Filter Tabs & Alphabet Bar */}
        <div className="space-y-4 mb-8">
          
          {/* Main Category Tabs: Tümü, Kelimeler, Deyimler, Atasözleri */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => { setSelectedCategory("all"); setSelectedLetter(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "all" && !selectedLetter
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tümü ({counts.all})</span>
              </button>

              <button
                onClick={() => { setSelectedCategory("kelime"); setSelectedLetter(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "kelime"
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Kelimeler ({counts.kelime})</span>
              </button>

              <button
                onClick={() => { setSelectedCategory("deyim"); setSelectedLetter(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "deyim"
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Deyimler ({counts.deyim})</span>
              </button>

              <button
                onClick={() => { setSelectedCategory("atasozu"); setSelectedLetter(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "atasozu"
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>Atasözleri ({counts.atasozu})</span>
              </button>
            </div>

            <span className="text-xs text-muted-foreground/80 font-medium">
              {filteredEntries.length} kayıt listeleniyor
            </span>
          </div>

          {/* Alphabet Quick Filter Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar pt-1">
            <button
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedLetter === null
                  ? "bg-secondary text-primary font-bold border border-primary/30"
                  : "bg-white/80 border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              Hepsi
            </button>
            {alphabetLetters.map(letter => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                className={`w-7 h-7 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                  selectedLetter === letter
                    ? "bg-primary text-white shadow-xs scale-110"
                    : "bg-white border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Entries Cards List */}
        <div className="space-y-5">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-3xl p-8 bg-white/60 max-w-md mx-auto">
              <span className="text-5xl block mb-3">🔍</span>
              <h3 className="text-lg font-bold text-foreground">Kayıt Bulunamadı</h3>
              <p className="text-sm text-muted-foreground mt-1">
                &quot;{search}&quot; aramanıza uygun bir kelime, deyim veya atasözü bulunamadı.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 transition-colors cursor-pointer"
              >
                + Bu Kaydı Siz Ekleyin
              </button>
            </div>
          ) : (
          filteredEntries.map((item) => {
              const categoryLabel = item.category === "deyim" ? "Antep Deyimi" : item.category === "atasozu" ? "Antep Atasözü" : "Yöresel Kelime";

              return (
                <div
                  key={item.id}
                  className="p-6 md:p-7 rounded-3xl bg-white border border-border/60 hover:border-primary/40 shadow-[0_3px_16px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col gap-4 group"
                >
                  {/* Card Header: Title */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 w-full">
                      <h3 className="text-2xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {item.word}
                      </h3>
                      
                      {/* Meaning */}
                      <p className="text-[15.5px] text-foreground/85 font-normal leading-relaxed pt-1">
                        {item.meaning}
                      </p>
                    </div>
                  </div>

                  {/* Example Sentence / Usage in Stylish Callout */}
                  {item.example && (
                    <div className="relative px-4 py-3 rounded-2xl bg-[#F0F7ED]/70 border border-primary/20 text-xs md:text-sm text-foreground/85 italic leading-relaxed flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-primary shrink-0 rotate-180 mt-0.5 opacity-70" />
                      <span>&quot;{item.example}&quot;</span>
                    </div>
                  )}

                  {/* Card Footer: Author Info & Interactive Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    <span className="text-muted-foreground/70">
                      Ekleyen: <strong className="font-semibold text-foreground/75">{item.author}</strong> • {item.date}
                    </span>

                    {/* Actions: Copy & Ask BaklavAI */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Copy word & meaning */}
                      <button
                        onClick={() => handleCopy(item.id, `${categoryLabel}: "${item.word}" - ${item.meaning}${item.example ? ` (Örnek: "${item.example}")` : ""}`)}
                        className="px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Panoya Kopyala"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[11px] text-primary font-semibold">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Kopyala</span>
                          </>
                        )}
                      </button>

                      {/* Ask BaklavAI Button */}
                      <Link
                        href={`/?q=${encodeURIComponent(`"${item.word}" ${categoryLabel.toLowerCase()} olarak Antep'te ne anlama gelir ve nerelerde kullanılır, bana Antep şivesiyle güzel bir örnek cümle kurar mısın rafık?`)}`}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all text-xs font-semibold shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Sohbette Kullan</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* 5. Modern Add Entry Modal Dialog (Kelime, Deyim veya Atasözü) */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-border/80 shadow-2xl rounded-3xl max-w-lg w-full p-6 md:p-8 animate-in zoom-in-95 duration-200 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowAddForm(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-primary text-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">Yeni Kayıt Ekle</h3>
                <p className="text-xs text-muted-foreground">Antep sözlüğüne kelime, deyim veya atasözü ekleyin.</p>
              </div>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-4">
              {/* Category Selector Tabs */}
              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1.5">
                  Kayıt Türü *
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-muted/60 rounded-2xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setNewCategory("kelime")}
                    className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCategory === "kelime"
                        ? "bg-white text-primary shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Kelime</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory("deyim")}
                    className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCategory === "deyim"
                        ? "bg-white text-amber-700 shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MessageSquareQuote className="w-3.5 h-3.5" />
                    <span>Deyim</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCategory("atasozu")}
                    className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      newCategory === "atasozu"
                        ? "bg-white text-emerald-700 shadow-xs font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ScrollText className="w-3.5 h-3.5" />
                    <span>Atasözü</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1.5">
                  {newCategory === "kelime" ? "Yöresel Kelime *" : newCategory === "deyim" ? "Antep Deyimi *" : "Antep Atasözü *"}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    newCategory === "kelime" 
                      ? "Örn: Süllüm, Acer, Sahre, Bahdeniz..." 
                      : newCategory === "deyim"
                      ? "Örn: Ağzı sahre yeri gibi olmak, Gözü çökelek kesmek..."
                      : "Örn: Erken kalkan beyran içer, geç kalkan soğuk su..."
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-[#F8FAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1.5">
                  Anlamı ve Açıklaması *
                </label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Kelimedeki veya deyimdeki asıl manayı girin..."
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-[#F8FAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground/80 block mb-1.5">
                  Örnek Cümle veya Kullanım (İsteğe bağlı)
                </label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Örn: Acer araba aldım ağam, baklava yediricim size..."
                  className="w-full px-4 py-3 rounded-2xl border border-border bg-[#F8FAF8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim() || !newMeaning.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Sözlüğe Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
