'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { CloudGPUData, CloudGPUInstance, CloudGPUProvider, CustomTooltipProps } from '@/types';
import cloudGPUData from '@/data/cloudGPUs.json';
import { Download } from 'lucide-react';

export default function CloudGPUComparison() {
  const data = cloudGPUData as CloudGPUData;

  const [chartView, setChartView] = useState<'price' | 'performance' | 'value' | 'bestvalue' | 'specs' | 'providers'>('price');
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedGPUs, setSelectedGPUs] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 100,
    minVRAM: 0,
    maxVRAM: 1000,
    gpuType: 'all' as 'all' | 'Entry' | 'Mid-Range' | 'Professional' | 'High-End' | 'Cutting-Edge',
    pricingModel: 'all' as 'all' | 'onDemand' | 'spot',
    showSpotPricing: true,
  });
  const [sortBy, setSortBy] = useState<'price' | 'performance' | 'vram' | 'name' | 'value'>('price');
  const [compareInstances, setCompareInstances] = useState<string[]>([]);

  // Get all instances from all providers
  const allInstances: (CloudGPUInstance & { providerName: string; providerColor: string })[] = useMemo(() => {
    return data.providers.flatMap((provider) =>
      provider.instances.map((instance) => ({
        ...instance,
        providerName: provider.name,
        providerColor: provider.color,
      }))
    );
  }, [data.providers]);

  // Get unique GPU types
  const uniqueGPUTypes = useMemo(() => {
    return Array.from(new Set(allInstances.map((i) => i.gpu))).sort();
  }, [allInstances]);

  // GPU tier mapping
  const getGPUTier = (gpu: string): string => {
    for (const tier of data.comparisonMetrics.gpuTiers) {
      if (tier.gpus.some((g) => gpu.includes(g))) {
        return tier.tier;
      }
    }
    return 'Mid-Range';
  };

  // Calculate value score (performance per dollar per hour)
  const calculateValueScore = (instance: CloudGPUInstance): number => {
    const price = filters.showSpotPricing && instance.spotPrice !== null
      ? instance.spotPrice
      : instance.onDemandPrice;
    if (price === 0) return 0;
    // Value = performance score / hourly price * 10 (scaled for readability)
    return (instance.performanceScore / price) * 10;
  };

  // Filter instances
  const filteredInstances = useMemo(() => {
    return allInstances.filter((instance) => {
      // Provider filter
      if (selectedProviders.length > 0 && !selectedProviders.includes(instance.providerName)) {
        return false;
      }

      // GPU selection filter
      if (selectedGPUs.length > 0 && !selectedGPUs.includes(instance.gpu)) {
        return false;
      }

      // Price filter (use spot price if available and showing spot pricing)
      const price = filters.showSpotPricing && instance.spotPrice !== null
        ? instance.spotPrice
        : instance.onDemandPrice;
      if (price < filters.minPrice || price > filters.maxPrice) {
        return false;
      }

      // VRAM filter
      if (instance.vram < filters.minVRAM || instance.vram > filters.maxVRAM) {
        return false;
      }

      // GPU type filter
      if (filters.gpuType !== 'all') {
        const tier = getGPUTier(instance.gpu);
        if (tier !== filters.gpuType) {
          return false;
        }
      }

      // Pricing model filter
      if (filters.pricingModel === 'spot' && instance.spotPrice === null) {
        return false;
      }

      return true;
    });
  }, [allInstances, selectedProviders, selectedGPUs, filters]);

  // Sort instances
  const sortedInstances = useMemo(() => {
    return [...filteredInstances].sort((a, b) => {
      const priceA = filters.showSpotPricing && a.spotPrice !== null ? a.spotPrice : a.onDemandPrice;
      const priceB = filters.showSpotPricing && b.spotPrice !== null ? b.spotPrice : b.onDemandPrice;

      switch (sortBy) {
        case 'price':
          return priceA - priceB;
        case 'performance':
          return b.performanceScore - a.performanceScore;
        case 'vram':
          return b.vram - a.vram;
        case 'value':
          return calculateValueScore(b) - calculateValueScore(a);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [filteredInstances, sortBy, filters.showSpotPricing]);

  // Chart data
  const priceComparisonData = useMemo(() => {
    return sortedInstances.slice(0, 15).map((instance) => ({
      name: `${instance.providerName} ${instance.name}`,
      'On-Demand': instance.onDemandPrice,
      'Spot': instance.spotPrice || 0,
      color: instance.providerColor,
      fullData: instance,
    }));
  }, [sortedInstances]);

  const performanceData = useMemo(() => {
    return sortedInstances.slice(0, 15).map((instance) => ({
      name: `${instance.providerName} ${instance.name}`,
      Performance: instance.performanceScore,
      color: instance.providerColor,
      fullData: instance,
    }));
  }, [sortedInstances]);

  const valueData = useMemo(() => {
    return sortedInstances
      .slice(0, 20)
      .map((instance) => {
        const price = filters.showSpotPricing && instance.spotPrice !== null
          ? instance.spotPrice
          : instance.onDemandPrice;
        return {
          name: `${instance.providerName} ${instance.name}`,
          price: price,
          performance: instance.performanceScore,
          vram: instance.vram,
          color: instance.providerColor,
          fullData: instance,
        };
      });
  }, [sortedInstances, filters.showSpotPricing]);

  const providerSummaryData = useMemo(() => {
    const providerStats = data.providers.map((provider) => {
      const instances = provider.instances;
      const avgOnDemand = instances.reduce((sum, i) => sum + i.onDemandPrice, 0) / instances.length;
      const avgPerformance = instances.reduce((sum, i) => sum + i.performanceScore, 0) / instances.length;
      const totalInstances = instances.length;
      const avgRegions = instances.reduce((sum, i) => sum + i.regions, 0) / instances.length;

      return {
        provider: provider.name,
        'Avg Price': parseFloat(avgOnDemand.toFixed(2)),
        'Avg Performance': parseFloat(avgPerformance.toFixed(1)),
        'Instance Count': totalInstances,
        'Avg Regions': parseFloat(avgRegions.toFixed(1)),
        color: provider.color,
      };
    });

    return providerStats;
  }, [data.providers]);

  const specsRadarData = useMemo(() => {
    if (sortedInstances.length === 0) return [];

    // Normalize specs to 0-100 scale
    const maxVRAM = Math.max(...sortedInstances.map((i) => i.vram));
    const maxRAM = Math.max(...sortedInstances.map((i) => i.ram));
    const maxVCPUs = Math.max(...sortedInstances.map((i) => i.vcpus));
    const maxPrice = Math.max(...sortedInstances.map((i) => i.onDemandPrice));

    return sortedInstances.slice(0, 5).map((instance) => ({
      instance: `${instance.providerName} ${instance.name}`,
      VRAM: (instance.vram / maxVRAM) * 100,
      RAM: (instance.ram / maxRAM) * 100,
      vCPUs: (instance.vcpus / maxVCPUs) * 100,
      Performance: instance.performanceScore,
      'Value (Inverse Price)': 100 - (instance.onDemandPrice / maxPrice) * 100,
      color: instance.providerColor,
    }));
  }, [sortedInstances]);

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) =>
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
    );
  };

  const toggleGPU = (gpu: string) => {
    setSelectedGPUs((prev) =>
      prev.includes(gpu) ? prev.filter((g) => g !== gpu) : [...prev, gpu]
    );
  };

  // Best Value data
  const bestValueData = useMemo(() => {
    return sortedInstances.slice(0, 15).map((instance) => ({
      name: `${instance.providerName} ${instance.name}`,
      'Value Score': parseFloat(calculateValueScore(instance).toFixed(1)),
      color: instance.providerColor,
      fullData: instance,
    }));
  }, [sortedInstances, filters.showSpotPricing]);

  const toggleCompare = (instanceName: string) => {
    setCompareInstances((prev) => {
      if (prev.includes(instanceName)) {
        return prev.filter((n) => n !== instanceName);
      } else if (prev.length < 4) {
        return [...prev, instanceName];
      }
      return prev;
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Provider',
      'Instance',
      'GPU',
      'GPU Count',
      'VRAM (GB)',
      'RAM (GB)',
      'vCPUs',
      'Storage',
      'On-Demand ($/hr)',
      'Spot ($/hr)',
      'Performance Score',
      'Value Score',
      'Regions',
      'Best For'
    ];

    const rows = sortedInstances.map((instance) => [
      instance.providerName,
      instance.name,
      instance.gpu,
      instance.gpuCount,
      instance.vram,
      instance.ram,
      instance.vcpus,
      instance.storage,
      instance.onDemandPrice,
      instance.spotPrice || 'N/A',
      instance.performanceScore,
      calculateValueScore(instance).toFixed(1),
      instance.regions,
      instance.bestFor.join('; ')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) =>
          typeof cell === 'string' && cell.includes(',')
            ? `"${cell}"`
            : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `cloud-gpu-comparison-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      const instance = data.fullData as (CloudGPUInstance & { providerName: string }) | undefined;

      if (instance) {
        const displayPrice = filters.showSpotPricing && instance.spotPrice !== null
          ? instance.spotPrice
          : instance.onDemandPrice;

        return (
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 shadow-xl">
            <p className="font-bold text-white mb-2">{instance.providerName} {instance.name}</p>
            <p className="text-slate-300">GPU: {instance.gpuCount}x {instance.gpu}</p>
            <p className="text-slate-300">VRAM: {instance.vram} GB</p>
            <p className="text-slate-300">RAM: {instance.ram} GB</p>
            <p className="text-slate-300">vCPUs: {instance.vcpus}</p>
            <p className="text-green-400 font-semibold mt-2">
              {filters.showSpotPricing && instance.spotPrice !== null ? 'Spot: ' : 'On-Demand: '}
              ${displayPrice.toFixed(2)}/hr
            </p>
            {instance.spotPrice !== null && (
              <p className="text-yellow-400 text-sm">
                On-Demand: ${instance.onDemandPrice.toFixed(2)}/hr
              </p>
            )}
            <p className="text-blue-400">Performance: {instance.performanceScore}/100</p>
            <p className="text-slate-400 text-sm mt-2">Best for: {instance.bestFor.join(', ')}</p>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Cloud GPU Comparison
        </h1>
        <p className="text-slate-300 mb-8 text-lg">
          Compare pricing and performance across {data.providers.length} cloud GPU providers
        </p>

        {/* Filters Section */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Min Price: ${filters.minPrice}/hr
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Price: ${filters.maxPrice}/hr
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Min VRAM */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Min VRAM: {filters.minVRAM} GB
              </label>
              <input
                type="range"
                min="0"
                max="640"
                step="8"
                value={filters.minVRAM}
                onChange={(e) => setFilters({ ...filters, minVRAM: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Max VRAM */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Max VRAM: {filters.maxVRAM >= 1000 ? 'Unlimited' : `${filters.maxVRAM} GB`}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                step="8"
                value={filters.maxVRAM}
                onChange={(e) => setFilters({ ...filters, maxVRAM: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* GPU Tier */}
            <div>
              <label className="block text-sm font-medium mb-2">GPU Tier</label>
              <select
                value={filters.gpuType}
                onChange={(e) => setFilters({ ...filters, gpuType: e.target.value as any })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="all">All Tiers</option>
                {data.comparisonMetrics.gpuTiers.map((tier) => (
                  <option key={tier.tier} value={tier.tier}>
                    {tier.tier} ({tier.vram})
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Model */}
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Model</label>
              <select
                value={filters.pricingModel}
                onChange={(e) => setFilters({ ...filters, pricingModel: e.target.value as any })}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="all">All Pricing</option>
                <option value="onDemand">On-Demand Only</option>
                <option value="spot">Spot/Preemptible Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600"
              >
                <option value="price">Price (Low to High)</option>
                <option value="performance">Performance (High to Low)</option>
                <option value="value">Best Value (High to Low)</option>
                <option value="vram">VRAM (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Show Spot Pricing Toggle */}
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.showSpotPricing}
                  onChange={(e) => setFilters({ ...filters, showSpotPricing: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium">Prefer Spot Pricing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Select Providers</h2>
          <div className="flex flex-wrap gap-3">
            {data.providers.map((provider) => (
              <button
                key={provider.name}
                onClick={() => toggleProvider(provider.name)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedProviders.includes(provider.name) || selectedProviders.length === 0
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
                style={{
                  backgroundColor:
                    selectedProviders.includes(provider.name) || selectedProviders.length === 0
                      ? provider.color
                      : undefined,
                }}
              >
                {provider.fullName}
              </button>
            ))}
          </div>
          {selectedProviders.length > 0 && (
            <button
              onClick={() => setSelectedProviders([])}
              className="mt-3 text-sm text-blue-400 hover:text-blue-300"
            >
              Clear Provider Filters
            </button>
          )}
        </div>

        {/* GPU Selection */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Select GPU Types</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueGPUTypes.map((gpu) => (
              <button
                key={gpu}
                onClick={() => toggleGPU(gpu)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  selectedGPUs.includes(gpu) || selectedGPUs.length === 0
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {gpu}
              </button>
            ))}
          </div>
          {selectedGPUs.length > 0 && (
            <button
              onClick={() => setSelectedGPUs([])}
              className="mt-3 text-sm text-green-400 hover:text-green-300"
            >
              Clear GPU Filters
            </button>
          )}
        </div>

        {/* Chart View Selection */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { value: 'price', label: 'Price Comparison' },
            { value: 'performance', label: 'Performance' },
            { value: 'bestvalue', label: 'Best Value' },
            { value: 'value', label: 'Price vs Performance' },
            { value: 'specs', label: 'Specifications' },
            { value: 'providers', label: 'Provider Overview' },
          ].map((view) => (
            <button
              key={view.value}
              onClick={() => setChartView(view.value as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                chartView === view.value
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* Results Count & Export */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-slate-300">
            Showing {sortedInstances.length} of {allInstances.length} instances
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>

        {/* Charts */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 mb-8 border border-slate-700">
          {chartView === 'price' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-blue-400">Price Comparison (Top 15)</h2>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={priceComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" label={{ value: '$/hour', position: 'bottom' }} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={200} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="On-Demand" fill="#3b82f6" />
                  <Bar dataKey="Spot" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'performance' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-purple-400">Performance Scores (Top 15)</h2>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={150} />
                  <YAxis stroke="#9ca3af" label={{ value: 'Performance Score', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Performance">
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'bestvalue' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-emerald-400">Best Value GPUs (Top 15)</h2>
              <p className="text-slate-300 mb-4">
                Value Score = Performance Score ÷ Price per Hour × 10 (higher is better)
              </p>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={bestValueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" label={{ value: 'Value Score', position: 'bottom' }} />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={200} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Value Score" radius={[0, 8, 8, 0]}>
                    {bestValueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'value' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-green-400">Price vs Performance (Top 20)</h2>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="price"
                    name="Price"
                    stroke="#9ca3af"
                    label={{ value: '$/hour', position: 'bottom' }}
                  />
                  <YAxis
                    dataKey="performance"
                    name="Performance"
                    stroke="#9ca3af"
                    label={{ value: 'Performance Score', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Scatter data={valueData}>
                    {valueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'specs' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">Specifications Comparison (Top 5)</h2>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={specsRadarData.length > 0 ? specsRadarData[0] ?
                  Object.keys(specsRadarData[0])
                    .filter(key => key !== 'instance' && key !== 'color')
                    .map(key => {
                      const dataObj: any = { subject: key };
                      specsRadarData.forEach((item, idx) => {
                        dataObj[item.instance] = item[key as keyof typeof item];
                      });
                      return dataObj;
                    }) : [] : []}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#9ca3af" />
                  {specsRadarData.map((item, index) => (
                    <Radar
                      key={index}
                      name={item.instance}
                      dataKey={item.instance}
                      stroke={item.color}
                      fill={item.color}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartView === 'providers' && (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-orange-400">Provider Overview</h2>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={providerSummaryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="provider" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Avg Price" fill="#3b82f6" />
                  <Bar dataKey="Avg Performance" fill="#8b5cf6" />
                  <Bar dataKey="Instance Count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Side-by-Side Comparison */}
        {compareInstances.length > 0 && (
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur rounded-xl p-8 mb-8 border border-blue-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400">
                Side-by-Side Comparison ({compareInstances.length}/4)
              </h2>
              <button
                onClick={() => setCompareInstances([])}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
              >
                Clear Comparison
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {compareInstances.map((instanceKey) => {
                const instance = allInstances.find(
                  (i) => `${i.providerName}-${i.name}` === instanceKey
                );
                if (!instance) return null;

                const valueScore = calculateValueScore(instance);

                return (
                  <div
                    key={instanceKey}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-600"
                    style={{ borderColor: instance.providerColor }}
                  >
                    <div
                      className="px-3 py-1 rounded mb-3 text-sm font-bold text-center"
                      style={{ backgroundColor: instance.providerColor }}
                    >
                      {instance.providerName}
                    </div>
                    <h3 className="font-bold text-lg mb-4 text-white">{instance.name}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">GPU:</span>
                        <span className="text-white font-semibold">
                          {instance.gpuCount}x {instance.gpu}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">VRAM:</span>
                        <span className="text-white">{instance.vram} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">RAM:</span>
                        <span className="text-white">{instance.ram} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">vCPUs:</span>
                        <span className="text-white">{instance.vcpus}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Storage:</span>
                        <span className="text-white">{instance.storage}</span>
                      </div>
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">On-Demand:</span>
                          <span className="text-yellow-400 font-bold">
                            ${instance.onDemandPrice.toFixed(2)}/hr
                          </span>
                        </div>
                        {instance.spotPrice && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Spot:</span>
                            <span className="text-green-400 font-bold">
                              ${instance.spotPrice.toFixed(2)}/hr
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Performance:</span>
                          <span className="text-blue-400 font-bold">{instance.performanceScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Value Score:</span>
                          <span className="text-emerald-400 font-bold">{valueScore.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="text-slate-400 text-xs mb-1">Best For:</div>
                        <div className="text-white text-xs">{instance.bestFor.join(', ')}</div>
                      </div>
                      <div className="border-t border-slate-600 pt-2 mt-2">
                        <div className="text-slate-400 text-xs">Regions: {instance.regions}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 overflow-x-auto">
          <h2 className="text-2xl font-bold mb-6 text-blue-400">Detailed Comparison</h2>
          <p className="text-slate-300 mb-4 text-sm">
            Select up to 4 instances to compare side-by-side
          </p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 pr-4">Compare</th>
                <th className="pb-3 pr-4">Provider</th>
                <th className="pb-3 pr-4">Instance</th>
                <th className="pb-3 pr-4">GPU</th>
                <th className="pb-3 pr-4">VRAM</th>
                <th className="pb-3 pr-4">RAM</th>
                <th className="pb-3 pr-4">vCPUs</th>
                <th className="pb-3 pr-4">On-Demand</th>
                <th className="pb-3 pr-4">Spot</th>
                <th className="pb-3 pr-4">Perf</th>
                <th className="pb-3 pr-4">Value</th>
                <th className="pb-3">Best For</th>
              </tr>
            </thead>
            <tbody>
              {sortedInstances.map((instance, index) => {
                const instanceKey = `${instance.providerName}-${instance.name}`;
                const isSelected = compareInstances.includes(instanceKey);

                return (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 pr-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCompare(instanceKey)}
                      disabled={!isSelected && compareInstances.length >= 4}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="px-2 py-1 rounded text-sm font-medium"
                      style={{ backgroundColor: instance.providerColor, color: 'white' }}
                    >
                      {instance.providerName}
                    </span>
                  </td>
                  <td className="py-3 pr-4 font-medium">{instance.name}</td>
                  <td className="py-3 pr-4">
                    {instance.gpuCount}x {instance.gpu}
                  </td>
                  <td className="py-3 pr-4">{instance.vram} GB</td>
                  <td className="py-3 pr-4">{instance.ram} GB</td>
                  <td className="py-3 pr-4">{instance.vcpus}</td>
                  <td className="py-3 pr-4 text-yellow-400">${instance.onDemandPrice.toFixed(2)}/hr</td>
                  <td className="py-3 pr-4 text-green-400">
                    {instance.spotPrice !== null ? `$${instance.spotPrice.toFixed(2)}/hr` : 'N/A'}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                          style={{ width: `${instance.performanceScore}%` }}
                        />
                      </div>
                      <span className="text-sm">{instance.performanceScore}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-emerald-400 font-semibold">
                      {calculateValueScore(instance).toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-slate-400">{instance.bestFor.join(', ')}</td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>

        {/* GPU Tiers Information */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">GPU Tier Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.comparisonMetrics.gpuTiers.map((tier) => (
              <div key={tier.tier} className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-blue-400 mb-2">{tier.tier}</h3>
                <p className="text-sm text-slate-300 mb-2">VRAM: {tier.vram}</p>
                <p className="text-sm text-slate-300 mb-2">GPUs: {tier.gpus.join(', ')}</p>
                <p className="text-sm text-slate-400">{tier.bestFor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Model Compatibility Guide */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Model Compatibility Guide</h2>
          <p className="text-slate-300 mb-6">
            Approximate VRAM requirements for popular open-source models. Actual requirements vary based on quantization and context length.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-green-400 mb-3">Small Models (8-14B)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Llama 3.1 8B, Mistral 7B</span>
                  <span className="text-blue-400 font-semibold">16-24 GB VRAM</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  Compatible: T4, A10, RTX 3090, RTX 4090, and higher
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Medium Models (30-70B)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Llama 3.1 70B, Mixtral 8x7B</span>
                  <span className="text-blue-400 font-semibold">40-80 GB VRAM</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  Compatible: A40, A100 (40GB/80GB), H100, 2x RTX 4090
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-orange-400 mb-3">Large Models (405B+)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Llama 3.1 405B</span>
                  <span className="text-blue-400 font-semibold">200+ GB VRAM</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  Compatible: Multiple A100 80GB, Multiple H100, Apple M2 Ultra (Unified Memory)
                </div>
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold text-red-400 mb-3">DeepSeek-R1 (671B)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">DeepSeek-R1 671B</span>
                  <span className="text-blue-400 font-semibold">320+ GB VRAM</span>
                </div>
                <div className="text-slate-400 text-xs mt-2">
                  Compatible: 8x A100 (80GB), 8x H100, or specialized multi-GPU setups
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-slate-300">
              <strong className="text-cyan-400">Tip:</strong> For detailed model comparisons and hardware requirements, visit the{' '}
              <a href="/ai-models" className="text-cyan-400 hover:text-cyan-300 underline">
                AI Models Comparison
              </a>
              {' '}page.
            </p>
          </div>
        </div>

        {/* Pricing Strategies */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6 text-green-400">Pricing Strategies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.comparisonMetrics.pricingStrategies.map((strategy) => (
              <div key={strategy.strategy} className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">{strategy.strategy}</h3>
                <p className="text-sm text-green-400 mb-2">Savings: {strategy.savings}</p>
                <p className="text-sm text-orange-400 mb-2">Tradeoff: {strategy.tradeoff}</p>
                <p className="text-sm text-slate-400">Available: {strategy.providers.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
