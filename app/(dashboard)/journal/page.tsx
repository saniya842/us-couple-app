"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function JournalPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [coupleId, setCoupleId] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("😊")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const mountedRef = useRef(false)

  const moodOptions = ["😊","🥰","😴","😤","😢","🤩","😌","🥺"]

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
        const r2 = await fetch("/api/journal?coupleId=" + cid)
        const d2 = await r2.json()
        setEntries(d2.entries || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [isLoaded, user, router])

  const addEntry = async () => {
    if (!title || !content || !coupleId) return
    setAdding(true)
    await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couple_id: coupleId,
        author_id: user?.id,
        title,
        content,
        mood,
      }),
    })
    setTitle("")
    setContent("")
    setMood("😊")
    setShowForm(false)
    const r = await fetch("/api/journal?coupleId=" + coupleId)
    const d = await r.json()
    setEntries(d.entries || [])
    setAdding(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading journal... 💕</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between py-6">
          <div>
            <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
            <h1 className="text-2xl font-bold text-gray-800">Our Journal 📖</h1>
            <p className="text-gray-400 text-sm">Shared memories & moments</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            + Write
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">New Entry ✍️</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Title (e.g. Our first trip to Goa)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300"
              />
              <textarea
                placeholder="Write your memory here... 💭"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300 resize-none"
              />
              <div>
                <p className="text-sm text-gray-400 mb-2">Mood</p>
                <div className="flex gap-2">
                  {moodOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`text-xl p-2 rounded-lg transition-all ${
                        mood === m ? "bg-rose-100 scale-110" : "hover:bg-gray-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={addEntry}
                disabled={adding || !title || !content}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold"
              >
                {adding ? "Saving..." : "Save Entry 📖"}
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">📖</div>
            <p className="text-gray-400">No journal entries yet!</p>
            <p className="text-gray-300 text-sm mt-1">Write your first memory above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((e) => (
              <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{e.mood}</span>
                    <h3 className="font-semibold text-gray-700">{e.title}</h3>
                  </div>
                  <span className="text-xs text-gray-300">
                    {new Date(e.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{e.content}</p>
                <p className="text-xs text-rose-300 mt-2">
                  {e.author_id === user?.id ? "Written by you" : "Written by your partner"}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  )
}