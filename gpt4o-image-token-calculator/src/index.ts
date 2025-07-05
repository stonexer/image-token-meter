/**
 * GPT-4o Image Token Calculator
 * 
 * A TypeScript library to calculate token consumption for images in OpenAI's GPT-4o model.
 * Works in both Node.js and browser environments.
 * 
 * @example
 * ```typescript
 * import { calculateImageTokens } from 'gpt4o-image-token-calculator';
 * 
 * const result = calculateImageTokens({
 *   width: 1024,
 *   height: 768,
 *   detail: 'high'
 * });
 * 
 * console.log(`Tokens: ${result.tokens}`);
 * console.log(`Cost: $${result.cost.toFixed(4)}`);
 * ```
 */

// Export all types
export type {
  ImageDetail,
  ImageTokenInput,
  ImageTokenResult,
  PricingConfig
} from './types';

// Export all functions
export {
  calculateImageTokens,
  calculateBatchImageTokens,
  getPricing,
  createPricing
} from './calculator';

// Default export
export { calculateImageTokens as default } from './calculator';