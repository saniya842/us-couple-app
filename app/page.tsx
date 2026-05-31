import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 flex flex-col items-center justify-center px-4">
      
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="text-6xl mb-6">💑</div>
        <h1 className="text-5xl font-bold text-rose-600 mb-4">
          Us
        </h1>
        <p className="text-xl text-gray-500 mb-2">
          Your Couple's World
        </p>
        <p className="text-gray-400 mb-10">
          A private, beautiful space just for the two of you. 
          Share memories, track milestones, and stay connected every day.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/sign-up">
            <button className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Get Started 💕
            </button>
          </a>
          <a href="/sign-in">
            <button className="border-2 border-rose-300 text-rose-500 hover:bg-rose-50 px-8 py-3 rounded-full text-lg font-semibold transition-all">
              Sign In
            </button>
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
        {[
          { emoji: "📖", title: "Journal", desc: "Shared memories" },
          { emoji: "💘", title: "Quiz", desc: "Compatibility" },
          { emoji: "🌙", title: "Date Night", desc: "Plan together" },
          { emoji: "🎯", title: "Milestones", desc: "Track journey" },
          { emoji: "💬", title: "Private Chat", desc: "Just you two" },
          { emoji: "🌈", title: "Mood", desc: "Daily check-in" },
          { emoji: "💌", title: "Love Notes", desc: "Surprise notes" },
          { emoji: "🔥", title: "Streaks", desc: "Stay connected" },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-2">{feature.emoji}</div>
            <div className="font-semibold text-gray-700 text-sm">{feature.title}</div>
            <div className="text-gray-400 text-xs">{feature.desc}</div>
          </div>
        ))}
      </div>

      <p className="text-gray-300 text-sm mt-12">Made with ❤️ for couples</p>
    </main>
  )
}