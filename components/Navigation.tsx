'use client';

import Link from 'next/link';
import { useState, Fragment } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLink {
  href: string;
  label: string;
  description?: string;
}

interface NavCategory {
  label: string;
  icon?: React.ReactNode;
  links: NavLink[];
}

export default function Navigation() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Organized navigation structure
  const navCategories: NavCategory[] = [
    {
      label: 'Hardware',
      links: [
        { href: '/mac-vs-rtx', label: 'Mac vs RTX', description: 'Compare Mac and NVIDIA performance' },
        { href: '/cloud-gpus', label: 'Cloud GPUs', description: 'Cloud GPU providers and pricing' },
      ],
    },
    {
      label: 'AI Models',
      links: [
        { href: '/ai-models', label: 'Model Comparison', description: 'Compare AI model performance' },
        { href: '/ollama-models', label: 'Ollama Models', description: 'Local model deployment guide' },
      ],
    },
    {
      label: 'Tools',
      links: [
        { href: '/compare', label: 'Compare', description: 'Side-by-side comparisons' },
        { href: '/recommend', label: 'Recommender', description: 'Get personalized recommendations' },
        { href: '/cost-calculator', label: 'Cost Calculator', description: 'Calculate usage costs' },
      ],
    },
  ];

  const standaloneLinks: NavLink[] = [
    { href: '/faq', label: 'FAQ' },
    { href: '/sitemap', label: 'Sitemap' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 rounded px-2 py-1"
            aria-label="AI Comparisons - Home"
          >
            AI Comparisons
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Dropdown Categories */}
            {navCategories.map((category) => (
              <HeadlessMenu as="div" className="relative" key={category.label}>
                {({ open }) => (
                  <>
                    <HeadlessMenu.Button className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800">
                      {category.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          open ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </HeadlessMenu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <HeadlessMenu.Items className="absolute left-0 mt-2 w-72 origin-top-left rounded-lg bg-slate-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-slate-700">
                        <div className="py-2">
                          {category.links.map((link) => (
                            <HeadlessMenu.Item key={link.href}>
                              {({ active }) => (
                                <Link
                                  href={link.href}
                                  className={`block px-4 py-3 transition-colors ${
                                    active
                                      ? 'bg-slate-800 text-white'
                                      : 'text-slate-300'
                                  }`}
                                >
                                  <div className="font-medium">{link.label}</div>
                                  {link.description && (
                                    <div className="text-xs text-slate-400 mt-0.5">
                                      {link.description}
                                    </div>
                                  )}
                                </Link>
                              )}
                            </HeadlessMenu.Item>
                          ))}
                        </div>
                      </HeadlessMenu.Items>
                    </Transition>
                  </>
                )}
              </HeadlessMenu>
            ))}

            {/* Standalone Links */}
            {standaloneLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-400"
            aria-expanded={isMobileOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-700 bg-slate-800"
            id="mobile-menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Categories */}
              {navCategories.map((category) => (
                <div key={category.label} className="space-y-1">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {category.label}
                  </div>
                  {category.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors ml-3"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <div>{link.label}</div>
                      {link.description && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {link.description}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ))}

              {/* Mobile Standalone Links */}
              <div className="pt-2 border-t border-slate-700 mt-2">
                {standaloneLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-slate-300 hover:text-white hover:bg-slate-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
