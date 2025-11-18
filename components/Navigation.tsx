'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/mac-vs-rtx', label: 'Hardware' },
    { href: '/ai-models', label: 'AI Models' },
    { href: '/cloud-gpus', label: 'Cloud GPUs' },
    { href: '/ollama-models', label: 'Ollama' },
    { href: '/cost-calculator', label: 'Cost Calculator' },
    { href: '/compare', label: 'Compare' },
    { href: '/recommend', label: 'Recommender' },
    { href: '/faq', label: 'FAQ' },
    { href: '/sitemap', label: 'Sitemap' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
            aria-label="AI Comparisons - Home"
          >
            AI Comparisons
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-6" role="list">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
                role="listitem"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
            aria-expanded={isOpen}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
