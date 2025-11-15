'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Info, Zap, Cpu, DollarSign } from 'lucide-react';
import vsData from '@/data/vsData.json';
import { HardwareComparisonData, CustomTooltipProps, sanitizeColor } from '@/types';

const HardwareComparison = () => {
  const [chartType, setChartType] = useState('bar');
  const [selectedHardware, setSelectedHardware] = useState<string[]>(['M3 Max', 'M2 Ultra', 'RTX 3090']);

  const allHardware = vsData.allHardware;
  const performanceData = vsData.performanceData;
  const specs = vsData.specs;

  const filteredPerformanceData = performanceData.map(model => {
    const filtered: any = { model: model.model };
    selectedHardware.forEach(hw => {
      filtered[hw] = model[hw as keyof typeof model];
    });
    return filtered;
  });

  const filteredSpecs = specs.filter(s => selectedHardware.includes(s.name));

  const toggleHardware = (hardwareId: string) => {
    setSelectedHardware(prev => 
      prev.includes(hardwareId) 
        ? prev.filter(h => h !== hardwareId)
        : [...prev, hardwareId]
    );
  };

  const getHardwareColor = (name: string) => {
    return allHardware.find(h => h.id === name)?.color || '#94a3b8';
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value} {chartType === 'bar' ? 'tok/s' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI Hardware Performance Comparison
        </h1>
        <p className="text-center text-slate-300 mb-8">Compare Mac Unified Memory, Consumer GPUs, and Data Center Hardware</p>

        {/* Hardware Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-center">Select Hardware to Compare</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {allHardware.map((hardware) => (
              <button
                key={hardware.id}
                onClick={() => toggleHardware(hardware.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  selectedHardware.includes(hardware.id)
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: selectedHardware.includes(hardware.id) ? sanitizeColor(hardware.color) : undefined
                }}
              >
                {hardware.name}
              </button>
            ))}
          </div>
          <div className="text-center">
            <button
              onClick={() => setSelectedHardware(['M3 Max', 'M2 Ultra', 'RTX 3090'])}
              className="text-sm text-slate-400 hover:text-white transition mr-4"
            >
              Reset to Default
            </button>
            <button
              onClick={() => setSelectedHardware(allHardware.map(h => h.id))}
              className="text-sm text-slate-400 hover:text-white transition"
            >
              Select All
            </button>
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setChartType('bar')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Performance Chart
          </button>
          <button
            onClick={() => setChartType('specs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              chartType === 'specs' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Hardware Specs
          </button>
        </div>

        {/* Main Chart Area */}
        <div className="bg-slate-800/50 rounded-xl p-8 mb-8 backdrop-blur">
          {chartType === 'bar' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Model Inference Speed (Tokens per Second)
              </h2>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={filteredPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="model" 
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis stroke="#94a3b8" label={{ value: 'Tokens/Second', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedHardware.map((hw) => (
                    <Bar 
                      key={hw}
                      dataKey={hw} 
                      fill={getHardwareColor(hw)} 
                      radius={[8, 8, 0, 0]} 
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <p className="text-center text-slate-400 text-sm mt-4">
                * Zero values indicate model cannot fit in device memory. DeepSeek-R1 comes in 14B, 32B, 70B, and 671B variants.
              </p>
            </div>
          )}

          {chartType === 'specs' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Hardware Specifications Comparison
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Memory (GB)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredSpecs} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="memory" radius={[0, 8, 8, 0]}>
                        {filteredSpecs.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={sanitizeColor(getHardwareColor(entry.name))} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Power Draw (Watts)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredSpecs} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="power" fill="#ef4444" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Memory Bandwidth (GB/s)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredSpecs} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="bandwidth" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-center">Price (USD)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredSpecs} layout="vertical" margin={{ left: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="price" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hardware Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-xl p-6 border border-slate-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-8 h-8 text-slate-400" />
              <h3 className="text-lg font-bold">Unified Memory</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">Mac systems with unified memory architecture</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Best for: 70B+ models, development</li>
              <li>• Pros: Large memory, low power, quiet</li>
              <li>• Cons: Slower on small models, expensive</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-green-400" />
              <h3 className="text-lg font-bold">Consumer GPUs</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">RTX 3090, 4090 - accessible high performance</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Best for: Small-medium models, speed</li>
              <li>• Pros: Fast, affordable, good availability</li>
              <li>• Cons: Limited VRAM (24GB max per card)</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <h3 className="text-lg font-bold">Data Center</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">A100, H100 - enterprise performance</p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li>• Best for: Production, large scale</li>
              <li>• Pros: Fastest speeds, reliable, 80GB VRAM</li>
              <li>• Cons: Very expensive ($10k-$30k)</li>
            </ul>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Speed Champion: H100</h3>
                <p className="text-slate-300 text-sm">
                  2-3x faster than consumer GPUs on all model sizes. Best for production inference and training.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Cpu className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Memory Champion: M2 Ultra</h3>
                <p className="text-slate-300 text-sm">
                  192GB unified memory runs models up to 671B parameters. Only consumer option for DeepSeek-R1 full size.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Best Value: RTX 3090</h3>
                <p className="text-slate-300 text-sm">
                  $650 for excellent performance on small models. Still competitive 3 years after release.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur">
            <div className="flex items-start gap-4">
              <div className="bg-orange-500/20 p-3 rounded-lg">
                <Info className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Sweet Spot: RTX 4090</h3>
                <p className="text-slate-300 text-sm">
                  35% faster than 3090, can handle up to 14B models. Great for enthusiasts and small studios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="font-bold mb-3">Choosing Your Hardware</h3>
          <div className="space-y-2 text-slate-300 text-sm">
            <p><strong className="text-white">For hobbyists & learning:</strong> RTX 3090 or 4090 - great for models up to 14B parameters.</p>
            <p><strong className="text-white">For professional development:</strong> M3 Max or M2 Ultra - run large models locally, test before deploying.</p>
            <p><strong className="text-white">For small studios:</strong> 2x RTX 4090 - balanced speed and memory (48GB) for medium models up to 34B.</p>
            <p><strong className="text-white">For production/enterprise:</strong> A100 or H100 - fastest inference, best for serving models at scale.</p>
            <p><strong className="text-white">For cutting-edge research:</strong> M2 Ultra 192GB - only consumer hardware that can run 671B models.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardwareComparison;