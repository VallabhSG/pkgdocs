import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { readdir, readFile } from "fs/promises";
import path from "path";
import type { Package } from "@/lib/types";

// Lightweight card shape — omits large graph/tasks/story blobs
function toCard(pkg: Package) {
  return {
    id: pkg.id,
    ecosystem: pkg.ecosystem,
    name: pkg.name,
    summary: pkg.summary,
    tags: pkg.tags,
    difficulty: pkg.difficulty,
    meta: {
      weekly_downloads: pkg.meta.weekly_downloads,
      version: pkg.meta.version,
    },
  };
}

async function fromStaticFiles() {
  const dir = path.join(process.cwd(), "public", "data", "packages");
  const files = await readdir(dir);
  const packages = await Promise.all(
    files
      .filter((f) => f.endsWith(".json"))
      .map(async (f) => {
        const raw = await readFile(path.join(dir, f), "utf-8");
        return JSON.parse(raw) as Package;
      })
  );
  return packages
    .sort((a, b) => b.meta.weekly_downloads - a.meta.weekly_downloads)
    .map(toCard);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? "";
  const tag = searchParams.get("tag") ?? "";

  if (isSupabaseConfigured() && supabase) {
    let query = supabase
      .from("packages")
      .select("id, ecosystem, name, summary, tags, difficulty, weekly_downloads, version")
      .order("weekly_downloads", { ascending: false });

    if (tag) {
      query = query.contains("tags", [tag]);
    }
    if (search) {
      // Postgres full-text search
      query = query.textSearch(
        "fts",
        search.split(" ").join(" & "),
        { config: "english", type: "websearch" }
      );
    }

    const { data, error } = await query.limit(100);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  }

  // Fallback: static JSON files
  const packages = await fromStaticFiles();
  return NextResponse.json(packages, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
