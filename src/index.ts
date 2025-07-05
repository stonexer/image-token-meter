/**
 * OpenAI Vision Token Calculator
 * 
 * A TypeScript library to calculate token consumption for images in OpenAI Vision models.
 * Supports GPT-4o, GPT-4 Vision, and other vision-enabled models.
 * Works in both Node.js and browser environments.
 * 
 * @example
 * ```typescript
 * import { calculateImageTokens } from 'openai-vision-token-calculator';
 * 
 * // Calculate tokens for GPT-4o (default)
 * const result = calculateImageTokens({
 *   width: 1024,
 *   height: 768,
 *   detail: 'high'
 * });
 * 
 * console.log(`Tokens: ${result.tokens}`);
 * console.log(`Cost: $${result.cost.toFixed(4)}`);
 * 
 * // Calculate tokens for a specific model
 * const gpt4Result = calculateImageTokens({
 *   width: 1024,
 *   height: 768,
 *   detail: 'high',
 *   model: 'gpt-4-vision-preview'
 * });
 * ```
 */

// Export all types
export type {
  ImageDetail,
  ImageTokenInput,
  ImageTokenResult,
  PricingConfig,
  BatchCalculationResult,
  VisionModel
} from './types';

export type {
  ModelConfig
} from './models';

// Export all functions
export {
  calculateImageTokens,
  calculateBatchImageTokens,
  getPricing,
  createPricing
} from './calculator';

export {
  getModel,
  getAvailableModels,
  getVisionModels,
  MODELS,
  DEFAULT_MODEL
} from './models';

// Default export
export { calculateImageTokens as default } from './calculator';