import { describe, it, expect } from 'vitest';
import {
  isValidColor,
  sanitizeColor,
  validateAIModel,
  validateOllamaModel
} from '../types';

describe('Color Validation', () => {
  it('should validate correct hex colors', () => {
    expect(isValidColor('#FFFFFF')).toBe(true);
    expect(isValidColor('#000000')).toBe(true);
    expect(isValidColor('#3b82f6')).toBe(true);
  });

  it('should reject invalid hex colors', () => {
    expect(isValidColor('#FFF')).toBe(false);
    expect(isValidColor('blue')).toBe(false);
    expect(isValidColor('#GGGGGG')).toBe(false);
    expect(isValidColor('')).toBe(false);
  });

  it('should sanitize colors with fallback', () => {
    expect(sanitizeColor('#FFFFFF')).toBe('#FFFFFF');
    expect(sanitizeColor('invalid')).toBe('#94a3b8');
    expect(sanitizeColor('invalid', '#FF0000')).toBe('#FF0000');
  });
});

describe('AI Model Validation', () => {
  it('should validate a correct AI model', () => {
    const validModel = {
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
    };

    expect(validateAIModel(validModel)).toBe(true);
  });

  it('should reject an invalid AI model', () => {
    const invalidModel = {
      name: 'Test Model',
      // missing required fields
    };

    expect(validateAIModel(invalidModel)).toBe(false);
  });
});

describe('Ollama Model Validation', () => {
  it('should validate a correct Ollama model', () => {
    const validModel = {
      name: 'Test Model',
      provider: 'Test Provider',
      parameters: 7,
      category: 'General',
      minRAM: 8,
      recommendedRAM: 16,
      minVRAM: '8GB',
      storageSize: '4.1GB',
      contextWindow: 32,
      quantization: 'Q4_0',
      useCase: 'General chat',
      description: 'Test description',
      color: '#f59e0b',
      features: ['Fast', 'Versatile']
    };

    expect(validateOllamaModel(validModel)).toBe(true);
  });

  it('should reject an invalid Ollama model', () => {
    const invalidModel = {
      name: 'Test Model',
      // missing required fields
    };

    expect(validateOllamaModel(invalidModel)).toBe(false);
  });
});
