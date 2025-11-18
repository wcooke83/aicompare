import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Tools',
      links: [
        { href: '/compare', label: 'Compare Models' },
        { href: '/recommend', label: 'Recommender' },
        { href: '/cost-calculator', label: 'Cost Calculator' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/ai-models', label: 'AI Models' },
        { href: '/cloud-gpus', label: 'Cloud GPUs' },
        { href: '/ollama-models', label: 'Ollama Models' },
        { href: '/mac-vs-rtx', label: 'Hardware Comparison' },
      ],
    },
    {
      title: 'Information',
      links: [
        { href: '/faq', label: 'FAQ' },
        { href: '/sitemap', label: 'Sitemap' },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link
              href="/"
              className="text-xl font-bold text-white hover:text-blue-400 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1"
            >
              AI Comparisons
            </Link>
            <p className="mt-4 text-slate-400 text-sm">
              Compare AI models, hardware, and cloud GPU options to make informed decisions.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900 rounded px-2 py-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-center text-slate-500 text-sm">
            &copy; {currentYear} AI Comparisons. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
