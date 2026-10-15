import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "baklavai.db");
const db = new DatabaseSync(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS dictionary_words (
    id TEXT PRIMARY KEY,
    word TEXT NOT NULL,
    meaning TEXT NOT NULL,
    example TEXT,
    author TEXT DEFAULT 'Topluluk',
    category TEXT DEFAULT 'kelime',
    upvotes INTEGER DEFAULT 1,
    downvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS word_votes (
    id TEXT PRIMARY KEY,
    word_id TEXT NOT NULL,
    user_identifier TEXT NOT NULL,
    type TEXT NOT NULL, -- 'up' | 'down'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word_id, user_identifier)
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    reaction TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed initial authentic Antep words if empty
const countRow = db.prepare("SELECT COUNT(*) as count FROM dictionary_words").get() as { count: number };
if (countRow.count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO dictionary_words (id, word, meaning, example, author, upvotes, downvotes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const initialWords = [
    ["1", "Bahdeniz", "Maydanoz.", "Lahmacunun yanına taze bahdeniz koymamışlar, ele lahmacun mu olur!", "Mehmet Usta", 42, 1],
    ["2", "Süllüm", "Merdiven (özellikle ahşap seyyar merdiven).", "Dama çıkıcam da süllümü nereye koydunuz rafık?", "Antepli Ahmet", 38, 2],
    ["3", "Sahre", "Gaziantep usulü hafta sonu pikniği, mesire geleneği.", "Hava tam sahrelik böön, Dülükbaba'ya gidiyik mi?", "Zehra Bacı", 55, 0],
    ["4", "Sahan", "Bakır veya çelik yayvan yemek kabı.", "Küşlemeyi sıcak sahanda getirin ki yağı donmasın.", "Kadir Usta", 29, 1],
    ["5", "Hedik", "Haşlanmış aşurelik buğday.", "Çocuğun dişi çıktı, komşulara birer kase hedik dağıtın.", "Fatma Teyze", 31, 2],
    ["6", "Bıldır", "Geçen sene, bir önceki yıl.", "Bıldır Antep'e bu vakitler çok kar yağmıştı.", "Ali Yorum", 24, 0]
  ];

  for (const w of initialWords) {
    insertStmt.run(...w);
  }
}

try {
  db.exec(`ALTER TABLE dictionary_words ADD COLUMN category TEXT DEFAULT 'kelime'`);
} catch {}

export { db };

// Dictionary Helpers
export function getDictionaryWords() {
  return db.prepare("SELECT * FROM dictionary_words ORDER BY created_at DESC").all();
}

export function getApprovedWords() {
  return db.prepare(`
    SELECT word, meaning 
    FROM dictionary_words
  `).all() as { word: string; meaning: string }[];
}

export function addDictionaryWord({ word, meaning, example, author, category }: { word: string; meaning: string; example?: string; author?: string; category?: string }) {
  const id = Date.now().toString();
  const cat = category || "kelime";
  db.prepare(`
    INSERT INTO dictionary_words (id, word, meaning, example, author, category, upvotes, downvotes)
    VALUES (?, ?, ?, ?, ?, ?, 1, 0)
  `).run(id, word, meaning, example || null, author || "Siz (Kullanıcı)", cat);
  return { id, word, meaning, example, author: author || "Siz (Kullanıcı)", category: cat, upvotes: 1, downvotes: 0 };
}

export function voteDictionaryWord({ wordId, userIdentifier, type }: { wordId: string; userIdentifier: string; type: "up" | "down" }) {
  const existingVote = db.prepare("SELECT type FROM word_votes WHERE word_id = ? AND user_identifier = ?").get(wordId, userIdentifier) as { type: string } | undefined;

  if (existingVote) {
    if (existingVote.type === type) {
      // Undo vote
      db.prepare("DELETE FROM word_votes WHERE word_id = ? AND user_identifier = ?").run(wordId, userIdentifier);
      const col = type === "up" ? "upvotes" : "downvotes";
      db.prepare(`UPDATE dictionary_words SET ${col} = MAX(0, ${col} - 1) WHERE id = ?`).run(wordId);
      return { success: true, action: "removed" };
    } else {
      // Change vote
      db.prepare("UPDATE word_votes SET type = ? WHERE word_id = ? AND user_identifier = ?").run(type, wordId, userIdentifier);
      if (type === "up") {
        db.prepare("UPDATE dictionary_words SET upvotes = upvotes + 1, downvotes = MAX(0, downvotes - 1) WHERE id = ?").run(wordId);
      } else {
        db.prepare("UPDATE dictionary_words SET downvotes = downvotes + 1, upvotes = MAX(0, upvotes - 1) WHERE id = ?").run(wordId);
      }
      return { success: true, action: "changed", newType: type };
    }
  } else {
    // New vote
    const voteId = Date.now().toString() + Math.random().toString().slice(2, 6);
    db.prepare("INSERT INTO word_votes (id, word_id, user_identifier, type) VALUES (?, ?, ?, ?)").run(voteId, wordId, userIdentifier, type);
    const col = type === "up" ? "upvotes" : "downvotes";
    db.prepare(`UPDATE dictionary_words SET ${col} = ${col} + 1 WHERE id = ?`).run(wordId);
    return { success: true, action: "added", newType: type };
  }
}
