import { validateAIModel, validateOllamaModel } from '@/types';

/**
 * Validates and filters AI models data
 * Returns only valid models, logging errors for invalid ones
 */
export function validateAIModelsData(data: any) {
  if (!data || !Array.isArray(data.models)) {
    console.error('Invalid AI models data structure');
    return { models: [] };
  }

  const validModels = data.models.filter((model: any, index: number) => {
    const isValid = validateAIModel(model);
    if (!isValid) {
      console.error(`Invalid AI model at index ${index}:`, model);
    }
    return isValid;
  });

  return { models: validModels };
}

/**
 * Validates and filters Ollama models data
 * Returns only valid models, logging errors for invalid ones
 */
export function validateOllamaModelsData(data: any) {
  if (!data || !Array.isArray(data.models)) {
    console.error('Invalid Ollama models data structure');
    return { models: [] };
  }

  const validModels = data.models.filter((model: any, index: number) => {
    const isValid = validateOllamaModel(model);
    if (!isValid) {
      console.error(`Invalid Ollama model at index ${index}:`, model);
    }
    return isValid;
  });

  return { models: validModels };
}

/**
 * Validates hardware comparison data structure
 */
export function validateHardwareData(data: any) {
  if (!data) {
    console.error('Hardware data is null or undefined');
    return { allHardware: [], performanceData: [], specs: [] };
  }

  const errors: string[] = [];

  if (!Array.isArray(data.allHardware)) {
    errors.push('allHardware is not an array');
  }

  if (!Array.isArray(data.performanceData)) {
    errors.push('performanceData is not an array');
  }

  if (!Array.isArray(data.specs)) {
    errors.push('specs is not an array');
  }

  if (errors.length > 0) {
    console.error('Hardware data validation errors:', errors);
    return { allHardware: [], performanceData: [], specs: [] };
  }

  return data;
}
