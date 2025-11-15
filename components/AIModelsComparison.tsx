'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Brain, Zap, DollarSign, TrendingUp, Filter, HardDrive, Cpu } from 'lucide-react';
import modelsData from '@/data/models.json';
import { AIModelsData, CustomTooltipProps, sanitizeColor } from '@/types';

const AIModelsComparison = () => {
  const [chartView, setChartView] = useState('performance');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4', 'Claude 3.5 Sonnet', 'DeepSeek-R1']);

  const models = modelsData.models;

  const filteredModels = selectedCategory === 'all' 
    ? models 
    : models.filter(m => m.category === selectedCategory);

  // Only show selected models in charts if any are selected
  const displayModels = selectedModels.length > 0 
    ? filteredModels.filter(m => selectedModels.includes(m.name))
    : filteredModels;

  const performanceData = displayModels.map(m => ({
    name: m.name,
    "MMLU Score": m.benchmarkMMLU,
    "HumanEval Score": m.benchmarkHumanEval,
    "Quality Rating": m.quality
  }));

  const costSpeedData = displayModels.map(m => ({
    name: m.name,
    cost: m.costPer1M,
    speed: m.speedTokens,
    parameters: m.parameters,
    fill: m.color
  }));

  const capabilitiesData = displayModels.slice(0, 6).map(m => ({
    model: m.name,
    "Performance": (m.benchmarkMMLU / 90) * 100,
    "Speed": (m.speedTokens / 120) * 100,
    "Context": (m.contextWindow / 2000) * 100,
    "Cost Efficiency": m.costPer1M === 0 ? 100 : (30 / m.costPer1M) * 100,
    "Code Quality": (m.benchmarkHumanEval / 97.3) * 100
  }));

  const parametersData = displayModels.map(m => ({
    name: m.name,
    parameters: m.parameters,
    fill: m.color
  }));

  const capabilityMetricsData = displayModels.map(m => ({
    name: m.name,
    "Cleverness": m.capabilities.cleverness,
    "Coding": m.capabilities.coding,
    "Reasoning": m.capabilities.reasoning,
    "Creative": m.capabilities.creative,
    "Factual": m.capabilities.factual,
    "Math": m.capabilities.math
  }));

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(n => n !== modelName)
        : [...prev, modelName]
    );
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl">
          <p className="font-bold text-white mb-2">{payload[0].payload.name || payload[0].name}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomScatterTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl">
          <p className="font-bold text-white mb-2">{data.name}</p>
          <p className="text-sm text-blue-400">Cost: ${data.cost}/1M tokens</p>
          <p className="text-sm text-green-400">Speed: {data.speed} tok/s</p>
          <p className="text-sm text-purple-400">Parameters: {data.parameters}B</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Models Comparison
          </h1>
          <p className="text-slate-300 text-lg">Compare leading language models across performance, cost, and capabilities</p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Filter className="w-4 h-4" />
            All Models
          </button>
          <button
            onClick={() => setSelectedCategory('Proprietary')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedCategory === 'Proprietary'
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Proprietary
          </button>
          <button
            onClick={() => setSelectedCategory('Open Source')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedCategory === 'Open Source'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Open Source
          </button>
        </div>

        {/* Chart View Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setChartView('performance')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              chartView === 'performance'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Benchmark Performance
          </button>
          <button
            onClick={() => setChartView('capabilities-detail')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              chartView === 'capabilities-detail'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Capability Breakdown
          </button>
          <button
            onClick={() => setChartView('costSpeed')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              chartView === 'costSpeed'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Cost vs Speed
          </button>
          <button
            onClick={() => setChartView('capabilities')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              chartView === 'capabilities'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Overall Capabilities
          </button>
          <button
            onClick={() => setChartView('parameters')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
              chartView === 'parameters'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Model Size
          </button>
        </div>

        {/* Model Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-center">Select Models to Compare</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {filteredModels.map((model) => (
              <button
                key={model.name}
                onClick={() => toggleModel(model.name)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  selectedModels.includes(model.name)
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: selectedModels.includes(model.name) ? sanitizeColor(model.color) : undefined
                }}
              >
                {model.name}
              </button>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedModels([])}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Clear Selection (Show All)
            </button>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-slate-800/50 rounded-xl p-8 mb-8 backdrop-blur border border-slate-700">
          {chartView === 'performance' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Benchmark Performance Comparison</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="MMLU Score" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="HumanEval Score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Quality Rating" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                MMLU: Massive Multitask Language Understanding | HumanEval: Code generation benchmark
              </p>
            </div>
          )}

          {chartView === 'capabilities-detail' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Detailed Capability Comparison</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={capabilityMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Score (0-100)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Cleverness" fill="#ec4899" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Coding" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Reasoning" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Creative" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Factual" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Math" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Cleverness: Problem-solving ability | Coding: Programming tasks | Reasoning: Logical thinking | Creative: Creative writing | Factual: Accuracy | Math: Mathematical reasoning
              </p>
            </div>
          )}

          {chartView === 'costSpeed' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Cost vs Speed Analysis</h2>
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    type="number" 
                    dataKey="cost" 
                    name="Cost" 
                    stroke="#94a3b8"
                    label={{ value: 'Cost per 1M tokens ($)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="speed" 
                    name="Speed" 
                    stroke="#94a3b8"
                    label={{ value: 'Speed (tokens/sec)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <ZAxis type="number" dataKey="parameters" range={[100, 1000]} name="Parameters" />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter data={costSpeedData} fill="#8884d8">
                    {costSpeedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sanitizeColor(entry.fill)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Bubble size represents model parameter count | Lower-left = Better value (low cost, high speed)
              </p>
            </div>
          )}

          {chartView === 'capabilities' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Overall Capabilities Radar (Top 6 Models)</h2>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={capabilitiesData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis dataKey="model" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {displayModels.slice(0, 6).map((model) => (
                    <Radar
                      key={model.name}
                      name={model.name}
                      dataKey="Performance"
                      stroke={model.color}
                      fill={model.color}
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                All metrics normalized to 0-100 scale for comparison
              </p>
            </div>
          )}

          {chartView === 'parameters' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Model Size (Parameters in Billions)</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={parametersData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Billions of Parameters', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="parameters" radius={[8, 8, 0, 0]}>
                    {parametersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sanitizeColor(entry.fill)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Larger models generally have more capabilities but require more compute resources
              </p>
            </div>
          )}
        </div>

        {/* Model Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {filteredModels.map((model) => (
            <div
              key={model.name}
              onClick={() => toggleModel(model.name)}
              className={`cursor-pointer transform transition-all duration-300 ${
                selectedModels.includes(model.name) ? 'scale-105 shadow-2xl' : 'hover:scale-102'
              }`}
            >
              <div 
                className={`rounded-xl p-6 border-2 ${
                  selectedModels.includes(model.name) ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: `${sanitizeColor(model.color)}20`, borderColor: selectedModels.includes(model.name) ? sanitizeColor(model.color) : 'transparent' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{model.name}</h3>
                    <p className="text-sm text-slate-300">{model.provider}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    model.category === 'Open Source' ? 'bg-green-500/20 text-green-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {model.category}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cleverness:</span>
                    <span className="font-semibold">{model.capabilities.cleverness}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Coding:</span>
                    <span className="font-semibold">{model.capabilities.coding}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Parameters:</span>
                    <span className="font-semibold">{model.parameters}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">MMLU Score:</span>
                    <span className="font-semibold">{model.benchmarkMMLU}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Speed:</span>
                    <span className="font-semibold">{model.speedTokens} tok/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Cost/1M:</span>
                    <span className="font-semibold">${model.costPer1M === 0 ? 'Free' : model.costPer1M}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Context:</span>
                    <span className="font-semibold">{model.contextWindow}K</span>
                  </div>
                </div>

                {/* Hardware Requirements for Open Source Models */}
                {model.hardwareRequired && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4 text-blue-400" />
                      <h4 className="text-xs font-bold text-blue-400">Hardware Required</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">GPU:</span>
                        <span className="text-slate-200">{model.hardwareRequired.recommendedGPU}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">VRAM:</span>
                        <span className="text-slate-200">{model.hardwareRequired.minVRAM}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RAM:</span>
                        <span className="text-slate-200">{model.hardwareRequired.minRAM}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Storage:</span>
                        <span className="text-slate-200">{model.hardwareRequired.storageSize}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-bold">Best Performance</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">DeepSeek-R1 leads with 90.8% MMLU and 97.3% HumanEval scores</p>
            <p className="text-xs text-slate-400">Open source powerhouse for reasoning and coding</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-bold">Fastest</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">GPT-3.5 Turbo at 120 tok/s, followed by Claude Sonnet at 85 tok/s</p>
            <p className="text-xs text-slate-400">Best for real-time applications and chatbots</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-bold">Best Value</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">Open source models (Llama, Mixtral, DeepSeek) offer zero API costs</p>
            <p className="text-xs text-slate-400">Can be self-hosted for unlimited usage</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <h3 className="text-lg font-bold">Largest Context</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">Gemini 1.5 Pro with 2 million token context window</p>
            <p className="text-xs text-slate-400">Process entire codebases or long documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelsComparison;