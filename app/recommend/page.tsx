import RecommendationEngine from '@/components/RecommendationEngine';

export const metadata = {
  title: 'AI Model Recommender | Find Your Perfect AI',
  description: 'Answer a few questions and get personalized AI model recommendations based on your specific needs, budget, and use case.',
};

export default function RecommendPage() {
  return <RecommendationEngine />;
}
