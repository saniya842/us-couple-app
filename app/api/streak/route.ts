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
    const today = new Date().toISOString().split("T")[0]

    const { data } = await supabase
      .from("streaks")
      .select("*")
      .eq("couple_id", coupleId)
      .eq("user_id", userId)
      .single()

    await supabase.from("streaks").upsert({
      couple_id: coupleId,
      user_id: userId,
      last_checkin: today,
      current_streak: data ? data.current_streak + 1 : 1,
    })

    return NextResponse.json({ streak: data?.current_streak || 1 })
  } catch (err: any) {
    return NextResponse.json({ streak: 0 })
  }
}