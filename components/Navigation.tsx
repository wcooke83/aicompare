import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white hover:text-blue-400 transition">
            AI Comparisons
          </Link>
          <div className="flex gap-6">
            <Link href="/mac-vs-rtx" className="text-slate-300 hover:text-white transition">
              Hardware Comparison
            </Link>
            <Link href="/ai-models" className="text-slate-300 hover:text-white transition">
              AI Models
            </Link>
            <Link href="/ollama-models" className="text-slate-300 hover:text-white transition">
              Ollama Models
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}