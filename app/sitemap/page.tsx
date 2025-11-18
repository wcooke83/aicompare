import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap - AI Compare',
  description: 'Complete sitemap of all AI comparison tools and resources available on AI Compare.',
};

export default function Sitemap() {
  const pages = [
    {
      category: 'Main Comparisons',
      links: [
        {
          href: '/',
          title: 'Home',
          description: 'Interactive dashboard with navigation to all comparison tools',
        },
        {
          href: '/mac-vs-rtx',
          title: 'Hardware Comparison',
          description: 'Compare Mac vs RTX GPU performance for AI inference workloads',
        },
        {
          href: '/ai-models',
          title: 'AI Models Comparison',
          description: 'Compare GPT-4, Claude, Gemini, Llama, and other leading language models',
        },
        {
          href: '/cloud-gpus',
          title: 'Cloud GPU Comparison',
          description: 'Compare cloud GPU pricing and performance across AWS, GCP, Azure, Lambda Labs, RunPod, Vast.ai, and more',
        },
        {
          href: '/ollama-models',
          title: 'Ollama Models',
          description: 'Explore 35+ local AI models with detailed resource requirements and specifications',
        },
      ],
    },
    {
      category: 'Tools & Calculators',
      links: [
        {
          href: '/cost-calculator',
          title: 'Cost Calculator',
          description: 'Estimate monthly costs and compare API vs self-hosting expenses',
        },
        {
          href: '/compare',
          title: 'Side-by-Side Comparison',
          description: 'Compare up to 4 AI models side-by-side with detailed specifications',
        },
        {
          href: '/recommend',
          title: 'AI Recommender',
          description: 'Get personalized AI model recommendations based on your requirements',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-center">
          Sitemap
        </h1>
        <p className="text-slate-300 mb-12 text-lg text-center">
          Complete guide to all AI comparison tools and resources
        </p>

        <div className="space-y-12">
          {pages.map((section, index) => (
            <div key={index} className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
              <h2 className="text-3xl font-bold mb-6 text-blue-400">{section.category}</h2>
              <div className="grid gap-6">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="group bg-slate-700/50 p-6 rounded-lg hover:bg-slate-700 transition-all border border-slate-600 hover:border-blue-500"
                  >
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors">
                      {link.title} →
                    </h3>
                    <p className="text-slate-300 group-hover:text-slate-200">{link.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur rounded-xl p-8 border border-blue-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-400">What You Can Compare</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">70+</div>
              <div className="text-slate-300">Cloud GPU Instances</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10+</div>
              <div className="text-slate-300">AI Models</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">35+</div>
              <div className="text-slate-300">Ollama Models</div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
