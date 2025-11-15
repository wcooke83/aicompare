'use client';

/**
 * Skip to main content link for keyboard and screen reader users
 * Allows users to bypass navigation and jump directly to main content
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
