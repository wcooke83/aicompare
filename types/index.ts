// Data structure types for AI comparison app

export interface HardwareRequirements {
  minVRAM: string;
  recommendedGPU: string;
  minRAM: string;
  storageSize: string;
}

export interface ModelCapabilities {
  cleverness: number;
  coding: number;
  reasoning: number;
  creative: number;
  factual: number;
  math: number;
}

export interface AIModel {
  name: string;
  provider: string;
  category: 'Proprietary' | 'Open Source';
  parameters: number;
  costPer1M: number;
  speedTokens: number;
  benchmarkMMLU: number;
  benchmarkHumanEval: number;
  contextWindow: number;
  quality: number;
  color: string;
  capabilities: ModelCapabilities;
  hardwareRequired: HardwareRequirements | null;
}

export interface AIModelsData {
  models: AIModel[];
}

// Ollama Models Types
export interface OllamaModel {
  name: string;
  provider: string;
  parameters: number;
  category: 'General' | 'Coding' | 'Vision' | 'Reasoning' | 'Multilingual' | 'Uncensored' | 'Tools';
  minRAM: number;
  recommendedRAM: number;
  minVRAM: string;
  storageSize: string;
  contextWindow: number;
  quantization: string;
  useCase: string;
  description: string;
  color: string;
  features: string[];
}

export interface OllamaModelsData {
  models: OllamaModel[];
}

// Hardware Comparison Types
export interface HardwareSpec {
  id: string;
  name: string;
  color: string;
}

export interface HardwarePerformance {
  model: string;
  [key: string]: number | string; // Dynamic hardware keys
}

export interface HardwareDetails {
  name: string;
  memory: number;
  bandwidth: number;
  power: number;
  price: number;
  pricePerGB: number;
  category: 'Unified Memory' | 'Consumer GPU' | 'Data Center GPU';
}

export interface HardwareComparisonData {
  allHardware: HardwareSpec[];
  performanceData: HardwarePerformance[];
  specs: HardwareDetails[];
}

// Recharts tooltip types
export interface TooltipPayloadEntry {
  name: string;
  value: number | string;
  color: string;
  payload: any;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

// Color validation
const COLOR_REGEX = /^#[0-9A-F]{6}$/i;

export function isValidColor(color: string): boolean {
  return COLOR_REGEX.test(color);
}

export function sanitizeColor(color: string, fallback = '#94a3b8'): string {
  return isValidColor(color) ? color : fallback;
}

// Data validation helpers
export function validateAIModel(model: any): model is AIModel {
  return (
    typeof model === 'object' &&
    typeof model.name === 'string' &&
    typeof model.provider === 'string' &&
    (model.category === 'Proprietary' || model.category === 'Open Source') &&
    typeof model.parameters === 'number' &&
    typeof model.costPer1M === 'number' &&
    typeof model.speedTokens === 'number' &&
    typeof model.benchmarkMMLU === 'number' &&
    typeof model.benchmarkHumanEval === 'number' &&
    typeof model.contextWindow === 'number' &&
    typeof model.quality === 'number' &&
    typeof model.color === 'string' &&
    typeof model.capabilities === 'object'
  );
}

export function validateOllamaModel(model: any): model is OllamaModel {
  return (
    typeof model === 'object' &&
    typeof model.name === 'string' &&
    typeof model.provider === 'string' &&
    typeof model.parameters === 'number' &&
    typeof model.category === 'string' &&
    typeof model.minRAM === 'number' &&
    typeof model.recommendedRAM === 'number' &&
    typeof model.color === 'string' &&
    Array.isArray(model.features)
  );
}
