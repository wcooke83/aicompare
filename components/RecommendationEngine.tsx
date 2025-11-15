'use client';

import React, { useState } from 'react';
import { Sparkles, Code, MessageSquare, FileText, BarChart3, Users, DollarSign, Zap, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import modelsData from '@/data/models.json';
import { sanitizeColor } from '@/types';
import Link from 'next/link';

interface Answer {
  useCase: string;
  budget: string;
  priority: string;
  contextNeeds: string;
  deployment: string;
}

interface ScoredModel {
  name: string;
  score: number;
  reasons: string[];
  model: typeof modelsData.models[0];
}

const RecommendationEngine = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer>({
    useCase: '',
    budget: '',
    priority: '',
    contextNeeds: '',
    deployment: ''
  });
  const [recommendations, setRecommendations] = useState<ScoredModel[]>([]);

  const questions = [
    {
      id: 'useCase',
      title: 'What will you primarily use the AI for?',
      icon: <Sparkles className="w-8 h-8" />,
      options: [
        { value: 'coding', label: 'Software Development & Coding', icon: <Code className="w-5 h-5" /> },
        { value: 'chat', label: 'Conversational AI / Chatbot', icon: <MessageSquare className="w-5 h-5" /> },
        { value: 'writing', label: 'Content Creation & Writing', icon: <FileText className="w-5 h-5" /> },
        { value: 'analysis', label: 'Data Analysis & Research', icon: <BarChart3 className="w-5 h-5" /> },
        { value: 'support', label: 'Customer Support', icon: <Users className="w-5 h-5" /> },
        { value: 'reasoning', label: 'Complex Reasoning & Problem Solving', icon: <Brain className="w-5 h-5" /> }
      ]
    },
    {
      id: 'budget',
      title: 'What\'s your budget?',
      icon: <DollarSign className="w-8 h-8" />,
      options: [
        { value: 'free', label: 'Free / Open Source Only', desc: '$0/month' },
        { value: 'low', label: 'Budget-Conscious', desc: 'Under $5/1M tokens' },
        { value: 'medium', label: 'Moderate', desc: '$5-15/1M tokens' },
        { value: 'high', label: 'Premium Performance', desc: 'Budget flexible' }
      ]
    },
    {
      id: 'priority',
      title: 'What matters most to you?',
      icon: <Zap className="w-8 h-8" />,
      options: [
        { value: 'speed', label: 'Speed & Low Latency', desc: 'Fast response times' },
        { value: 'quality', label: 'Output Quality', desc: 'Best possible results' },
        { value: 'balance', label: 'Balanced', desc: 'Good quality at reasonable speed' },
        { value: 'cost', label: 'Cost Efficiency', desc: 'Best value for money' }
      ]
    },
    {
      id: 'contextNeeds',
      title: 'How much context do you need?',
      icon: <FileText className="w-8 h-8" />,
      options: [
        { value: 'small', label: 'Small Context', desc: 'Short conversations (8-32K)' },
        { value: 'medium', label: 'Medium Context', desc: 'Standard documents (32-128K)' },
        { value: 'large', label: 'Large Context', desc: 'Long documents (128K+)' }
      ]
    },
    {
      id: 'deployment',
      title: 'Where will you deploy?',
      icon: <Code className="w-8 h-8" />,
      options: [
        { value: 'cloud', label: 'Cloud API', desc: 'Easy setup, pay per use' },
        { value: 'local', label: 'Self-Hosted', desc: 'Full control, privacy' },
        { value: 'either', label: 'No Preference', desc: 'Open to both options' }
      ]
    }
  ];

  const calculateRecommendations = () => {
    const scored: ScoredModel[] = modelsData.models.map(model => {
      let score = 0;
      const reasons: string[] = [];

      // Use case scoring
      switch (answers.useCase) {
        case 'coding':
          score += model.capabilities.coding * 15;
          if (model.capabilities.coding >= 9) reasons.push('Excellent coding capabilities');
          score += model.benchmarkHumanEval * 0.5;
          break;
        case 'chat':
          score += model.capabilities.creative * 10;
          score += model.capabilities.factual * 10;
          if (model.contextWindow >= 32) reasons.push('Good context for conversations');
          break;
        case 'writing':
          score += model.capabilities.creative * 15;
          score += model.capabilities.cleverness * 10;
          if (model.capabilities.creative >= 9) reasons.push('Strong creative writing skills');
          break;
        case 'analysis':
          score += model.capabilities.reasoning * 15;
          score += model.capabilities.factual * 10;
          score += model.capabilities.math * 10;
          if (model.benchmarkMMLU >= 85) reasons.push('High benchmark scores for analysis');
          break;
        case 'support':
          score += model.capabilities.factual * 15;
          score += model.speedTokens * 0.3;
          if (model.speedTokens >= 80) reasons.push('Fast response times for customers');
          break;
        case 'reasoning':
          score += model.capabilities.reasoning * 20;
          score += model.capabilities.math * 10;
          if (model.capabilities.reasoning >= 9) reasons.push('Exceptional reasoning abilities');
          break;
      }

      // Budget scoring
      switch (answers.budget) {
        case 'free':
          if (model.costPer1M === 0) {
            score += 100;
            reasons.push('Completely free to use');
          } else {
            score = 0; // Exclude paid models
          }
          break;
        case 'low':
          if (model.costPer1M <= 5) {
            score += 50;
            reasons.push('Budget-friendly pricing');
          } else {
            score -= 30;
          }
          break;
        case 'medium':
          if (model.costPer1M > 5 && model.costPer1M <= 15) {
            score += 30;
          }
          break;
        case 'high':
          score += model.quality * 10;
          if (model.quality >= 9) reasons.push('Premium quality model');
          break;
      }

      // Priority scoring
      switch (answers.priority) {
        case 'speed':
          score += model.speedTokens * 0.8;
          if (model.speedTokens >= 100) reasons.push('Very fast inference speed');
          break;
        case 'quality':
          score += model.quality * 15;
          score += model.benchmarkMMLU * 0.5;
          break;
        case 'balance':
          score += (model.speedTokens * 0.3) + (model.quality * 8);
          break;
        case 'cost':
          if (model.costPer1M === 0) {
            score += 80;
          } else {
            score += (100 / model.costPer1M) * 5;
          }
          break;
      }

      // Context needs scoring
      switch (answers.contextNeeds) {
        case 'small':
          if (model.contextWindow >= 8) score += 20;
          break;
        case 'medium':
          if (model.contextWindow >= 32 && model.contextWindow < 128) {
            score += 30;
          } else if (model.contextWindow >= 32) {
            score += 20;
          }
          break;
        case 'large':
          if (model.contextWindow >= 128) {
            score += 50;
            reasons.push('Large context window for long documents');
          }
          break;
      }

      // Deployment scoring
      switch (answers.deployment) {
        case 'cloud':
          if (model.category === 'Proprietary') {
            score += 30;
            reasons.push('Easy cloud API access');
          }
          break;
        case 'local':
          if (model.category === 'Open Source') {
            score += 40;
            reasons.push('Can be self-hosted for privacy');
          }
          break;
        case 'either':
          score += 10;
          break;
      }

      return { name: model.name, score, reasons, model };
    });

    // Sort by score and get top 5
    const top5 = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setRecommendations(top5);
  };

  const handleAnswer = (questionId: keyof Answer, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Last question, calculate recommendations
      setTimeout(() => {
        setAnswers(newAnswers);
        calculateRecommendations();
        setStep(questions.length);
      }, 300);
    }
  };

  const resetQuiz = () => {
    setStep(0);
    setAnswers({
      useCase: '',
      budget: '',
      priority: '',
      contextNeeds: '',
      deployment: ''
    });
    setRecommendations([]);
  };

  const currentQuestion = questions[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            AI Model Recommender
          </h1>
          <p className="text-slate-300 text-lg">Answer a few questions to find your perfect AI model</p>
        </div>

        {step < questions.length ? (
          <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur border border-slate-700">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Question {step + 1} of {questions.length}</span>
                <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4 text-purple-400">
                {currentQuestion.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2">{currentQuestion.title}</h2>
            </div>

            {/* Options */}
            <div className="grid md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id as keyof Answer, option.value)}
                  className="bg-slate-700/50 hover:bg-slate-600 border-2 border-slate-600 hover:border-purple-500 rounded-xl p-6 text-left transition-all group"
                >
                  <div className="flex items-start gap-4">
                    {'icon' in option && (
                      <div className="text-purple-400 group-hover:text-purple-300 mt-1">
                        {option.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{option.label}</div>
                      {'desc' in option && (
                        <div className="text-sm text-slate-400">{option.desc}</div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>
              ))}
            </div>

            {/* Back button */}
            {step > 0 && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setStep(step - 1)}
                  className="text-slate-400 hover:text-white transition"
                >
                  ← Back
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Results */}
            <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur border border-slate-700 mb-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Your Top Recommendations</h2>

              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={rec.name}
                    className="bg-slate-700/50 rounded-xl p-6 border-2 border-slate-600 hover:border-purple-500 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-purple-400">#{index + 1}</div>
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: sanitizeColor(rec.model.color) }}
                            />
                            {rec.name}
                          </h3>
                          <div className="text-sm text-slate-400 mt-1">
                            {rec.model.category} • {rec.model.parameters}B parameters
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-400">Match Score</div>
                        <div className="text-2xl font-bold text-green-400">{Math.round(rec.score)}</div>
                      </div>
                    </div>

                    {rec.reasons.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-slate-300 mb-2">Why this model:</div>
                        <ul className="space-y-1">
                          {rec.reasons.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-slate-600">
                      <div>
                        <div className="text-xs text-slate-400">Price</div>
                        <div className="font-semibold">
                          {rec.model.costPer1M === 0 ? 'Free' : `$${rec.model.costPer1M}/1M`}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Speed</div>
                        <div className="font-semibold">{rec.model.speedTokens} tok/s</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Quality</div>
                        <div className="font-semibold">{rec.model.quality}/10</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Context</div>
                        <div className="font-semibold">{rec.model.contextWindow}K</div>
                      </div>
                    </div>

                    <Link
                      href={`/compare?models=${rec.name}`}
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold text-sm"
                    >
                      Compare this model <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetQuiz}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition"
              >
                Start Over
              </button>
              <Link
                href={`/compare?models=${recommendations.map(r => r.name).join(',')}`}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold transition text-center"
              >
                Compare All Recommendations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationEngine;
