import { NextRequest, NextResponse } from "next/server";
import { getDictionaryWords, addDictionaryWord, voteDictionaryWord } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const words = await getDictionaryWords();
    return NextResponse.json({ words });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { word, meaning, example, author, category } = await req.json();
    if (!word || !meaning) {
      return NextResponse.json({ error: "Kelime ve anlamı zorunludur." }, { status: 400 });
    }

    const created = await addDictionaryWord({ word, meaning, example, author, category });
    return NextResponse.json({ word: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { wordId, type, userIdentifier } = await req.json();
    if (!wordId || !type) {
      return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const identifier = userIdentifier || req.headers.get("x-forwarded-for") || "default_user";
    const result = await voteDictionaryWord({ wordId, userIdentifier: identifier, type });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
