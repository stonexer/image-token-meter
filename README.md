# OpenAI Vision Token Calculator

A TypeScript library to calculate token consumption for images in OpenAI Vision models. Works in both Node.js and browser environments.

## Features

- 🧮 Accurate token calculation based on OpenAI's official documentation
- 🤖 Support for multiple models (GPT-4o, GPT-4 Vision, GPT-4 Turbo, etc.)
- 💰 Cost estimation with model-specific pricing
- 🖼️ Support for different detail levels (high, low, auto)
- 📦 Works in both Node.js and browser environments
- 📐 TypeScript support with full type definitions
- 🚀 Zero runtime dependencies

## Installation

```bash
npm install openai-vision-token-calculator
```

## Usage

### Basic Usage

```typescript
import { calculateImageTokens } from 'openai-vision-token-calculator';

// Calculate tokens for GPT-4o (default model)
const result = calculateImageTokens({
  width: 1024,
  height: 768,
  detail: 'high'
});

console.log(`Model: ${result.modelName}`);
console.log(`Tokens: ${result.tokens}`);
console.log(`Cost: $${result.cost.toFixed(4)}`);
console.log(`Tiles: ${result.details.tiles.total}`);
```

### Specific Model

```typescript
// Calculate tokens for GPT-4 Vision
const gpt4Result = calculateImageTokens({
  width: 1024,
  height: 768,
  detail: 'high',
  model: 'gpt-4-vision-preview'
});

// Calculate tokens for GPT-4o Mini (more affordable)
const miniResult = calculateImageTokens({
  width: 1024,
  height: 768,
  detail: 'high',
  model: 'gpt-4o-mini'
});
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

### Batch Processing with Multiple Models

```typescript
import { calculateBatchImageTokens } from 'openai-vision-token-calculator';

const images = [
  { width: 1024, height: 768, detail: 'high', model: 'gpt-4o' },
  { width: 2048, height: 2048, detail: 'high', model: 'gpt-4-vision-preview' },
  { width: 512, height: 512, detail: 'low', model: 'gpt-4o-mini' }
];

const batch = calculateBatchImageTokens(images);

console.log(`Total tokens: ${batch.summary.totalTokens}`);
console.log(`Total cost: $${batch.summary.totalCost.toFixed(2)}`);

// View breakdown by model
Object.entries(batch.summary.byModel).forEach(([model, stats]) => {
  console.log(`${model}: ${stats.count} images, ${stats.tokens} tokens, $${stats.cost.toFixed(2)}`);
});
```

### Custom Pricing

```typescript
import { calculateImageTokens, createPricing } from 'openai-vision-token-calculator';

// Create custom pricing (e.g., $2.50 per 1k tokens)
const customPricing = createPricing(2.50);

const result = calculateImageTokens({
  width: 1024,
  height: 768,
  model: 'gpt-4o'
}, customPricing);

console.log(`Cost with custom pricing: $${result.cost.toFixed(4)}`);
```

### Available Models

```typescript
import { getAvailableModels, getModel } from 'openai-vision-token-calculator';

// List all available models
const models = getAvailableModels();
console.log('Available models:', models);

