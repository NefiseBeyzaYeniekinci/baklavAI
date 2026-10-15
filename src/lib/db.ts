import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://yjomkmymroovauqhyqjb.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_dkBr62d_O_GPbKBpFnt6jw_dDBriega";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Dictionary Helpers
export async function getDictionaryWords() {
  const { data, error } = await supabase
    .from("dictionary_words")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching dictionary words:", error);
    return [];
  }
  return data || [];
}

export async function getApprovedWords(): Promise<{ word: string; meaning: string }[]> {
  const { data, error } = await supabase
    .from("dictionary_words")
    .select("word, meaning");

  if (error) {
    console.error("Error fetching approved words:", error);
    return [];
  }
  return (data as { word: string; meaning: string }[]) || [];
}

export async function addDictionaryWord({
  word,
  meaning,
  example,
  author,
  category,
}: {
  word: string;
  meaning: string;
  example?: string;
  author?: string;
  category?: string;
}) {
  const id = Date.now().toString();
  const cat = category || "kelime";
  const authorName = author || "Siz (Kullanıcı)";

  const newRow = {
    id,
    word,
    meaning,
    example: example || null,
    author: authorName,
    category: cat,
    upvotes: 1,
    downvotes: 0,
  };

  const { data, error } = await supabase
    .from("dictionary_words")
    .insert([newRow])
    .select()
    .single();

  if (error) {
    console.error("Error adding dictionary word:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function voteDictionaryWord({
  wordId,
  userIdentifier,
  type,
}: {
  wordId: string;
  userIdentifier: string;
  type: "up" | "down";
}) {
  // Check existing vote
  const { data: existingVote, error: checkError } = await supabase
    .from("word_votes")
    .select("*")
    .eq("word_id", wordId)
    .eq("user_identifier", userIdentifier)
    .maybeSingle();

  if (checkError) {
    console.error("Error checking vote:", checkError);
  }

  // Fetch current word counts
  const { data: wordData, error: wordError } = await supabase
    .from("dictionary_words")
    .select("upvotes, downvotes")
    .eq("id", wordId)
    .single();

  if (wordError || !wordData) {
    throw new Error("Kelime bulunamadı.");
  }

  let upvotes = wordData.upvotes ?? 0;
  let downvotes = wordData.downvotes ?? 0;

  if (existingVote) {
    if (existingVote.type === type) {
      // Undo vote
      await supabase
        .from("word_votes")
        .delete()
        .eq("id", existingVote.id);

      if (type === "up") {
        upvotes = Math.max(0, upvotes - 1);
      } else {
        downvotes = Math.max(0, downvotes - 1);
      }

      await supabase
        .from("dictionary_words")
        .update({ upvotes, downvotes })
        .eq("id", wordId);

      return { success: true, action: "removed", upvotes, downvotes };
    } else {
      // Change vote
      await supabase
        .from("word_votes")
        .update({ type })
        .eq("id", existingVote.id);

      if (type === "up") {
        upvotes += 1;
        downvotes = Math.max(0, downvotes - 1);
      } else {
        downvotes += 1;
        upvotes = Math.max(0, upvotes - 1);
      }

      await supabase
        .from("dictionary_words")
        .update({ upvotes, downvotes })
        .eq("id", wordId);

      return { success: true, action: "changed", newType: type, upvotes, downvotes };
    }
  } else {
    // New vote
    const voteId = Date.now().toString() + Math.random().toString().slice(2, 6);
    await supabase.from("word_votes").insert([
      {
        id: voteId,
        word_id: wordId,
        user_identifier: userIdentifier,
        type,
      },
    ]);

    if (type === "up") {
      upvotes += 1;
    } else {
      downvotes += 1;
    }

    await supabase
      .from("dictionary_words")
      .update({ upvotes, downvotes })
      .eq("id", wordId);

    return { success: true, action: "added", newType: type, upvotes, downvotes };
  }
}
