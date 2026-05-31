"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function MilestonesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [milestones, setMilestones] = useState<any[]>([])
  const [coupleId, setCoupleId] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [emoji, setEmoji] = useState("🎯")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const mountedRef = useRef(false)

  const emojiOptions = ["🎯","💍","✈️","🏠","🐶","🎂","💑","🌍","🎓","💼","🎉","❤️"]

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
        const r2 = await fetch("/api/milestones?coupleId=" + cid)
        const d2 = await r2.json()
        setMilestones(d2.milestones || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }

    load()
  }, [isLoaded, user, router])

  const addMilestone = async () => {
    if (!title || !date || !coupleId) return
    setAdding(true)
    await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ couple_id: coupleId, title, date, emoji }),
    })
    setTitle("")
    setDate("")
    setEmoji("🎯")
    setShowForm(false)
    const r = await fetch("/api/milestones?coupleId=" + coupleId)
    const d = await r.json()
    setMilestones(d.milestones || [])
    setAdding(false)
  }

  const getDaysAgo = (dateStr: string) => {
    const d = new Date(dateStr)
    const today = new Date()
    const days = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today! 🎉"
    if (days < 0) return `In ${Math.abs(days)} days`
    return `${days} days ago`
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading milestones... 💕</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between py-6">
          <div>
            <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-800">Milestones 🎯</h1>
            <p className="text-gray-400 text-sm">Your journey together</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + Add
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">New Milestone</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="What's the milestone?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300"
              />
              <div>
                <p className="text-sm text-gray-400 mb-2">Pick an emoji</p>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
                      className={`text-xl p-2 rounded-lg transition-all ${
                        emoji === e ? "bg-rose-100 scale-110" : "hover:bg-gray-50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={addMilestone}
                disabled={adding || !title || !date}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
              >
                {adding ? "Adding..." : "Add Milestone 🎯"}
              </button>
            </div>
          </div>
        )}

        {milestones.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">🎯</div>
            <p className="text-gray-400">No milestones yet!</p>
            <p className="text-gray-300 text-sm mt-1">Add your first milestone above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...milestones]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((m) => (
                <div key={m.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
                  <div className="text-4xl">{m.emoji}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-700">{m.title}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(m.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-rose-400 font-medium">{getDaysAgo(m.date)}</p>
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>
    </main>
  )
}