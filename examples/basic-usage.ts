import { 
  calculateImageTokens, 
  calculateBatchImageTokens,
  createPricing,
  ImageTokenInput,
  getAvailableModels,
  getModel
} from '../src';

// Example 1: Basic usage with default model (GPT-4o)
console.log('=== Example 1: Basic Single Image (GPT-4o) ===');
const result = calculateImageTokens({
  width: 1920,
  height: 1080,
  detail: 'high'
});

console.log(`Model: ${result.modelName}`);
console.log(`Image: 1920x1080`);
console.log(`Tokens: ${result.tokens}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
console.log(`Resized to: ${result.details.resizedSize.width}x${result.details.resizedSize.height}`);
console.log(`Tiles: ${result.details.tiles.width}x${result.details.tiles.height} = ${result.details.tiles.total} tiles`);
console.log();

// Example 2: Different models comparison
console.log('=== Example 2: Model Comparison ===');
const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-vision-preview', 'gpt-4-turbo'];
const testImage = { width: 2048, height: 1536, detail: 'high' as const };

models.forEach(model => {
  const result = calculateImageTokens({ ...testImage, model });
  console.log(`${result.modelName}: ${result.tokens} tokens, $${result.cost.toFixed(4)}`);
});
console.log();

// Example 3: Low detail mode
console.log('=== Example 3: Low Detail Mode ===');
const lowDetailResult = calculateImageTokens({
  width: 4096,
  height: 2160,
  detail: 'low',
  model: 'gpt-4o'
});

console.log(`Image: 4096x2160 (low detail)`);
console.log(`Model: ${lowDetailResult.modelName}`);
console.log(`Tokens: ${lowDetailResult.tokens}`);
console.log(`Cost: $${lowDetailResult.cost.toFixed(4)}`);
console.log();

// Example 4: Common image sizes with GPT-4o Mini (affordable option)
console.log('=== Example 4: Common Sizes with GPT-4o Mini ===');
const commonSizes: Array<ImageTokenInput & { name: string }> = [
  { name: 'Instagram Square', width: 1080, height: 1080, model: 'gpt-4o-mini' },
  { name: 'Twitter Image', width: 1200, height: 675, model: 'gpt-4o-mini' },
  { name: 'iPhone Photo', width: 4032, height: 3024, model: 'gpt-4o-mini' },
  { name: 'Full HD', width: 1920, height: 1080, model: 'gpt-4o-mini' },
  { name: '4K', width: 3840, height: 2160, model: 'gpt-4o-mini' },
];

commonSizes.forEach(size => {
  const result = calculateImageTokens(size);
  console.log(`${size.name} (${size.width}x${size.height}): ${result.tokens} tokens, $${result.cost.toFixed(4)}`);
});
console.log();

// Example 5: Batch processing with mixed models
console.log('=== Example 5: Batch Processing with Mixed Models ===');
const batchResult = calculateBatchImageTokens([
  { width: 1024, height: 768, detail: 'high', model: 'gpt-4o' },
  { width: 2048, height: 1536, detail: 'high', model: 'gpt-4-vision-preview' },
  { width: 512, height: 512, detail: 'low', model: 'gpt-4o-mini' },
  { width: 3840, height: 2160, detail: 'high', model: 'gpt-4-turbo' }
]);

console.log(`Total images: ${batchResult.summary.totalImages}`);
console.log(`Total tokens: ${batchResult.summary.totalTokens}`);
console.log(`Total cost: $${batchResult.summary.totalCost.toFixed(2)}`);
console.log('\nBreakdown by model:');
Object.entries(batchResult.summary.byModel).forEach(([model, stats]) => {
  const modelInfo = getModel(model);
  console.log(`  ${modelInfo?.name || model}: ${stats.count} images, ${stats.tokens} tokens, $${stats.cost.toFixed(2)}`);
});
console.log();

// Example 6: Custom pricing
console.log('=== Example 6: Custom Pricing ===');
const customPricing = createPricing(2.50); // $2.50 per 1k tokens
const customPricingResult = calculateImageTokens({
  width: 2048,
  height: 2048,
  detail: 'high',
  model: 'gpt-4o'
}, customPricing);

console.log(`Model: ${customPricingResult.modelName}`);
console.log(`Image: 2048x2048`);
console.log(`Tokens: ${customPricingResult.tokens}`);
console.log(`Cost at $2.50/1k tokens: $${customPricingResult.cost.toFixed(4)}`);
console.log(`Cost at default pricing: $${(customPricingResult.tokens / 1000 * 5.00).toFixed(4)}`);
console.log();

// Example 7: Cost optimization analysis
console.log('=== Example 7: Cost Optimization Analysis ===');
const testImageSize = { width: 4096, height: 3072 };

// Compare high vs low detail
const highDetail = calculateImageTokens({ ...testImageSize, detail: 'high', model: 'gpt-4o' });
const lowDetail = calculateImageTokens({ ...testImageSize, detail: 'low', model: 'gpt-4o' });

console.log(`Image: ${testImageSize.width}x${testImageSize.height}`);
console.log(`High detail: ${highDetail.tokens} tokens ($${highDetail.cost.toFixed(2)})`);
console.log(`Low detail: ${lowDetail.tokens} tokens ($${lowDetail.cost.toFixed(2)})`);
console.log(`Savings with low detail: $${(highDetail.cost - lowDetail.cost).toFixed(2)}`);
console.log(`Token reduction: ${((1 - lowDetail.tokens / highDetail.tokens) * 100).toFixed(1)}%`);
console.log();

// Compare models for same image
console.log('Cost comparison across models (high detail):');
['gpt-4o', 'gpt-4o-mini', 'gpt-4-vision-preview'].forEach(model => {
  const result = calculateImageTokens({ ...testImageSize, detail: 'high', model });
  console.log(`  ${result.modelName}: $${result.cost.toFixed(2)}`);
});
console.log();

// Example 8: Available models
console.log('=== Example 8: Available Models ===');
const availableModels = getAvailableModels();
console.log('All available models:');
availableModels.forEach(modelId => {
  const model = getModel(modelId);
  if (model && model.supportsVision) {
    console.log(`  - ${model.name} (${modelId}): $${model.defaultCostPer1kTokens}/1k tokens`);
  }
});