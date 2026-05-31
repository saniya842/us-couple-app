"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

const questions = [
  { q: "What's your partner's favourite food?", options: ["Pizza 🍕", "Biryani 🍛", "Pasta 🍝", "Sushi 🍱"] },
  { q: "Where would your partner love to travel?", options: ["Paris 🗼", "Maldives 🏝️", "Tokyo 🗾", "New York 🗽"] },
  { q: "What's your partner's love language?", options: ["Words 💬", "Touch 🤝", "Gifts 🎁", "Quality Time ⏰"] },
  { q: "Your partner's ideal date night?", options: ["Candlelit dinner 🕯️", "Movie night 🎬", "Stargazing 🌟", "Adventure 🏕️"] },
  { q: "Your partner's mood when stressed?", options: ["Quiet 🤫", "Talks it out 💬", "Needs hugs 🤗", "Needs space 🚶"] },
]

export default function QuizPage() {
  const { user } = useUser()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selected, setSelected] = useState("")
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (option: string) => {
    setSelected(option)
  }

  const handleNext = () => {
    if (!selected) return
    const newAnswers = [...answers, selected]
    setAnswers(newAnswers)
    setSelected("")

    if (current + 1 >= questions.length) {
      // Calculate random compatibility score for fun
      const s = Math.floor(Math.random() * 31) + 70 // 70-100
      setScore(s)
      setDone(true)
    } else {
      setCurrent(current + 1)
    }
  }

  const restart = () => {
    setCurrent(0)
    setAnswers([])
    setSelected("")
    setDone(false)
    setScore(0)
  }

  const getScoreEmoji = () => {
    if (score >= 90) return "🥰 Perfect Match!"
    if (score >= 80) return "💕 Great Couple!"
    return "💪 Growing Together!"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="py-6">
          <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800">Compatibility Quiz 💘</h1>
          <p className="text-gray-400 text-sm">How well do you know your partner?</p>
        </div>

        {!done ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i <= current ? "bg-rose-400" : "bg-gray-100"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-gray-400 mb-2">
              Question {current + 1} of {questions.length}
            </p>
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              {questions[current].q}
            </h2>

            <div className="space-y-3 mb-6">
              {questions[current].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selected === opt
                      ? "border-rose-400 bg-rose-50 text-rose-600"
                      : "border-gray-100 hover:border-rose-200 text-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={!selected}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all"
            >
              {current + 1 === questions.length ? "See Results 🎯" : "Next →"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-6xl mb-4">💘</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{getScoreEmoji()}</h2>
            <p className="text-gray-400 mb-6">Your compatibility score</p>

            <div className="bg-rose-50 rounded-2xl p-6 mb-6">
              <p className="text-6xl font-bold text-rose-500">{score}%</p>
            </div>

            <div className="space-y-2 text-left mb-6">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 mt-0.5">💕</span>
                  <div>
                    <p className="text-xs text-gray-400">{q.q}</p>
                    <p className="text-sm text-gray-600 font-medium">{answers[i]}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={restart}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-semibold"
            >
              Try Again 🔄
            </button>
          </div>
        )}
      </div>
    </main>
  )
}