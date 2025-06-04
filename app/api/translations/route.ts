import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const localesDir = path.join(process.cwd(), "locales");

export async function GET(req: NextRequest) {
  try {
    const files = await fs.readdir(localesDir);
    const locales = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""));
    return NextResponse.json({ locales });
  } catch (err) {
    console.error("Error reading locales folder:", err);
    return NextResponse.json({ locales: [] }, { status: 500 });
  }
}
