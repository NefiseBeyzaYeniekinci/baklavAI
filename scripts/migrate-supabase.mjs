import pg from "pg";
const { Client } = pg;

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DIRECT_URL veya DATABASE_URL ortam değişkeni bulunamadı.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const ddl = `
CREATE TABLE IF NOT EXISTS dictionary_words (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT,
  author TEXT DEFAULT 'Topluluk',
  category TEXT DEFAULT 'kelime',
  upvotes INTEGER DEFAULT 1,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS word_votes (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL REFERENCES dictionary_words(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word_id, user_identifier)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
`;

const initialWords = [
  ["1", "Bahdeniz", "Maydanoz.", "Lahmacunun yanına taze bahdeniz koymamışlar, ele lahmacun mu olur!", "Mehmet Usta", 42, 1],
  ["2", "Süllüm", "Merdiven (özellikle ahşap seyyar merdiven).", "Dama çıkıcam da süllümü nereye koydunuz rafık?", "Antepli Ahmet", 38, 2],
  ["3", "Sahre", "Gaziantep usulü hafta sonu pikniği, mesire geleneği.", "Hava tam sahrelik böön, Dülükbaba'ya gidiyik mi?", "Zehra Bacı", 55, 0],
  ["4", "Sahan", "Bakır veya çelik yayvan yemek kabı.", "Küşlemeyi sıcak sahanda getirin ki yağı donmasın.", "Kadir Usta", 29, 1],
  ["5", "Hedik", "Haşlanmış aşurelik buğday.", "Çocuğun dişi çıktı, komşulara birer kase hedik dağıtın.", "Fatma Teyze", 31, 2],
  ["6", "Bıldır", "Geçen sene, bir önceki yıl.", "Bıldır Antep'e bu vakitler çok kar yağmıştı.", "Ali Yorum", 24, 0]
];

async function main() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    console.log("Creating tables...");
    await client.query(ddl);
    console.log("Tables created successfully.");

    const res = await client.query("SELECT COUNT(*) FROM dictionary_words");
    const count = parseInt(res.rows[0].count, 10);
    console.log(`Current dictionary_words count: ${count}`);

    if (count === 0) {
      console.log("Seeding initial authentic Antep words...");
      for (const w of initialWords) {
        await client.query(
          `INSERT INTO dictionary_words (id, word, meaning, example, author, upvotes, downvotes, category)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'kelime')
           ON CONFLICT (id) DO NOTHING`,
          w
        );
      }
      console.log("Seeding completed!");
    }

    await client.end();
    console.log("All done!");
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

main();
