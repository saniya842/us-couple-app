import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "No userId" }, { status: 400 })

    const { data } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .single()

    return NextResponse.json({ couple: data || null })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase config" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const body = await req.json()

    if (body.action === "create") {
      const { error } = await supabase.from("couples").insert({
        user1_id: body.user1_id,
        invite_code: body.invite_code,
        couple_name: body.couple_name,
        anniversary_date: body.anniversary_date,
      })

      if (error) {
        console.error("Supabase insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (body.action === "join") {
      const { data, error } = await supabase
        .from("couples")
        .select("*")
        .eq("invite_code", body.invite_code)
        .single()

      if (error || !data)
        return NextResponse.json({ error: "Invalid invite code!" }, { status: 400 })

      if (data.user2_id)
        return NextResponse.json({ error: "This couple is already full!" }, { status: 400 })

      const { error: updateError } = await supabase
        .from("couples")
        .update({ user2_id: body.user2_id })
        .eq("invite_code", body.invite_code)

      if (updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  } catch (err: any) {
    console.error("API error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
