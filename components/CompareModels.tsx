'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Minus, ArrowRight, Share2, Save, Bookmark, Copy, CheckCircle } from 'lucide-react';
import modelsData from '@/data/models.json';
import { sanitizeColor } from '@/types';
import { useSearchParams, useRouter } from 'next/navigation';

const CompareModels = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4', 'Claude 3.5 Sonnet']);
  const [savedComparisons, setSavedComparisons] = useState<Array<{name: string, models: string[]}>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Load from URL params on mount
  useEffect(() => {
    const modelsParam = searchParams.get('models');
    if (modelsParam) {
      const modelNames = modelsParam.split(',').filter(name =>
        modelsData.models.some(m => m.name === name)
      );
      if (modelNames.length > 0) {
        setSelectedModels(modelNames.slice(0, 4)); // Max 4 models
      }
    }

    // Load saved comparisons from localStorage
    const saved = localStorage.getItem('savedComparisons');
    if (saved) {
      setSavedComparisons(JSON.parse(saved));
    }
  }, [searchParams]);

  // Update URL when models change
  useEffect(() => {
    if (selectedModels.length > 0) {
      const params = new URLSearchParams();
      params.set('models', selectedModels.join(','));
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    }
  }, [selectedModels, router]);

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      if (prev.includes(modelName)) {
        return prev.filter(n => n !== modelName);
      } else if (prev.length < 4) {
        return [...prev, modelName];
      }
      return prev;
    });
  };

  const shareComparison = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const saveComparison = () => {
    if (!saveName.trim()) return;

    const newComparison = {
      name: saveName,
      models: selectedModels,
      date: new Date().toISOString()
    };

    const updated = [...savedComparisons, newComparison];
    setSavedComparisons(updated);
    localStorage.setItem('savedComparisons', JSON.stringify(updated));

    setSaveName('');
    setShowSaveDialog(false);
  };

  const loadComparison = (models: string[]) => {
    setSelectedModels(models);
  };

  const deleteComparison = (index: number) => {
    const updated = savedComparisons.filter((_, i) => i !== index);
    setSavedComparisons(updated);
    localStorage.setItem('savedComparisons', JSON.stringify(updated));
  };

  const comparisonModels = modelsData.models.filter(m => selectedModels.includes(m.name));

  const getBestValue = (field: 'costPer1M' | 'benchmarkMMLU' | 'benchmarkHumanEval' | 'speedTokens' | 'contextWindow', reverse = false) => {
    if (comparisonModels.length === 0) return null;
    const values = comparisonModels.map(m => m[field]);
    return reverse ? Math.min(...values) : Math.max(...values);
  };

  const isHighlighted = (value: number, best: number | null) => {
    return best !== null && value === best;
  };

  const renderValue = (value: number | string | boolean, isBest: boolean = false) => {
    const className = isBest ? 'font-bold text-green-400' : 'text-slate-300';

    if (typeof value === 'boolean') {
      return value ? <Check className={`w-5 h-5 ${isBest ? 'text-green-400' : 'text-green-500'}`} /> : <X className="w-5 h-5 text-red-500" />;
    }

    return <span className={className}>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Side-by-Side Comparison
          </h1>
          <p className="text-slate-300 text-lg">Compare up to 4 AI models in detail</p>
        </div>

        {/* Share & Save Actions */}
        {selectedModels.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={shareComparison}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition flex items-center gap-2"
            >
              {copySuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5" />
                  Share Comparison
                </>
              )}
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Comparison
            </button>
          </div>
        )}

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
              <h3 className="text-xl font-bold mb-4">Save Comparison</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter a name for this comparison..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={saveComparison}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold transition"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Comparisons */}
        {savedComparisons.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-yellow-400" />
              My Saved Comparisons
            </h2>
            <div className="grid md:grid-cols-2 gap-3">
              {savedComparisons.map((comp, index) => (
                <div
                  key={index}
                  className="bg-slate-700/50 rounded-lg p-4 flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{comp.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {comp.models.join(', ')}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadComparison(comp.models)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-semibold transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteComparison(index)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm font-semibold transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Select Models to Compare (Max 4)</h2>
          <div className="flex flex-wrap gap-3">
            {modelsData.models.map((model) => (
              <button
                key={model.name}
                onClick={() => toggleModel(model.name)}
                disabled={!selectedModels.includes(model.name) && selectedModels.length >= 4}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  selectedModels.includes(model.name)
                    ? 'text-white shadow-lg scale-105'
                    : selectedModels.length >= 4
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: selectedModels.includes(model.name) ? sanitizeColor(model.color) : undefined
                }}
                aria-pressed={selectedModels.includes(model.name)}
              >
                {model.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-400 mt-4">
            {selectedModels.length}/4 models selected
          </p>
        </div>

        {/* Comparison Table */}
        {comparisonModels.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur border border-slate-700 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-600">
                  <th className="pb-4 pr-4 font-bold text-lg sticky left-0 bg-slate-800/50">Feature</th>
                  {comparisonModels.map((model) => (
                    <th key={model.name} className="pb-4 px-4 font-bold text-lg min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: sanitizeColor(model.color) }}
                          aria-hidden="true"
                        />
                        {model.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Category */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50">Category</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      <span className={`px-2 py-1 rounded text-xs ${
                        model.category === 'Proprietary' ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {model.category}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Pricing */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30">Cost per 1M Tokens</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4">
                      {renderValue(
                        model.costPer1M === 0 ? 'Free' : `$${model.costPer1M.toFixed(2)}`,
                        isHighlighted(model.costPer1M, getBestValue('costPer1M', true))
                      )}
                    </td>
                  ))}
                </tr>

                {/* MMLU Score */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50">MMLU Score</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4">
                      {renderValue(
                        model.benchmarkMMLU,
                        isHighlighted(model.benchmarkMMLU, getBestValue('benchmarkMMLU'))
                      )}
                    </td>
                  ))}
                </tr>

                {/* HumanEval Score */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30">HumanEval Score</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4">
                      {renderValue(
                        model.benchmarkHumanEval,
                        isHighlighted(model.benchmarkHumanEval, getBestValue('benchmarkHumanEval'))
                      )}
                    </td>
                  ))}
                </tr>

                {/* Speed */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50">Speed (tokens/sec)</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4">
                      {renderValue(
                        model.speedTokens,
                        isHighlighted(model.speedTokens, getBestValue('speedTokens'))
                      )}
                    </td>
                  ))}
                </tr>

                {/* Context Window */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30">Context Window (K)</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4">
                      {renderValue(
                        `${model.contextWindow}K`,
                        isHighlighted(model.contextWindow, getBestValue('contextWindow'))
                      )}
                    </td>
                  ))}
                </tr>

                {/* Parameters */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50">Parameters (B)</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.parameters}B
                    </td>
                  ))}
                </tr>

                {/* Quality Rating */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30">Quality Rating</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.quality}/10
                    </td>
                  ))}
                </tr>

                {/* Capabilities Header */}
                <tr className="bg-blue-500/10">
                  <td colSpan={comparisonModels.length + 1} className="py-3 pr-4 font-bold text-blue-400 text-center">
                    Capabilities (Out of 10)
                  </td>
                </tr>

                {/* Cleverness */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50 pl-6">Cleverness</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.cleverness}/10
                    </td>
                  ))}
                </tr>

                {/* Coding */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30 pl-6">Coding</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.coding}/10
                    </td>
                  ))}
                </tr>

                {/* Reasoning */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50 pl-6">Reasoning</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.reasoning}/10
                    </td>
                  ))}
                </tr>

                {/* Creative */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30 pl-6">Creative</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.creative}/10
                    </td>
                  ))}
                </tr>

                {/* Factual */}
                <tr className="border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-800/50 pl-6">Factual</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.factual}/10
                    </td>
                  ))}
                </tr>

                {/* Math */}
                <tr className="bg-slate-700/30 border-b border-slate-700">
                  <td className="py-3 pr-4 font-semibold sticky left-0 bg-slate-700/30 pl-6">Math</td>
                  {comparisonModels.map((model) => (
                    <td key={model.name} className="py-3 px-4 text-slate-300">
                      {model.capabilities.math}/10
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-slate-300">
                <span className="text-green-400 font-bold">Green values</span> indicate the best performance in that category among selected models.
              </p>
            </div>
          </div>
        )}

        {comparisonModels.length === 0 && (
          <div className="bg-slate-800/50 rounded-xl p-12 text-center backdrop-blur border border-slate-700">
            <ArrowRight className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-xl text-slate-400">Select at least one model above to start comparing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareModels;
