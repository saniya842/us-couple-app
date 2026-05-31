import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const coupleId = req.nextUrl.searchParams.get("coupleId")
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("couple_id", coupleId)
    .order("created_at", { ascending: false })
  return NextResponse.json({ entries: data || [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { error } = await supabase.from("journal_entries").insert({
    couple_id: body.couple_id,
    author_id: body.author_id,
    title: body.title,
    content: body.content,
    mood: body.mood,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}