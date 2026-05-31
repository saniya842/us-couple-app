"use client"

import { useEffect, useRef, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [coupleId, setCoupleId] = useState("")
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const mountedRef = useRef(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()

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
        await fetchMessages(cid)
        // Poll every 3 seconds for new messages
        pollRef.current = setInterval(() => fetchMessages(cid), 3000)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isLoaded, user, router])

  const fetchMessages = async (cid: string) => {
    const r = await fetch("/api/chat?coupleId=" + cid)
    const d = await r.json()
    setMessages(d.messages || [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const sendMessage = async () => {
    if (!text.trim() || !coupleId || sending) return
    setSending(true)
    const msg = text.trim()
    setText("")
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        couple_id: coupleId,
        sender_id: user?.id,
        content: msg,
      }),
    })
    await fetchMessages(coupleId)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit"
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading chat... 💬</p>
    </div>
  )

  return (
    <main className="h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex flex-col">

      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="text-rose-300 text-sm">← Back</Link>
        <div className="flex-1 text-center">
          <h1 className="font-bold text-gray-800">Private Chat 💬</h1>
          <p className="text-xs text-gray-400">Just the two of you</p>
        </div>
        <div className="w-12" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="text-5xl mb-4">💬</div>
            <p className="text-gray-400">No messages yet!</p>
            <p className="text-gray-300 text-sm">Say something to your partner 💕</p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  isMe
                    ? "bg-rose-500 text-white rounded-br-sm"
                    : "bg-white text-gray-700 shadow-sm rounded-bl-sm"
                }`}
              >
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-rose-200" : "text-gray-300"}`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white px-4 py-3 flex gap-3 items-end shadow-up">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... 💕"
          rows={1}
          className="flex-1 border border-gray-200 rounded-2xl px-4 py-2 text-gray-700 focus:outline-none focus:border-rose-300 resize-none text-sm"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
        >
          ➤
        </button>
      </div>

    </main>
  )
}