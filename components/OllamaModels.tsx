'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Filter, HardDrive, Cpu, Zap, Download, Database, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ollamaData from '@/data/ollamaModels.json';
import { OllamaModelsData, CustomTooltipProps, sanitizeColor } from '@/types';

const OllamaModels = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartView, setChartView] = useState('ram');
  const [selectedModels, setSelectedModels] = useState<string[]>(['Llama 3.1 8B', 'Mistral 7B', 'DeepSeek-R1 70B']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [maxRAM, setMaxRAM] = useState(200);
  const [maxParameters, setMaxParameters] = useState(1000);
  const [sortBy, setSortBy] = useState<'name' | 'ram' | 'parameters' | 'storage'>('name');

  const models = ollamaData.models;

  const categories = ['all', 'General', 'Coding', 'Vision', 'Reasoning', 'Multilingual', 'Uncensored', 'Tools'];

  // Apply all filters
  let filteredModels = models.filter(m => {
    // Category filter
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;

    // Search filter
    if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // RAM filter
    if (m.recommendedRAM > maxRAM) return false;

    // Parameters filter
    if (m.parameters > maxParameters) return false;

    return true;
  });

  // Apply sorting
  filteredModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'ram':
        return a.recommendedRAM - b.recommendedRAM;
      case 'parameters':
        return a.parameters - b.parameters;
      case 'storage':
        const aStorage = parseFloat(a.storageSize.replace('GB', ''));
        const bStorage = parseFloat(b.storageSize.replace('GB', ''));
        return aStorage - bStorage;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const displayModels = selectedModels.length > 0 
    ? filteredModels.filter(m => selectedModels.includes(m.name))
    : filteredModels;

  const ramData = displayModels.map(m => ({
    name: m.name,
    "Min RAM (GB)": m.minRAM,
    "Recommended RAM (GB)": m.recommendedRAM,
    fill: m.color
  }));

  const parameterData = displayModels.map(m => ({
    name: m.name,
    "Parameters (B)": m.parameters,
    fill: m.color
  }));

  const storageSizeData = displayModels.map(m => ({
    name: m.name,
    storage: parseFloat(m.storageSize.replace('GB', '')),
    parameters: m.parameters,
    ram: m.recommendedRAM,
    fill: m.color
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
          <p className="font-bold text-white mb-2">{payload[0].payload.name}</p>
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
          <p className="text-sm text-blue-400">Storage: {data.storage.toFixed(1)}GB</p>
          <p className="text-sm text-green-400">Parameters: {data.parameters}B</p>
          <p className="text-sm text-purple-400">RAM: {data.ram}GB</p>
        </div>
      );
    }
    return null;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'General': 'blue',
      'Coding': 'green',
      'Vision': 'pink',
      'Reasoning': 'orange',
      'Multilingual': 'purple',
      'Uncensored': 'red',
      'Tools': 'cyan'
    };
    return colors[category] || 'slate';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ollama Models Library
          </h1>
          <p className="text-slate-300 text-lg">Run powerful AI models locally with complete privacy and control</p>
          <p className="text-slate-400 text-sm mt-2">35+ popular models • Open source • No API costs</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="ollama-search" className="block text-sm font-semibold mb-2">
                Search Models
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                <input
                  id="ollama-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by model name..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label="Search Ollama models by name"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="md:w-48">
              <label htmlFor="sort-ollama" className="block text-sm font-semibold mb-2">
                Sort By
              </label>
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
                <select
                  id="sort-ollama"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none"
                  aria-label="Sort Ollama models by"
                >
                  <option value="name">Name</option>
                  <option value="ram">RAM (Low to High)</option>
                  <option value="parameters">Parameters (Low to High)</option>
                  <option value="storage">Storage (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="md:w-auto flex items-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                aria-expanded={showFilters}
                aria-controls="ollama-advanced-filters"
                aria-label="Toggle advanced filters"
              >
                <SlidersHorizontal className="w-5 h-5" aria-hidden="true" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div id="ollama-advanced-filters" className="mt-6 pt-6 border-t border-slate-600">
              <h3 className="text-lg font-bold mb-4">Advanced Filters</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* RAM Filter */}
                <div>
                  <label htmlFor="max-ram" className="block text-sm font-semibold mb-2">
                    Max RAM: {maxRAM === 200 ? 'Any' : `${maxRAM}GB`}
                  </label>
                  <input
                    id="max-ram"
                    type="range"
                    value={maxRAM}
                    onChange={(e) => setMaxRAM(Number(e.target.value))}
                    min="4"
                    max="200"
                    step="4"
                    className="w-full"
                    aria-label="Maximum RAM requirement"
                  />
                </div>

                {/* Parameters Filter */}
                <div>
                  <label htmlFor="max-params" className="block text-sm font-semibold mb-2">
                    Max Parameters: {maxParameters === 1000 ? 'Any' : `${maxParameters}B`}
                  </label>
                  <input
                    id="max-params"
                    type="range"
                    value={maxParameters}
                    onChange={(e) => setMaxParameters(Number(e.target.value))}
                    min="1"
                    max="1000"
                    step="10"
                    className="w-full"
                    aria-label="Maximum model parameters"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setMaxRAM(200);
                    setMaxParameters(1000);
                    setSearchQuery('');
                    setSortBy('name');
                  }}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-semibold transition"
                  aria-label="Reset all filters"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-center text-sm text-slate-400">
            Showing {filteredModels.length} of {models.length} models
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm ${
                selectedCategory === cat
                  ? `bg-${getCategoryColor(cat)}-600 text-white shadow-lg scale-105`
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {cat === 'all' ? 'All Models' : cat}
            </button>
          ))}
        </div>

        {/* Chart View Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setChartView('ram')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              chartView === 'ram'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            RAM Requirements
          </button>
          <button
            onClick={() => setChartView('parameters')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              chartView === 'parameters'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Cpu className="w-4 h-4" />
            Model Size
          </button>
          <button
            onClick={() => setChartView('storage')}
            className={`px-5 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
              chartView === 'storage'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Database className="w-4 h-4" />
            Storage vs Size
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
          {chartView === 'ram' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">RAM Requirements Comparison</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={ramData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'RAM (GB)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Min RAM (GB)" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Recommended RAM (GB)" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Minimum RAM may cause slow performance • Recommended RAM ensures smooth operation
              </p>
            </div>
          )}

          {chartView === 'parameters' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Model Size (Parameters)</h2>
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={parameterData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Billions of Parameters', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Parameters (B)" radius={[8, 8, 0, 0]}>
                    {parameterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sanitizeColor(entry.fill)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Larger models generally have better capabilities but require more resources
              </p>
            </div>
          )}

          {chartView === 'storage' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">Storage Size vs Model Parameters</h2>
              <ResponsiveContainer width="100%" height={450}>
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    type="number" 
                    dataKey="storage" 
                    name="Storage" 
                    stroke="#94a3b8"
                    label={{ value: 'Storage Size (GB)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="parameters" 
                    name="Parameters" 
                    stroke="#94a3b8"
                    label={{ value: 'Parameters (B)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <ZAxis type="number" dataKey="ram" range={[100, 1000]} name="RAM" />
                  <Tooltip content={<CustomScatterTooltip />} />
                  <Scatter data={storageSizeData} fill="#8884d8">
                    {storageSizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={sanitizeColor(entry.fill)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-slate-400 text-center mt-4">
                Bubble size represents RAM requirements • All sizes assume Q4_0 quantization
              </p>
            </div>
          )}
        </div>

        {/* Model Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                style={{
                  backgroundColor: `${sanitizeColor(model.color)}20`,
                  borderColor: selectedModels.includes(model.name) ? sanitizeColor(model.color) : 'transparent'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{model.name}</h3>
                    <p className="text-sm text-slate-300">{model.provider}</p>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getCategoryColor(model.category)}-500/20 text-${getCategoryColor(model.category)}-300`}
                  >
                    {model.category}
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-4">{model.description}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Parameters:</span>
                    <span className="font-semibold">{model.parameters}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Min RAM:</span>
                    <span className="font-semibold">{model.minRAM}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Recommended:</span>
                    <span className="font-semibold">{model.recommendedRAM}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">VRAM:</span>
                    <span className="font-semibold">{model.minVRAM}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Storage:</span>
                    <span className="font-semibold">{model.storageSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Context:</span>
                    <span className="font-semibold">{model.contextWindow}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Quantization:</span>
                    <span className="font-semibold">{model.quantization}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-400 mb-2">Use Case:</p>
                  <p className="text-sm text-slate-200">{model.useCase}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {model.features.map((feature, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-700/50 rounded text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-bold">Free & Open</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">All models free to download and use</p>
            <p className="text-xs text-slate-400">No API costs, no rate limits, complete ownership</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-blue-400" />
              <h3 className="text-lg font-bold">Local & Fast</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">Run entirely on your hardware</p>
            <p className="text-xs text-slate-400">No internet required, instant responses, zero latency</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <HardDrive className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-bold">Flexible Sizes</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">1B to 671B parameter models</p>
            <p className="text-xs text-slate-400">From mobile devices to workstations</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-8 h-8 text-orange-400" />
              <h3 className="text-lg font-bold">Privacy First</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">Your data never leaves your machine</p>
            <p className="text-xs text-slate-400">Complete privacy and control over your AI</p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-bold text-xl mb-4">Getting Started with Ollama</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Installation</h4>
              <div className="bg-slate-900/50 rounded p-4 text-sm font-mono">
                <p className="text-green-400"># macOS / Linux</p>
                <p className="text-slate-300">curl -fsSL https://ollama.com/install.sh | sh</p>
                <p className="text-green-400 mt-2"># Windows</p>
                <p className="text-slate-300">Download from ollama.com</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Start</h4>
              <div className="bg-slate-900/50 rounded p-4 text-sm font-mono">
                <p className="text-green-400"># Pull a model</p>
                <p className="text-slate-300">ollama pull llama3.1:8b</p>
                <p className="text-green-400 mt-2"># Run the model</p>
                <p className="text-slate-300">ollama run llama3.1:8b</p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-slate-300 text-sm">
            <p><strong className="text-white">For beginners:</strong> Start with 7B-8B models like Mistral 7B or Llama 3.1 8B</p>
            <p><strong className="text-white">For coding:</strong> Try CodeLlama 13B or DeepSeek Coder 6.7B</p>
            <p><strong className="text-white">For limited hardware:</strong> Use 1B-3B models like Phi-3 Mini or Gemma 2 2B</p>
            <p><strong className="text-white">For maximum performance:</strong> 70B+ models require 64GB+ RAM and powerful GPUs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OllamaModels;