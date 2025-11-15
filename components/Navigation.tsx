import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
            aria-label="AI Comparisons - Home"
          >
            AI Comparisons
          </Link>
          <div className="flex gap-6" role="list">
            <Link
              href="/mac-vs-rtx"
              className="text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
              role="listitem"
            >
              Hardware Comparison
            </Link>
            <Link
              href="/ai-models"
              className="text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
              role="listitem"
            >
              AI Models
            </Link>
            <Link
              href="/ollama-models"
              className="text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
              role="listitem"
            >
              Ollama Models
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}