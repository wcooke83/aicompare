'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calculator, TrendingUp, Zap, DollarSign, Info, Server, Cloud, HelpCircle, Globe } from 'lucide-react';
import modelsData from '@/data/models.json';
import costData from '@/data/costCalculator.json';
import { CustomTooltipProps } from '@/types';
import LiveRegion from './LiveRegion';
import { formatCurrency, formatSmallCurrency, getCurrency, Currency } from '@/lib/currencyUtils';

interface CostBreakdown {
  model: string;
  monthlyCost: number;
  yearlyCost: number;
  costPerRequest: number;
}

const CostCalculator = () => {
  const [selectedPreset, setSelectedPreset] = useState('startup');
  const [tokensPerDay, setTokensPerDay] = useState(500000);
  const [requestsPerDay, setRequestsPerDay] = useState(500);
  const [selectedModels, setSelectedModels] = useState<string[]>(['GPT-4', 'Claude 3.5 Sonnet', 'Llama 3.1 70B']);
  const [showSelfHosting, setShowSelfHosting] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [announcement, setAnnouncement] = useState('');

  const preset = costData.usagePresets.find(p => p.id === selectedPreset);
  const currency = getCurrency(selectedCurrency, costData.currencies as Record<string, Currency>);

  useEffect(() => {
    if (preset && preset.id !== 'custom') {
      setTokensPerDay(preset.tokensPerDay);
      setRequestsPerDay(preset.requestsPerDay);
    }
  }, [selectedPreset]);

  const calculateCosts = (): CostBreakdown[] => {
    const models = modelsData.models.filter(m => selectedModels.includes(m.name));

    return models.map(model => {
      const tokensPerMonth = tokensPerDay * 30;
      const tokensInMillions = tokensPerMonth / 1_000_000;
      const monthlyCost = model.costPer1M * tokensInMillions;
      const yearlyCost = monthlyCost * 12;
      const costPerRequest = monthlyCost / (requestsPerDay * 30);

      return {
        model: model.name,
        monthlyCost: Math.round(monthlyCost * 100) / 100,
        yearlyCost: Math.round(yearlyCost * 100) / 100,
        costPerRequest: Math.round(costPerRequest * 10000) / 10000
      };
    });
  };

  const costs = calculateCosts();

  const calculateSelfHostingCost = (hardware: any) => {
    // Check if it's a cloud instance
    const isCloud = hardware.isCloud || false;

    if (isCloud) {
      // Cloud instances have direct monthly costs
      const monthlyCost = hardware.monthlyCloudCost || 0;
      return {
        name: hardware.name,
        upfront: 0,
        monthly: monthlyCost,
        yearly: Math.round(monthlyCost * 12 * 100) / 100,
        tokensPerSecond: hardware.tokensPerSecond,
        isCloud: true
      };
    }

    // Traditional hardware calculation
    const monthlyPowerCost = (hardware.monthlyPower * costData.selfHostingCosts.operationalCosts.powerCostPerKwh);
    const monthlyDepreciation = hardware.upfrontCost / (costData.selfHostingCosts.operationalCosts.depreciationYears * 12);
    const totalMonthlyCost = monthlyPowerCost +
                            monthlyDepreciation +
                            costData.selfHostingCosts.operationalCosts.maintenanceMonthly +
                            costData.selfHostingCosts.operationalCosts.internetMonthly;

    return {
      name: hardware.name,
      upfront: hardware.upfrontCost,
      monthly: Math.round(totalMonthlyCost * 100) / 100,
      yearly: Math.round(totalMonthlyCost * 12 * 100) / 100,
      tokensPerSecond: hardware.tokensPerSecond,
      isCloud: false
    };
  };

  const selfHostingCosts = costData.selfHostingCosts.hardware.map(calculateSelfHostingCost);

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => {
      const isSelected = prev.includes(modelName);
      const newSelection = isSelected
        ? prev.filter(n => n !== modelName)
        : [...prev, modelName];

      setAnnouncement(
        isSelected
          ? `${modelName} removed from cost comparison`
          : `${modelName} added to cost comparison`
      );

      return newSelection;
    });
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = costData.usagePresets.find(p => p.id === presetId);
    setAnnouncement(`Switched to ${preset?.name} preset`);
  };

  const monthlyChartData = costs.map(c => ({
    name: c.model,
    'Monthly Cost': c.monthlyCost,
    fill: modelsData.models.find(m => m.name === c.model)?.color || '#3b82f6'
  }));

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 shadow-xl">
          <p className="font-bold text-white mb-2">{payload[0].payload.name}</p>
          {payload.map((entry, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(typeof entry.value === 'number' ? entry.value : 0, currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const Tooltip2 = ({ content }: { content: string }) => (
    <div className="group relative inline-block">
      <HelpCircle className="w-4 h-4 text-slate-400 hover:text-blue-400 cursor-help" aria-label="Help" />
      <div className="invisible group-hover:visible absolute z-10 w-64 p-3 bg-slate-700 text-white text-sm rounded-lg shadow-lg -top-2 left-6">
        {content}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
      <LiveRegion message={announcement} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-12 h-12 text-green-400" aria-hidden="true" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Cost Calculator
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Estimate your monthly costs across different AI models</p>
        </div>

        {/* Usage Presets & Currency */}
        <div className="grid lg:grid-cols-4 gap-8 mb-8">
          {/* Usage Presets */}
          <div className="lg:col-span-3 bg-slate-800/50 rounded-xl p-6 backdrop-blur border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" aria-hidden="true" />
              Usage Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" role="group" aria-label="Select usage preset">
              {costData.usagePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id)}
                  className={`p-4 rounded-lg text-left transition-all border-2 ${
                    selectedPreset === preset.id
                      ? 'bg-blue-600 border-blue-400 shadow-lg scale-105'
                      : 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                  }`}
                  aria-pressed={selectedPreset === preset.id}
                  aria-label={`${preset.name}: ${preset.description}`}
                >
                  <div className="font-bold mb-1">{preset.name}</div>
                  <div className="text-xs text-slate-300 mb-2">{preset.description}</div>
                  {preset.id !== 'custom' && (
                    <div className="text-xs text-slate-400">
                      {(preset.tokensPerDay / 1000).toLocaleString()}K tokens/day
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector */}
          <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-400" aria-hidden="true" />
              Currency
            </h2>
            <label htmlFor="currency-select" className="block text-sm font-semibold mb-2">
              Display Currency
            </label>
            <select
              id="currency-select"
              value={selectedCurrency}
              onChange={(e) => {
                setSelectedCurrency(e.target.value);
                const newCurrency = costData.currencies[e.target.value as keyof typeof costData.currencies];
                setAnnouncement(`Currency changed to ${newCurrency.name}`);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
              aria-label="Select display currency"
            >
              {Object.keys(costData.currencies).map((code) => {
                const curr = costData.currencies[code as keyof typeof costData.currencies];
                return (
                  <option key={code} value={code}>
                    {curr.name} ({curr.symbol})
                  </option>
                );
              })}
            </select>
            <p className="text-xs text-slate-400 mt-2">
              All costs calculated from USD
            </p>
          </div>
        </div>

        {/* Custom Input */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" aria-hidden="true" />
            Usage Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tokens-per-day" className="block text-sm font-semibold mb-2 flex items-center gap-2">
                Tokens per Day
                <Tooltip2 content="Average number of tokens processed daily. 1 token ≈ 4 characters or 0.75 words." />
              </label>
              <input
                id="tokens-per-day"
                type="number"
                value={tokensPerDay}
                onChange={(e) => {
                  setTokensPerDay(Number(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="0"
                step="1000"
                aria-describedby="tokens-help"
              />
              <p id="tokens-help" className="text-xs text-slate-400 mt-1">
                Monthly: {(tokensPerDay * 30).toLocaleString()} tokens
              </p>
            </div>

            <div>
              <label htmlFor="requests-per-day" className="block text-sm font-semibold mb-2 flex items-center gap-2">
                Requests per Day
                <Tooltip2 content="Number of API calls or prompts sent daily." />
              </label>
              <input
                id="requests-per-day"
                type="number"
                value={requestsPerDay}
                onChange={(e) => {
                  setRequestsPerDay(Number(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                min="0"
                step="10"
                aria-describedby="requests-help"
              />
              <p id="requests-help" className="text-xs text-slate-400 mt-1">
                Monthly: {(requestsPerDay * 30).toLocaleString()} requests
              </p>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <h2 className="text-xl font-bold mb-4">Select Models to Compare</h2>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Select AI models for cost comparison">
            {modelsData.models.slice(0, 10).map((model) => (
              <button
                key={model.name}
                onClick={() => toggleModel(model.name)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                  selectedModels.includes(model.name)
                    ? 'text-white shadow-lg scale-105'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor: selectedModels.includes(model.name) ? model.color : undefined
                }}
                aria-pressed={selectedModels.includes(model.name)}
                aria-label={`${selectedModels.includes(model.name) ? 'Remove' : 'Add'} ${model.name} ${selectedModels.includes(model.name) ? 'from' : 'to'} comparison`}
              >
                {model.name}
                {model.costPer1M === 0 && <span className="ml-2 text-xs">(Free)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Results */}
        {costs.length > 0 && (
          <>
            {/* Chart */}
            <div className="bg-slate-800/50 rounded-xl p-8 mb-8 backdrop-blur border border-slate-700" role="region" aria-label="Monthly cost comparison chart">
              <h2 className="text-2xl font-bold mb-6 text-center">Monthly Cost Comparison</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: `Cost (${currency.code})`, angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Monthly Cost" radius={[8, 8, 0, 0]}>
                    {monthlyChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Table */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" aria-hidden="true" />
                Detailed Cost Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left" role="table" aria-label="Detailed cost breakdown table">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="pb-3 font-semibold">Model</th>
                      <th className="pb-3 font-semibold text-right">Monthly Cost</th>
                      <th className="pb-3 font-semibold text-right">Yearly Cost</th>
                      <th className="pb-3 font-semibold text-right">Cost per Request</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.map((cost, index) => (
                      <tr key={cost.model} className={`border-b border-slate-700 ${index % 2 === 0 ? 'bg-slate-700/30' : ''}`}>
                        <td className="py-3 font-medium">{cost.model}</td>
                        <td className="py-3 text-right text-green-400 font-bold">
                          {formatCurrency(cost.monthlyCost, currency)}
                        </td>
                        <td className="py-3 text-right text-blue-400">
                          {formatCurrency(cost.yearlyCost, currency)}
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {formatSmallCurrency(cost.costPerRequest, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Self-Hosting Toggle */}
        <div className="bg-slate-800/50 rounded-xl p-6 mb-8 backdrop-blur border border-slate-700">
          <button
            onClick={() => setShowSelfHosting(!showSelfHosting)}
            className="w-full flex items-center justify-between text-left"
            aria-expanded={showSelfHosting}
            aria-controls="self-hosting-section"
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" aria-hidden="true" />
              Self-Hosting Cost Comparison
            </h2>
            <span className="text-2xl">{showSelfHosting ? '−' : '+'}</span>
          </button>

          {showSelfHosting && (
            <div id="self-hosting-section" className="mt-6">
              <p className="text-slate-300 mb-4">
                Compare API costs with self-hosting open-source models on your own hardware.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm" role="table" aria-label="Self-hosting cost comparison">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="pb-3 font-semibold">Hardware</th>
                      <th className="pb-3 font-semibold text-right">Upfront Cost</th>
                      <th className="pb-3 font-semibold text-right">Monthly Cost</th>
                      <th className="pb-3 font-semibold text-right">Yearly Cost</th>
                      <th className="pb-3 font-semibold text-right">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selfHostingCosts.map((hardware, index) => (
                      <tr key={hardware.name} className={`border-b border-slate-700 ${index % 2 === 0 ? 'bg-slate-700/30' : ''}`}>
                        <td className="py-3 font-medium">
                          {hardware.name}
                          {hardware.isCloud && (
                            <span className="ml-2 text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded">Cloud</span>
                          )}
                        </td>
                        <td className="py-3 text-right text-orange-400">
                          {hardware.upfront === 0 ? 'N/A' : formatCurrency(hardware.upfront, currency)}
                        </td>
                        <td className="py-3 text-right text-green-400">
                          {formatCurrency(hardware.monthly, currency)}
                        </td>
                        <td className="py-3 text-right text-blue-400">
                          {formatCurrency(hardware.yearly, currency)}
                        </td>
                        <td className="py-3 text-right text-slate-300">
                          {hardware.tokensPerSecond} tok/s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" aria-hidden="true" />
                  ROI Analysis
                </h3>
                <p className="text-sm text-slate-300">
                  Self-hosting becomes cost-effective when your monthly API costs exceed the monthly operational cost of hardware.
                  Factor in maintenance, DevOps time, and reliability requirements when making your decision.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costData.tips.map((tip, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-400">
                <Info className="w-4 h-4" aria-hidden="true" />
                {tip.title}
              </h3>
              <p className="text-sm text-slate-300">{tip.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
