import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const translationsDir = path.join(process.cwd(), "locales");

export async function POST(req: NextRequest) {
  const { locale, translations } = await req.json();
  const file = path.join(translationsDir, `${locale.toLowerCase()}.json`);
  try {
    await fs.writeFile(file, JSON.stringify(translations, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
