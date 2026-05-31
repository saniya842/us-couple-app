"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NotesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [notes, setNotes] = useState<any[]>([])
  const [coupleId, setCoupleId] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const mountedRef = useRef(false)

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
        const r2 = await fetch(`/api/notes?coupleId=${cid}&userId=${user.id}`)
        const d2 = await r2.json()
        setNotes(d2.notes || [])
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [isLoaded, user, router])

  const sendNote = async () => {
    if (!content.trim() || !coupleId) return
    setSending(true)
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couple_id: coupleId,
        sender_id: user?.id,
        content,
      }),
    })
    setContent("")
    setSent(true)
    setSending(false)
    setTimeout(() => setSent(false), 3000)
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading love notes... 💌</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="py-6">
          <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800">Love Notes 💌</h1>
          <p className="text-gray-400 text-sm">Send a surprise note to your partner</p>
        </div>

        {/* Send Note */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Write a note 💝</h3>
          <textarea
            placeholder="Write something sweet for your partner... 💕"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300 resize-none mb-3"
          />
          {sent && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 mb-3">
              <p className="text-green-500 text-sm text-center">💌 Note sent to your partner!</p>
            </div>
          )}
          <button
            onClick={sendNote}
            disabled={sending || !content.trim()}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all"
          >
            {sending ? "Sending..." : "Send Love Note 💌"}
          </button>
        </div>

        {/* Received Notes */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-3">
            Notes from your partner 💕
          </h3>

          {notes.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="text-5xl mb-4">💌</div>
              <p className="text-gray-400">No notes yet!</p>
              <p className="text-gray-300 text-sm mt-1">
                Your partner hasn't sent you any notes yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-rose-300"
                >
                  <p className="text-gray-600 leading-relaxed">{note.content}</p>
                  <p className="text-xs text-rose-300 mt-3">
                    {new Date(note.created_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}