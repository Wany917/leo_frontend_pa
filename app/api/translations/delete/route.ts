import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const translationsDir = path.join(process.cwd(), "locales");


export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  const file = path.join(translationsDir, `${locale.toLowerCase()}.json`);
  try {
    await fs.unlink(file);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
