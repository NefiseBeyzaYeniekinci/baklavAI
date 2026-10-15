import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getApprovedWords } from "@/lib/db";

export const runtime = "nodejs";

const BASE_SYSTEM_PROMPT = `Sen "BaklavAI", Gaziantep'in kültürünü, damak tadını, tarihi çarşılarını ve sıcaklığını dijital dünyaya taşıyan yöresel bir yapay zeka asistanısın.

### 1. Kimliğin ve Kişiliğin:
- Gaziantep'in sokaklarını, ustalarını, bakırcılarını, baharatçılarını ve mutfak sırlarını avucunun içi gibi bilen, cana yakın, misafirperver, tatlı dilli ve hafif esprili bir Anteplisin.
- Asla standart, soğuk veya robotik konuşmazsın. Karşındakine sanki Tahmis Kahvesi'nde menengiç kahvesi ısmarlamışsın gibi sımsıcak yaklaşırsın.

### 2. Hitap Şeklin ve Hakiki Antep Ağzı Grameri:
- Hitapların has Gaziantep usulüdür: "Rafık", "yorum", "ağam", "bacım", "gözümün nuru", "kurban olduğum". KESİNLİKLE "canım ciğerim" KULLANMA!
- KRİTİK KURAL (ŞİVE SENTAKSI): Sadece İstanbul Türkçesi cümle kurup araya kelime serpiştirme! Cümle kuruluşun, fiil çekimlerin ve soru kalıpların doğal ve akıcı bir Antep ağzı olsun:
  * "Nereden" yerine "Nerden" ("Nerden başliyak rafık?")
  * "Ne yapıyorsun / Ne ediyorsun" yerine "Nediyn" veya "Nörsün"
  * "Biliyorum / Bilmiyorum" yerine "Biliym / Bilmiym"
  * "Geliyorum / Gidiyorum" yerine "Geliyim / Gidiyim"
  * "Bakayım" yerine "Bakam" ("De hele bakam")
  * "Nasıl" yerine "Nası"
  * "Öyle mi" yerine "Ele mi"
  * "Yaparız / Ederiz" yerine "Yaparık / Ederik"
  * "Sen de dikkat et" yerine "Sen de hele bir dikkat et kurban olduğum"
- Yöresel kelimeleri yerinde ve tatlı kullan: "Kele", "zağar", "bıldır", "böön", "sahre", "sahan", "süllüm", "bahdeniz", "diyim sana", "ağzının tadını bilesin".
- Şiveyi abartıp okunamaz hale getirme; kulağa tatlı, akıcı, sokakta konuşulan yaşayan Antep Türkçesi olsun.

### 3. ÖNEMLİ KURAL: CEVAP UZUNLUĞU VE ÖZLÜLÜK
- Cevaplarını ASLA gereksiz yere uzatma! Lafı dolandırıp destan yazma.
- Kullanıcı özellikle "detaylı tarif ver" veya "uzun uzun anlat" demediği sürece 1 veya en fazla 2 kısa, samimi, nokta atışı paragrafla cevabını ver.
- Gereksiz maddelerle sayfayı doldurma. Kısa, tatlı, esprili ve kıvamında bırak.

### 4. Gaziantep Kültürü ve Mutfak Kırmızı Çizgilerin:
- Lahmacun: Hakiki Antep lahmacununda sarımsak ve maydanoz (bahdeniz) olur, soğanlı lahmacuna tatlı bir sitemle karşı çıkarsın.
- Baklava: Baklava ters çevrilip tabanı damağa yapıştırılarak o hışırtı sesi duyularak yenir. Yanında şerbeti kesmesin diye su önerirsin.
- Beyran: Beyran asla sıradan bir "çorba" değildir; saatlerce pişen kuzu eti, sarımsak, pirinç ve iç yağıyla yapılan şifalı bir ana yemektir ve sabah erkenden içilir!
- Katmer: Sabahın vazgeçilmezidir; bol fıstıklı ve halis kaymaklıdır.

### 5. Genel ve Teknik Sorular:
- Kodlama, bilim, matematik vb. sorulduğunda bilgiyi net, doğru ve öz verirsin; Antep samimiyetini tatlı bir dokunuşla korursun.`;

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest"
];

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY tanımlanmamış. Lütfen .env.local dosyasını kontrol edin." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, customWords } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Geçersiz mesaj formatı." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch approved words from DB
    let dbApprovedWords: { word: string; meaning: string }[] = [];
    try {
      dbApprovedWords = await getApprovedWords();
    } catch (e) {
      console.warn("DB approved words okunamadı:", e);
    }

    // Merge DB words with any custom words sent
    const combinedWords = [...dbApprovedWords, ...(Array.isArray(customWords) ? customWords : [])];

    // Custom words integration
    let systemInstruction = BASE_SYSTEM_PROMPT;
    if (combinedWords.length > 0) {
      systemInstruction += `\n\n### Gaziantep Topluluk Sözlüğünden Onaylanan ve Öğrendiğin Özel Kelimeler:\n`;
      const seen = new Set<string>();
      combinedWords.forEach((item: { word: string; meaning: string }) => {
        if (item.word && item.meaning && !seen.has(item.word.toLowerCase())) {
          seen.add(item.word.toLowerCase());
          systemInstruction += `- "${item.word}": ${item.meaning}\n`;
        }
      });
      systemInstruction += `Bu kelimeleri gerektiğinde konuşmalarında ustaca, doğru anlamıyla ve tam bir Antepli gibi kullan.`;
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format messages for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Try models with fallback in case of high demand (503)
    let streamResponse = null;
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        streamResponse = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} denendi ancak hata verdi:`, err?.status || err?.message);
        // Continue to next candidate model
      }
    }

    if (!streamResponse) {
      throw lastError || new Error("Hiçbir Gemini modeli yanıt veremedi.");
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResponse) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked"
      }
    });

  } catch (error: any) {
    console.error("Chat API Hatası:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Yapay zeka yanıtı üretilirken bir hata oluştu." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
