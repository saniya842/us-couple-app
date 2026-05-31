"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"

interface Couple {
  id: string
  couple_name: string
  anniversary_date: string
  user1_id: string
  user2_id: string
  invite_code: string
}

interface Mood {
  user_id: string
  mood: string
  note: string
}

export default function Dashboard() {
  const { user } = useUser()
  const router = useRouter()
  const [couple, setCouple] = useState<Couple | null>(null)
  const [myMood, setMyMood] = useState("")
  const [partnerMood, setPartnerMood] = useState<Mood | null>(null)
  const [streak, setStreak] = useState(0)
  const [daysTogther, setDaysTogether] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    // Get couple
    const { data: coupleData } = await supabase
      .from("couples")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (!coupleData) {
      router.push("/onboarding")
      return
    }

    setCouple(coupleData)

    // Calculate days together
    if (coupleData.anniversary_date) {
      const start = new Date(coupleData.anniversary_date)
      const today = new Date()
      const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      setDaysTogether(days)
    }

    // Get today's moods
    const today = new Date().toISOString().split("T")[0]
    const { data: moodsData } = await supabase
      .from("moods")
      .select("*")
      .eq("couple_id", coupleData.id)
      .eq("date", today)

    if (moodsData) {
      const mine = moodsData.find((m) => m.user_id === user.id)
      const partner = moodsData.find((m) => m.user_id !== user.id)
      if (mine) setMyMood(mine.mood)
      if (partner) setPartnerMood(partner)
    }

    // Get streak
    const { data: streakData } = await supabase
      .from("streaks")
      .select("*")
      .eq("couple_id", coupleData.id)
      .eq("user_id", user.id)
      .single()

    if (streakData) setStreak(streakData.current_streak)

    // Update streak checkin
    await supabase.from("streaks").upsert({
      couple_id: coupleData.id,
      user_id: user.id,
      last_checkin: today,
      current_streak: streakData ? streakData.current_streak + 1 : 1,
    })

    setLoading(false)
  }

  const saveMood = async (mood: string) => {
    if (!user || !couple) return
    setMyMood(mood)
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("moods").upsert({
      couple_id: couple.id,
      user_id: user.id,
      mood,
      date: today,
    })
  }

  const moods = ["😊", "🥰", "😴", "😤", "😢", "🤩", "😌", "🥺"]

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-rose-400 text-xl animate-pulse">Loading your space... 💕</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-rose-600">
            {couple?.couple_name || "Our Space"} 💑
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {user?.firstName}!
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Days Together */}
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-rose-500">{daysTogther}</div>
            <div className="text-gray-400 text-sm mt-1">Days Together 💕</div>
          </div>

          {/* Streak */}
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-orange-400">{streak} 🔥</div>
            <div className="text-gray-400 text-sm mt-1">Day Streak</div>
          </div>
        </div>

        {/* Mood Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">
            How are you feeling today? 🌈
          </h2>
          <div className="flex gap-2 flex-wrap">
            {moods.map((mood) => (
              <button
                key={mood}
                onClick={() => saveMood(mood)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  myMood === mood
                    ? "bg-rose-100 scale-110 shadow-sm"
                    : "hover:bg-gray-50"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          {partnerMood && (
            <p className="text-sm text-gray-400 mt-3">
              Your partner is feeling {partnerMood.mood} today
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { emoji: "📖", title: "Journal", desc: "Shared memories", href: "/journal" },
            { emoji: "💘", title: "Quiz", desc: "Compatibility", href: "/quiz" },
            { emoji: "🌙", title: "Date Night", desc: "Plan together", href: "/dates" },
            { emoji: "🎯", title: "Milestones", desc: "Track journey", href: "/milestones" },
            { emoji: "💬", title: "Private Chat", desc: "Just you two", href: "/chat" },
            { emoji: "💌", title: "Love Notes", desc: "Surprise notes", href: "/notes" },
          ].map((feature) => (
            <Link href={feature.href} key={feature.title}>
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="text-3xl mb-2">{feature.emoji}</div>
                <div className="font-semibold text-gray-700">{feature.title}</div>
                <div className="text-gray-400 text-xs">{feature.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Invite Code */}
        {couple?.user2_id === null && (
          <div className="bg-rose-50 border border-dashed border-rose-200 rounded-2xl p-4 mt-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Partner not connected yet!</p>
            <p className="text-rose-500 font-bold tracking-widest text-xl">
              {couple.invite_code}
            </p>
            <p className="text-gray-400 text-xs mt-1">Share this code with your partner</p>
          </div>
        )}

      </div>
    </main>
  )
}