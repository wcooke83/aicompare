'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Cloud, Cpu, DollarSign, Server, Rocket, AlertCircle } from 'lucide-react';
import faqData from '@/data/faq.json';

interface Question {
  id: string;
  question: string;
  answer: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  questions: Question[];
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  cloud: Cloud,
  cpu: Cpu,
  'dollar-sign': DollarSign,
  server: Server,
  rocket: Rocket,
  'alert-circle': AlertCircle,
};

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, 'yes' | 'no' | null>>({});

  const categories = faqData.categories as Category[];

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    categories.forEach(category => {
      category.questions.forEach(question => {
        question.tags.forEach(tag => tags.add(tag));
      });
    });
    return Array.from(tags).sort();
  }, [categories]);

  // Filter questions based on search, category, and tag
  const filteredQuestions = useMemo(() => {
    let results: Array<{ category: Category; question: Question }> = [];

    categories.forEach(category => {
      if (selectedCategory !== 'all' && category.id !== selectedCategory) {
        return;
      }

      category.questions.forEach(question => {
        // Filter by tag
        if (selectedTag !== 'all' && !question.tags.includes(selectedTag)) {
          return;
        }

        // Filter by search term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesQuestion = question.question.toLowerCase().includes(searchLower);
          const matchesAnswer = question.answer.toLowerCase().includes(searchLower);
          const matchesTags = question.tags.some(tag => tag.toLowerCase().includes(searchLower));

          if (!matchesQuestion && !matchesAnswer && !matchesTags) {
            return;
          }
        }

        results.push({ category, question });
      });
    });

    return results;
  }, [categories, searchTerm, selectedCategory, selectedTag]);

  // Get popular questions (first 5 from different categories)
  const popularQuestions = useMemo(() => {
    const popular: Array<{ category: Category; question: Question }> = [];
    const seenCategories = new Set<string>();

    categories.forEach(category => {
      if (popular.length >= 5) return;
      if (!seenCategories.has(category.id) && category.questions.length > 0) {
        popular.push({ category, question: category.questions[0] });
        seenCategories.add(category.id);
      }
    });

    return popular;
  }, [categories]);

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleVote = (questionId: string, vote: 'yes' | 'no') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [questionId]: prev[questionId] === vote ? null : vote
    }));
  };

  const expandAll = () => {
    const allIds = new Set(filteredQuestions.map(({ question }) => question.id));
    setExpandedQuestions(allIds);
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const QuestionCard = ({ category, question }: { category: Category; question: Question }) => {
    const isExpanded = expandedQuestions.has(question.id);
    const vote = helpfulVotes[question.id];

    return (
      <div key={question.id} className="border border-slate-700 rounded-lg bg-slate-800/50">
        <button
          onClick={() => toggleQuestion(question.id)}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/50 transition focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-lg"
          aria-expanded={isExpanded}
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              {question.question}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-blue-900/50 text-blue-300 rounded">
                {category.name}
              </span>
              {question.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded cursor-pointer hover:bg-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTag(tag);
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 ml-4" />
          )}
        </button>

        {isExpanded && (
          <div className="px-6 pb-4">
            <div className="pt-2 pb-4 text-slate-300 leading-relaxed border-t border-slate-700">
              {question.answer}
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-700">
              <span className="text-sm text-slate-400">Was this helpful?</span>
              <button
                onClick={() => handleVote(question.id, 'yes')}
                className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                  vote === 'yes'
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                aria-label="Mark as helpful"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">Yes</span>
              </button>
              <button
                onClick={() => handleVote(question.id, 'no')}
                className={`flex items-center gap-1 px-3 py-1 rounded transition ${
                  vote === 'no'
                    ? 'bg-red-900/50 text-red-300'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                aria-label="Mark as not helpful"
              >
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">No</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-slate-300">
            Find answers to common questions about AI models, cloud GPUs, and costs
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions, answers, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Filter by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-3 rounded-lg font-medium transition ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {categories.map(category => {
              const Icon = iconMap[category.icon] || AlertCircle;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={category.description}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Filter */}
        {selectedTag !== 'all' && (
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">Filtered by tag:</span>
              <button
                onClick={() => setSelectedTag('all')}
                className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm hover:bg-blue-900/70 transition"
              >
                {selectedTag} ✕
              </button>
            </div>
          </div>
        )}

        {/* Popular Questions Section */}
        {!searchTerm && selectedCategory === 'all' && selectedTag === 'all' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Popular Questions</h2>
            <div className="grid gap-4">
              {popularQuestions.map(({ category, question }) => (
                <QuestionCard key={question.id} category={category} question={question} />
              ))}
            </div>
          </div>
        )}

        {/* All Questions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchTerm || selectedCategory !== 'all' || selectedTag !== 'all'
                ? `Found ${filteredQuestions.length} question${filteredQuestions.length !== 1 ? 's' : ''}`
                : 'All Questions'
              }
            </h2>
            {filteredQuestions.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={expandAll}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-sm hover:bg-slate-600 transition"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          {filteredQuestions.length > 0 ? (
            <div className="grid gap-4">
              {filteredQuestions.map(({ category, question }) => (
                <QuestionCard key={question.id} category={category} question={question} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                No questions found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Quick Tag Reference */}
        {allTags.length > 0 && (
          <div className="mt-12 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Browse by Topic</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
