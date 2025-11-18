import type { Metadata } from 'next';
import FAQ from '@/components/FAQ';

export const metadata: Metadata = {
  title: 'FAQ - AI Comparisons',
  description: 'Frequently asked questions about AI models, cloud GPUs, costs, and getting started with AI development',
};

export default function FAQPage() {
  return <FAQ />;
}
