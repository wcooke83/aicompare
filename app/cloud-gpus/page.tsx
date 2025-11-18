import CloudGPUComparison from '@/components/CloudGPUComparison';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cloud GPU Comparison - AI Compare',
  description: 'Compare cloud GPU pricing and performance across AWS, GCP, Azure, Lambda Labs, RunPod, Vast.ai, and more. Find the best cloud GPU for your AI workloads.',
};

export default function CloudGPUsPage() {
  return <CloudGPUComparison />;
}
