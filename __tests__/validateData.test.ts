import { describe, it, expect, vi } from 'vitest';
import {
  validateAIModelsData,
  validateOllamaModelsData,
  validateHardwareData
} from '../lib/validateData';

describe('validateAIModelsData', () => {
  it('should return valid models', () => {
    const mockData = {
      models: [
        {
          name: 'Test Model',
          provider: 'Test Provider',
          category: 'Proprietary',
          parameters: 100,
          costPer1M: 5,
          speedTokens: 50,
          benchmarkMMLU: 85,
          benchmarkHumanEval: 70,
          contextWindow: 128,
          quality: 90,
          color: '#3b82f6',
          capabilities: {
            cleverness: 90,
            coding: 85,
            reasoning: 88,
            creative: 87,
            factual: 89,
            math: 86
          },
          hardwareRequired: null
        }
      ]
    };

    const result = validateAIModelsData(mockData);
    expect(result.models).toHaveLength(1);
  });

  it('should filter out invalid models', () => {
    const mockData = {
      models: [
        { name: 'Invalid Model' }, // Missing required fields
      ]
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = validateAIModelsData(mockData);

    expect(result.models).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle null or invalid data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result1 = validateAIModelsData(null);
    const result2 = validateAIModelsData({ invalid: 'data' });

    expect(result1.models).toHaveLength(0);
    expect(result2.models).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
  });
});

describe('validateHardwareData', () => {
  it('should validate correct hardware data', () => {
    const mockData = {
      allHardware: [],
      performanceData: [],
      specs: []
    };

    const result = validateHardwareData(mockData);
    expect(result).toEqual(mockData);
  });

  it('should return empty arrays for invalid data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = validateHardwareData(null);

    expect(result.allHardware).toHaveLength(0);
    expect(result.performanceData).toHaveLength(0);
    expect(result.specs).toHaveLength(0);

    consoleSpy.mockRestore();
  });
});
