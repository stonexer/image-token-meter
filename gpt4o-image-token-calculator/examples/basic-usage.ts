import { 
  calculateImageTokens, 
  calculateBatchImageTokens,
  createPricing,
  ImageTokenInput 
} from '../src';

// Example 1: Basic usage with a single image
console.log('=== Example 1: Basic Single Image ===');
const result = calculateImageTokens({
  width: 1920,
  height: 1080,
  detail: 'high'
});

console.log(`Image: 1920x1080`);
console.log(`Tokens: ${result.tokens}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
console.log(`Resized to: ${result.details.resizedSize.width}x${result.details.resizedSize.height}`);
console.log(`Tiles: ${result.details.tiles.width}x${result.details.tiles.height} = ${result.details.tiles.total} tiles`);
console.log();

// Example 2: Low detail mode
console.log('=== Example 2: Low Detail Mode ===');
const lowDetailResult = calculateImageTokens({
  width: 4096,
  height: 2160,
  detail: 'low'
});

console.log(`Image: 4096x2160 (low detail)`);
console.log(`Tokens: ${lowDetailResult.tokens}`);
console.log(`Cost: $${lowDetailResult.cost.toFixed(4)}`);
console.log();

// Example 3: Common image sizes
console.log('=== Example 3: Common Image Sizes ===');
const commonSizes: Array<ImageTokenInput & { name: string }> = [
  { name: 'Instagram Square', width: 1080, height: 1080 },
  { name: 'Twitter Image', width: 1200, height: 675 },
  { name: 'iPhone Photo', width: 4032, height: 3024 },
  { name: 'Full HD', width: 1920, height: 1080 },
  { name: '4K', width: 3840, height: 2160 },
];

commonSizes.forEach(size => {
  const result = calculateImageTokens(size);
  console.log(`${size.name} (${size.width}x${size.height}): ${result.tokens} tokens, $${result.cost.toFixed(2)}`);
});
console.log();

// Example 4: Batch processing
console.log('=== Example 4: Batch Processing ===');
const batchResult = calculateBatchImageTokens([
  { width: 1024, height: 768, detail: 'high' },
  { width: 2048, height: 1536, detail: 'high' },
  { width: 512, height: 512, detail: 'low' },
  { width: 3840, height: 2160, detail: 'high' }
]);

console.log(`Total images: ${batchResult.summary.totalImages}`);
console.log(`Total tokens: ${batchResult.summary.totalTokens}`);
console.log(`Total cost: $${batchResult.summary.totalCost.toFixed(2)}`);
console.log('\nIndividual results:');
batchResult.results.forEach((result, index) => {
  console.log(`  Image ${index + 1}: ${result.tokens} tokens`);
});
console.log();

// Example 5: Custom pricing
console.log('=== Example 5: Custom Pricing ===');
const customPricing = createPricing(2.50); // $2.50 per 1k tokens
const customPricingResult = calculateImageTokens({
  width: 2048,
  height: 2048,
  detail: 'high'
}, customPricing);

console.log(`Image: 2048x2048`);
console.log(`Tokens: ${customPricingResult.tokens}`);
console.log(`Cost at $2.50/1k tokens: $${customPricingResult.cost.toFixed(4)}`);
console.log();

// Example 6: Cost comparison
console.log('=== Example 6: Cost Comparison (High vs Low Detail) ===');
const testImage = { width: 4096, height: 3072 };

const highDetail = calculateImageTokens({ ...testImage, detail: 'high' });
const lowDetail = calculateImageTokens({ ...testImage, detail: 'low' });

console.log(`Image: ${testImage.width}x${testImage.height}`);
console.log(`High detail: ${highDetail.tokens} tokens ($${highDetail.cost.toFixed(2)})`);
console.log(`Low detail: ${lowDetail.tokens} tokens ($${lowDetail.cost.toFixed(2)})`);
console.log(`Savings with low detail: $${(highDetail.cost - lowDetail.cost).toFixed(2)}`);
console.log(`Token reduction: ${((1 - lowDetail.tokens / highDetail.tokens) * 100).toFixed(1)}%`);