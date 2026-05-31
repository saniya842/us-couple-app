import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const coupleId = req.nextUrl.searchParams.get("coupleId")
    if (!coupleId) return NextResponse.json({ messages: [] })

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("couple_id", coupleId)
      .order("created_at", { ascending: true })
      .limit(100)

    return NextResponse.json({ messages: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { error } = await supabase.from("messages").insert({
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