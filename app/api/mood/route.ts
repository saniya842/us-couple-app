import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const coupleId = req.nextUrl.searchParams.get("coupleId")
    const date = req.nextUrl.searchParams.get("date")
    if (!coupleId) return NextResponse.json({ moods: [] })

    const { data } = await supabase
      .from("moods")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("date", date)

    return NextResponse.json({ moods: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const today = new Date().toISOString().split("T")[0]

    await supabase.from("moods").upsert({
      couple_id: body.couple_id,
      user_id: body.user_id,
      mood: body.mood,
      note: body.note || "",
      date: today,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}