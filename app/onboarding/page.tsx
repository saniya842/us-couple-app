"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [step, setStep] = useState<"choice" | "done">("choice")
  const [inviteCode, setInviteCode] = useState("")
  const [coupleName, setCoupleName] = useState("")
  const [anniversary, setAnniversary] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in")
  }, [isLoaded, user])

  const generateCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase()

  const handleCreateCouple = async () => {
    if (!user) return
    setLoading(true)
    setError("")

    const code = generateCode()

    try {
      const res = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          user1_id: user.id,
          invite_code: code,
          couple_name: coupleName || "Our Couple 💕",
          anniversary_date: anniversary || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed")

      setGeneratedCode(code)
      setStep("done")
    } catch (err: any) {
      setError(err.message || "Something went wrong!")
    }

    setLoading(false)
  }

  const handleJoinCouple = async () => {
    if (!user || !inviteCode) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          user2_id: user.id,
          invite_code: inviteCode.toUpperCase(),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Invalid code!")

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong!")
    }

    setLoading(false)
  }

  if (!isLoaded) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center">
      <p className="text-rose-400 animate-pulse">Loading... 💕</p>
    </div>
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full">

        {step === "choice" && (
          <div className="text-center">
            <div className="text-5xl mb-4">💑</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Us!</h1>
            <p className="text-gray-400 mb-8">Let's connect you with your partner</p>

            <div className="space-y-4 text-left">
              <div>
                <label className="text-sm text-gray-500 mb-1 block font-medium">Couple Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sam & Alex 💕"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block font-medium">
                  Anniversary / First date
                  <span className="text-gray-300 ml-1">(optional)</span>
                </label>
                <input
                  type="date"
                  value={anniversary}
                  onChange={(e) => setAnniversary(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleCreateCouple}
                disabled={loading}
                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-70 text-white py-3 rounded-xl font-semibold transition-all shadow-sm"
              >
                {loading ? "Creating your space..." : "Create Our Space 💕"}
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-gray-300 text-sm">or join partner</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              <input
                type="text"
                placeholder="Enter partner's invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-rose-300 uppercase tracking-widest"
              />

              <button
                onClick={handleJoinCouple}
                disabled={loading || !inviteCode}
                className="w-full border-2 border-rose-200 text-rose-500 hover:bg-rose-50 disabled:opacity-40 py-3 rounded-xl font-semibold transition-all"
              >
                {loading ? "Joining..." : "Join Partner's Space 🔗"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your space is ready!</h1>
            <p className="text-gray-400 mb-6">Share this code with your partner</p>

            <div className="bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl p-6 mb-6">
              <p className="text-sm text-gray-400 mb-2">Invite Code</p>
              <p className="text-4xl font-bold text-rose-500 tracking-widest">{generatedCode}</p>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Ask your partner to enter this code when they sign up!
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold transition-all"
            >
              Go to Dashboard →
            </button>
          </div>
        )}

      </div>
    </main>
  )
}