// Get details about a specific model
const modelInfo = getModel('gpt-4o');
console.log(`${modelInfo.name}: $${modelInfo.defaultCostPer1kTokens}/1k tokens`);
```

## Supported Models

| Model | ID | Default Cost/1k tokens | Notes |
|-------|----|-----------------------|-------|
| GPT-4o | `gpt-4o` | $5.00 | Latest multimodal model |
| GPT-4o Mini | `gpt-4o-mini` | $0.15 | Affordable alternative |
| GPT-4 Vision | `gpt-4-vision-preview` | $10.00 | Original vision model |
| GPT-4 Turbo | `gpt-4-turbo` | $10.00 | With vision support |
| GPT-4 Turbo (2024-04-09) | `gpt-4-turbo-2024-04-09` | $10.00 | Specific version |
| GPT-4 Vision (1106) | `gpt-4-1106-vision-preview` | $10.00 | November 2023 version |

## How It Works

The calculator follows OpenAI's image tokenization rules:

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
- `input`: Object with image parameters
  - `width`: Image width in pixels
  - `height`: Image height in pixels
  - `detail`: Optional detail level ('high', 'low', 'auto'). Default: 'high'
  - `model`: Optional model ID. Default: 'gpt-4o'
- `pricing`: Optional custom pricing configuration

**Returns:** Object containing:
- `tokens`: Total token count
- `cost`: Estimated cost in USD
- `model`: Model ID used
- `modelName`: Human-readable model name
- `details`: Detailed calculation breakdown

### `calculateBatchImageTokens(images, pricing?)`

Calculate tokens for multiple images.

**Parameters:**
- `images`: Array of image inputs
- `pricing`: Optional custom pricing configuration

**Returns:** Object containing:
- `results`: Array of individual results
- `summary`: Total tokens, cost, image count, and breakdown by model

### `getModel(modelId)`

Get configuration for a specific model.

### `getAvailableModels()`

Get list of all available model IDs.

### `getVisionModels()`

Get list of all vision-enabled model configurations.

### `createPricing(costPer1kTokens)`

Create a custom pricing configuration.

### `getPricing(model?)`

Get the default pricing for a specific model.

## Examples

### Real-world Example

```typescript
// A typical smartphone photo (4032x3024)
const photo = calculateImageTokens({
  width: 4032,
  height: 3024,
  detail: 'high',
  model: 'gpt-4o'
});

console.log(`Smartphone photo: ${photo.tokens} tokens ($${photo.cost.toFixed(2)})`);
console.log(`Resized to: ${photo.details.resizedSize.width}x${photo.details.resizedSize.height}`);
console.log(`Tiles: ${photo.details.tiles.width}x${photo.details.tiles.height}`);
```

### Cost Comparison Between Models

```typescript
const imageSize = { width: 2048, height: 1536, detail: 'high' };

const models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-vision-preview'];

models.forEach(model => {
  const result = calculateImageTokens({ ...imageSize, model });
  console.log(`${result.modelName}: ${result.tokens} tokens, $${result.cost.toFixed(2)}`);
});
```

### Optimization Strategy

```typescript
// Compare costs between detail levels
const highDetail = calculateImageTokens({ 
  width: 4096, 
  height: 3072, 
  detail: 'high',
  model: 'gpt-4o' 
});

const lowDetail = calculateImageTokens({ 
  width: 4096, 
  height: 3072, 
  detail: 'low',
  model: 'gpt-4o' 
});

console.log(`High detail: ${highDetail.tokens} tokens ($${highDetail.cost.toFixed(2)})`);
console.log(`Low detail: ${lowDetail.tokens} tokens ($${lowDetail.cost.toFixed(2)})`);
console.log(`Savings: $${(highDetail.cost - lowDetail.cost).toFixed(2)} (${((1 - lowDetail.cost/highDetail.cost) * 100).toFixed(1)}%)`);
```

## Token Calculation Examples

| Original Size | Model | Detail | Resized Size | Tiles | Tokens | Cost @ Default |
|--------------|-------|--------|--------------|-------|--------|----------------|
| 512×512      | GPT-4o | high   | 512×512      | 1×1   | 255    | $1.28          |
| 768×768      | GPT-4o | high   | 768×768      | 2×2   | 765    | $3.83          |
| 1024×1024    | GPT-4o | high   | 768×768      | 2×2   | 765    | $3.83          |
| 2048×2048    | GPT-4o | high   | 768×768      | 2×2   | 765    | $3.83          |
| 3000×1200    | GPT-4o | high   | 1920×768     | 4×2   | 1445   | $7.23          |
| Any size     | Any    | low    | 512×512      | 1×1   | 85     | Varies by model |

## TypeScript Support

The library includes comprehensive TypeScript definitions:

```typescript
import type { 
  ImageTokenInput, 
  ImageTokenResult, 
  VisionModel,
  ModelConfig 
} from 'openai-vision-token-calculator';
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Links

- [OpenAI Vision Guide](https://platform.openai.com/docs/guides/images-vision)
- [OpenAI Pricing](https://openai.com/api/pricing/)