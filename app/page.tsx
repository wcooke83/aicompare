import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Performance Comparisons
        </h1>
        <p className="text-center text-slate-300 mb-12 text-lg">
          Interactive charts and diagrams comparing AI models and hardware
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/mac-vs-rtx" className="group">
            <div className="bg-slate-800 rounded-xl p-8 hover:bg-slate-750 transition-all border-2 border-transparent hover:border-blue-500 cursor-pointer">
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
                Hardware Comparison
              </h2>
              <p className="text-slate-300 mb-4">
                Hardware Performance Comparison for AI inference
              </p>
              <div className="flex items-center text-blue-400 font-semibold">
                View Comparison →
              </div>
            </div>
          </Link>

          <Link href="/ai-models" className="group">
            <div className="bg-slate-800 rounded-xl p-8 hover:bg-slate-750 transition-all border-2 border-transparent hover:border-purple-500 cursor-pointer">
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                AI Models Comparison
              </h2>
              <p className="text-slate-300 mb-4">
                Compare GPT-4, Claude, Gemini, Llama and other leading language models
              </p>
              <div className="flex items-center text-purple-400 font-semibold">
                View Comparison →
              </div>
            </div>
          </Link>

          <Link href="/ollama-models" className="group">
            <div className="bg-slate-800 rounded-xl p-8 hover:bg-slate-750 transition-all border-2 border-transparent hover:border-green-500 cursor-pointer">
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-green-400 transition-colors">
                Ollama Models
              </h2>
              <p className="text-slate-300 mb-4">
                Explore 35+ local AI models with detailed resource requirements
              </p>
              <div className="flex items-center text-green-400 font-semibold">
                View Models →
              </div>
            </div>
          </Link>

          <Link href="/cost-calculator" className="group">
            <div className="bg-slate-800 rounded-xl p-8 hover:bg-slate-750 transition-all border-2 border-transparent hover:border-yellow-500 cursor-pointer">
              <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">
                Cost Calculator
              </h2>
              <p className="text-slate-300 mb-4">
                Estimate monthly costs and compare API vs self-hosting expenses
              </p>
              <div className="flex items-center text-yellow-400 font-semibold">
                Calculate Costs →
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}