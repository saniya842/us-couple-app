"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [couple, setCouple] = useState<any>(null)
  const [myMood, setMyMood] = useState("")
  const [partnerMood, setPartnerMood] = useState("")
  const [streak, setStreak] = useState(0)
  const [daysTogether, setDaysTogether] = useState(0)
  const [loading, setLoading] = useState(true)
  const mountedRef = useRef(false)

  const moods = ["😊", "🥰", "😴", "😤", "😢", "🤩", "😌", "🥺"]

  const features = [
    { emoji: "📖", title: "Journal", desc: "Shared memories", href: "/journal" },
    { emoji: "💘", title: "Quiz", desc: "Compatibility", href: "/quiz" },
    { emoji: "🌙", title: "Date Night", desc: "Plan together", href: "/dates" },
    { emoji: "🎯", title: "Milestones", desc: "Track journey", href: "/milestones" },
    { emoji: "💬", title: "Private Chat", desc: "Just you two", href: "/chat" },
    { emoji: "💌", title: "Love Notes", desc: "Surprise notes", href: "/notes" },
    { emoji: "🌈", title: "Mood", desc: "Daily check-in", href: "/mood" },
  ]

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { window.location.href = "/sign-in"; return }
    if (mountedRef.current) return
    mountedRef.current = true
    fetchData()
  }, [isLoaded, user])

  const fetchData = async () => {
    try {
      const r1 = await fetch("/api/couple?userId=" + user?.id)
      const d1 = await r1.json()

      if (!d1.couple) {
        window.location.href = "/onboarding"
        return
      }

      setCouple(d1.couple)

      if (d1.couple.anniversary_date) {
        const start = new Date(d1.couple.anniversary_date)
        const today = new Date()
        const days = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        setDaysTogether(days)
      }

      // Get moods
      const today = new Date().toISOString().split("T")[0]
      const r2 = await fetch(`/api/mood?coupleId=${d1.couple.id}&date=${today}`)
      const d2 = await r2.json()

      if (d2.moods) {
        const mine = d2.moods.find((m: any) => m.user_id === user?.id)
        const partner = d2.moods.find((m: any) => m.user_id !== user?.id)
        if (mine) setMyMood(mine.mood)
        if (partner) setPartnerMood(partner.mood)
      }

      // Get streak
      const r3 = await fetch(`/api/streak?coupleId=${d1.couple.id}&userId=${user?.id}`)
      const d3 = await r3.json()
      if (d3.streak) setStreak(d3.streak)

    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const saveMood = async (mood: string) => {
    setMyMood(mood)
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couple_id: couple?.id,
        user_id: user?.id,
        mood,
      }),
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 text-xl animate-pulse">Loading your space... 💕</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-rose-600">
            {couple?.couple_name || "Our Space"} 💑
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, {user?.firstName || "you"}!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-rose-500">{daysTogether}</div>
            <div className="text-gray-400 text-sm mt-1">Days Together 💕</div>
          </div>
          <div className="bg-white rounded-2xl p-5 text-center shadow-sm">
            <div className="text-4xl font-bold text-orange-400">{streak} 🔥</div>
            <div className="text-gray-400 text-sm mt-1">Day Streak</div>
          </div>
        </div>

        {/* Mood */}
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
                  myMood === mood ? "bg-rose-100 scale-110 shadow-sm" : "hover:bg-gray-50"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
          {partnerMood && (
            <p className="text-sm text-gray-400 mt-3">
              Your partner is feeling {partnerMood} today 💕
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-4">
          {features.map((feature) => (
            <a href={feature.href} key={feature.title}>
              <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer">
                <div className="text-3xl mb-2">{feature.emoji}</div>
                <div className="font-semibold text-gray-700">{feature.title}</div>
                <div className="text-gray-400 text-xs">{feature.desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Partner not connected */}
        {couple && !couple.user2_id && (
          <div className="bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl p-4 mt-6 text-center">
            <p className="text-gray-500 text-sm mb-1">Partner not connected yet!</p>
            <p className="text-rose-500 font-bold tracking-widest text-2xl">{couple.invite_code}</p>
            <p className="text-gray-400 text-xs mt-1">Share this code with your partner</p>
          </div>
        )}

      </div>
    </main>
  )
}