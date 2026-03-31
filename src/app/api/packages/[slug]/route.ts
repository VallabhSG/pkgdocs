import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("packages")
      .select("data")
      .eq("id", slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json((data as { data: unknown }).data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

  // Fallback: static JSON file
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "packages",
      `${slug}.json`
    );
    const raw = await readFile(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw), {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
