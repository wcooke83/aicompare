'use client';

import React, { useState } from 'react';
import { Check, X, Minus, ArrowRight } from 'lucide-react';
import modelsData from '@/data/models.json';
import { sanitizeColor } from '@/types';

const CompareModels = () => {
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4', 'Claude 3.5 Sonnet']);

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
