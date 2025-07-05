# GPT-4o Image Token Calculator

A TypeScript library to calculate token consumption for images in OpenAI's GPT-4o model. Works in both Node.js and browser environments.

## Features

- 🧮 Accurate token calculation based on OpenAI's official documentation
- 💰 Cost estimation with customizable pricing
- 🖼️ Support for different detail levels (high, low, auto)
- 📦 Works in both Node.js and browser environments
- 📐 TypeScript support with full type definitions
- 🚀 Zero dependencies

## Installation

```bash
npm install gpt4o-image-token-calculator
```

## Usage

### Basic Usage

```typescript
import { calculateImageTokens } from 'gpt4o-image-token-calculator';

const result = calculateImageTokens({
  width: 1024,
  height: 768,
  detail: 'high'
});

console.log(`Tokens: ${result.tokens}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
console.log(`Tiles: ${result.details.tiles.total}`);
```

### Low Detail Mode

```typescript
const result = calculateImageTokens({
  width: 4096,
  height: 2048,
  detail: 'low'
});

// Low detail always returns 85 tokens
console.log(result.tokens); // 85
```

### Batch Processing

```typescript
import { calculateBatchImageTokens } from 'gpt4o-image-token-calculator';

const images = [
  { width: 1024, height: 768, detail: 'high' },
  { width: 2048, height: 2048, detail: 'high' },
  { width: 512, height: 512, detail: 'low' }
];

const batch = calculateBatchImageTokens(images);

console.log(`Total tokens: ${batch.summary.totalTokens}`);
console.log(`Total cost: $${batch.summary.totalCost.toFixed(2)}`);

// Access individual results
batch.results.forEach((result, index) => {
  console.log(`Image ${index + 1}: ${result.tokens} tokens`);
});
```

### Custom Pricing

```typescript
import { calculateImageTokens, createPricing } from 'gpt4o-image-token-calculator';

// Create custom pricing (e.g., $2.50 per 1k tokens)
const customPricing = createPricing(2.50);

const result = calculateImageTokens({
  width: 1024,
  height: 768
}, customPricing);

console.log(`Cost with custom pricing: $${result.cost.toFixed(4)}`);
```

## How It Works

The calculator follows OpenAI's image tokenization rules for GPT-4o:

1. **High Detail Mode**:
   - First, the image is scaled to fit within a 2048x2048 square
   - Then, the shortest side is scaled to 768px (if both dimensions exceed 768px)
   - The image is divided into 512x512 tiles
   - Token count = 85 (base) + 170 × (number of tiles)

2. **Low Detail Mode**:
   - Always returns 85 tokens regardless of image size
   - Image is processed at 512x512 resolution

3. **Auto Mode**:
   - Currently defaults to high detail mode

## API Reference

### `calculateImageTokens(input, pricing?)`

Calculate tokens for a single image.

**Parameters:**
- `input`: Object with image dimensions and detail level
  - `width`: Image width in pixels
  - `height`: Image height in pixels
  - `detail`: Optional detail level ('high', 'low', 'auto'). Default: 'high'
- `pricing`: Optional custom pricing configuration

**Returns:** Object containing:
- `tokens`: Total token count
- `cost`: Estimated cost in USD
- `details`: Detailed calculation breakdown

### `calculateBatchImageTokens(images, pricing?)`

Calculate tokens for multiple images.

**Parameters:**
- `images`: Array of image inputs
- `pricing`: Optional custom pricing configuration

**Returns:** Object containing:
- `results`: Array of individual results
- `summary`: Total tokens, cost, and image count

### `createPricing(costPer1kTokens)`

Create a custom pricing configuration.

**Parameters:**
- `costPer1kTokens`: Cost per 1000 tokens in USD

**Returns:** Pricing configuration object

### `getPricing()`

Get the default pricing configuration (currently $5.00 per 1k tokens for GPT-4o).

## Examples

### Real-world Example

```typescript
// A typical smartphone photo (4032x3024)
const photo = calculateImageTokens({
  width: 4032,
  height: 3024,
  detail: 'high'
});

console.log(`Smartphone photo: ${photo.tokens} tokens ($${photo.cost.toFixed(2)})`);
console.log(`Resized to: ${photo.details.resizedSize.width}x${photo.details.resizedSize.height}`);
console.log(`Tiles: ${photo.details.tiles.width}x${photo.details.tiles.height}`);
```

### Cost Optimization

```typescript
// Compare costs between detail levels
const highDetail = calculateImageTokens({ width: 4096, height: 3072, detail: 'high' });
const lowDetail = calculateImageTokens({ width: 4096, height: 3072, detail: 'low' });

console.log(`High detail: ${highDetail.tokens} tokens ($${highDetail.cost.toFixed(2)})`);
console.log(`Low detail: ${lowDetail.tokens} tokens ($${lowDetail.cost.toFixed(2)})`);
console.log(`Savings: $${(highDetail.cost - lowDetail.cost).toFixed(2)}`);
```

## Token Calculation Examples

| Original Size | Detail | Resized Size | Tiles | Tokens | Cost @ $5/1k |
|--------------|--------|--------------|-------|--------|--------------|
| 512×512      | high   | 512×512      | 1×1   | 255    | $1.28        |
| 768×768      | high   | 768×768      | 2×2   | 765    | $3.83        |
| 1024×1024    | high   | 768×768      | 2×2   | 765    | $3.83        |
| 2048×2048    | high   | 768×768      | 2×2   | 765    | $3.83        |
| 3000×1200    | high   | 1920×768     | 4×2   | 1445   | $7.23        |
| Any size     | low    | 512×512      | 1×1   | 85     | $0.43        |

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/images-vision)
- [OpenAI Pricing](https://openai.com/api/pricing/)