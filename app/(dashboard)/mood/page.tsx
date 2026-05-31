"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MoodPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [coupleId, setCoupleId] = useState("")
  const [myMood, setMyMood] = useState("")
  const [partnerMood, setPartnerMood] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const mountedRef = useRef(false)

  const moods = [
    { emoji: "😊", label: "Happy" },
    { emoji: "🥰", label: "Loved" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😤", label: "Stressed" },
    { emoji: "😢", label: "Sad" },
    { emoji: "🤩", label: "Excited" },
    { emoji: "😌", label: "Calm" },
    { emoji: "🥺", label: "Needy" },
  ]

  useEffect(() => {
    if (!isLoaded) return
    if (!user) { router.push("/sign-in"); return }
    if (mountedRef.current) return
    mountedRef.current = true

    const load = async () => {
      try {
        const r1 = await fetch("/api/couple?userId=" + user.id)
        const d1 = await r1.json()
        if (!d1.couple) { router.push("/onboarding"); return }
        const cid = d1.couple.id
        setCoupleId(cid)

        const today = new Date().toISOString().split("T")[0]
        const r2 = await fetch(`/api/mood?coupleId=${cid}&date=${today}`)
        const d2 = await r2.json()

        if (d2.moods) {
          const mine = d2.moods.find((m: any) => m.user_id === user.id)
          const partner = d2.moods.find((m: any) => m.user_id !== user.id)
          if (mine) setMyMood(mine.mood)
          if (partner) setPartnerMood(partner.mood)
        }
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [isLoaded, user, router])

  const saveMood = async (mood: string) => {
    setMyMood(mood)
    setSaved(false)
    await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couple_id: coupleId,
        user_id: user?.id,
        mood,
        note,
      }),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading moods... 🌈</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="py-6">
          <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800">Mood Check-in 🌈</h1>
          <p className="text-gray-400 text-sm">How are you feeling today?</p>
        </div>

        {/* My Mood */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Your mood today</h3>
          <div className="grid grid-cols-4 gap-3">
            {moods.map((m) => (
              <button
                key={m.emoji}
                onClick={() => saveMood(m.emoji)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  myMood === m.emoji
                    ? "bg-rose-100 scale-105 shadow-sm"
                    : "hover:bg-gray-50"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs text-gray-400 mt-1">{m.label}</span>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300 resize-none mt-4 text-sm"
          />

          {saved && (
            <p className="text-green-500 text-sm text-center mt-2">
              Mood saved! ✅
            </p>
          )}
        </div>

        {/* Partner Mood */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">
            Your partner's mood today 💕
          </h3>
          {partnerMood ? (
            <div className="flex items-center gap-3">
              <span className="text-5xl">{partnerMood}</span>
              <p className="text-gray-500">
                Your partner is feeling{" "}
                <span className="font-medium text-rose-400">
                  {moods.find((m) => m.emoji === partnerMood)?.label || "something"}
                </span>{" "}
                today
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-300">Your partner hasn't checked in yet today</p>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}