import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const coupleId = req.nextUrl.searchParams.get("coupleId")
    const userId = req.nextUrl.searchParams.get("userId")
    if (!coupleId || !userId) return NextResponse.json({ notes: [] })

    const { data } = await supabase
      .from("love_notes")
      .select("*")
      .eq("couple_id", coupleId)
      .neq("sender_id", userId)
      .order("created_at", { ascending: false })

    // Mark as read
    await supabase
      .from("love_notes")
      .update({ is_read: true })
      .eq("couple_id", coupleId)
      .neq("sender_id", userId)

    return NextResponse.json({ notes: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error } = await supabase.from("love_notes").insert({
      couple_id: body.couple_id,
      sender_id: body.sender_id,
      content: body.content,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}