import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import SkipToContent from '@/components/SkipToContent';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Performance Comparisons',
  description: 'Interactive charts comparing AI models and hardware',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SkipToContent />
        <Navigation />
        <ErrorBoundary>
          <main id="main-content">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}