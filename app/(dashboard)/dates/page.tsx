"use client"

import { useState } from "react"
import Link from "next/link"

const dateIdeas = [
  { emoji: "🕯️", title: "Candlelit Dinner", desc: "Cook a fancy dinner at home together", category: "Indoor" },
  { emoji: "🎬", title: "Movie Marathon", desc: "Pick 3 movies and binge watch all night", category: "Indoor" },
  { emoji: "🌟", title: "Stargazing", desc: "Find a quiet spot and count the stars", category: "Outdoor" },
  { emoji: "🎨", title: "Paint Together", desc: "Buy canvases and paint each other's portrait", category: "Indoor" },
  { emoji: "🏕️", title: "Picnic in the Park", desc: "Pack your favourite snacks and enjoy nature", category: "Outdoor" },
  { emoji: "🎮", title: "Game Night", desc: "Play board games or video games together", category: "Indoor" },
  { emoji: "🚴", title: "Bike Ride", desc: "Explore your city on bicycles", category: "Outdoor" },
  { emoji: "🍳", title: "Cooking Class", desc: "Learn to make a new cuisine together", category: "Indoor" },
  { emoji: "🎭", title: "Open Mic Night", desc: "Find a local open mic or comedy show", category: "Out & About" },
  { emoji: "📸", title: "Photo Walk", desc: "Walk around and take aesthetic photos together", category: "Outdoor" },
  { emoji: "🧘", title: "Couples Yoga", desc: "Try a couples yoga session at home", category: "Indoor" },
  { emoji: "🌅", title: "Sunrise Watch", desc: "Wake up early and watch the sunrise together", category: "Outdoor" },
]

export default function DatesPage() {
  const [filter, setFilter] = useState("All")
  const [saved, setSaved] = useState<string[]>([])
  const categories = ["All", "Indoor", "Outdoor", "Out & About"]

  const filtered = filter === "All"
    ? dateIdeas
    : dateIdeas.filter((d) => d.category === filter)

  const toggleSave = (title: string) => {
    setSaved((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-4 pb-10">
      <div className="max-w-2xl mx-auto">

        <div className="py-6">
          <Link href="/dashboard" className="text-rose-300 text-sm mb-1 block">← Back</Link>
          <h1 className="text-2xl font-bold text-gray-800">Date Night Ideas 🌙</h1>
          <p className="text-gray-400 text-sm">Plan your next perfect date</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat
                  ? "bg-rose-500 text-white"
                  : "bg-white text-gray-500 hover:bg-rose-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Saved */}
        {saved.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-rose-500 mb-2">
              Saved Ideas ({saved.length}) ❤️
            </p>
            <div className="flex flex-wrap gap-2">
              {saved.map((s) => (
                <span key={s} className="bg-white text-rose-400 text-xs px-3 py-1 rounded-full border border-rose-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((idea) => (
            <div key={idea.title} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
              <div className="text-4xl">{idea.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-700">{idea.title}</h3>
                  <span className="text-xs bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full">
                    {idea.category}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{idea.desc}</p>
              </div>
              <button
                onClick={() => toggleSave(idea.title)}
                className={`text-xl transition-all ${
                  saved.includes(idea.title) ? "scale-110" : "opacity-40 hover:opacity-100"
                }`}
              >
                {saved.includes(idea.title) ? "❤️" : "🤍"}
              </button>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}