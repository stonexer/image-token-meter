import { ImageTokenInput, ImageTokenResult, PricingConfig, BatchCalculationResult } from './types';
import { getModel, DEFAULT_MODEL, ModelConfig } from './models';

/**
 * Calculate the number of tokens consumed by an image in OpenAI Vision models
 * Based on OpenAI's documentation: https://platform.openai.com/docs/guides/images-vision
 * 
 * @param input - Image dimensions, detail level, and model
 * @param pricing - Optional pricing configuration (overrides model default)
 * @returns Token count and cost calculation
 */
export function calculateImageTokens(
  input: ImageTokenInput,
  pricing?: PricingConfig
): ImageTokenResult {
  const { width, height, detail = 'high', model = DEFAULT_MODEL } = input;
  
  // Validate input
  if (width <= 0 || height <= 0) {
    throw new Error('Image dimensions must be positive numbers');
  }
  
  // Get model configuration
  const modelConfig = getModel(model);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${model}. Available models: ${Object.keys(getModel).join(', ')}`);
  }
  
  if (!modelConfig.supportsVision) {
    throw new Error(`Model ${model} does not support vision`);
  }
  
  // Use provided pricing or model default
  const costPer1kTokens = pricing?.costPer1kTokens ?? modelConfig.defaultCostPer1kTokens;
  
  // For low detail, always return configured low detail tokens
  if (detail === 'low') {
    const tokens = modelConfig.lowDetailTokens;
    const cost = (tokens / 1000) * costPer1kTokens;
    
    return {
      tokens,
      cost,
      model: modelConfig.id,
      modelName: modelConfig.name,
      details: {
        originalSize: { width, height },
        resizedSize: { width: 512, height: 512 },
        tiles: { width: 1, height: 1, total: 1 },
        baseTokens: tokens,
        tokensPerTile: 0,
        detailLevel: 'low'
      }
    };
  }
  
  // For high detail or auto (which defaults to high)
  const { resizedWidth, resizedHeight } = resizeImage(width, height, modelConfig);
  
  // Calculate number of tiles
  const tilesWidth = Math.ceil(resizedWidth / modelConfig.tileSize);
  const tilesHeight = Math.ceil(resizedHeight / modelConfig.tileSize);
  const totalTiles = tilesWidth * tilesHeight;
  
  // Calculate total tokens
  const tokens = modelConfig.baseTokens + (modelConfig.tokensPerTile * totalTiles);
  
  // Calculate cost
  const cost = (tokens / 1000) * costPer1kTokens;
  
  return {
    tokens,
    cost,
    model: modelConfig.id,
    modelName: modelConfig.name,
    details: {
      originalSize: { width, height },
      resizedSize: { width: resizedWidth, height: resizedHeight },
      tiles: {
        width: tilesWidth,
        height: tilesHeight,
        total: totalTiles
      },
      baseTokens: modelConfig.baseTokens,
      tokensPerTile: modelConfig.tokensPerTile,
      detailLevel: detail === 'auto' ? 'high' : detail
    }
  };
}

/**
 * Resize image dimensions according to model rules
 * 
 * @param width - Original width
 * @param height - Original height
 * @param modelConfig - Model configuration
 * @returns Resized dimensions
 */
function resizeImage(
  width: number, 
  height: number, 
  modelConfig: ModelConfig
): { resizedWidth: number; resizedHeight: number } {
  let resizedWidth = width;
  let resizedHeight = height;
  
  // Step 1: Scale down to fit within max dimension square if necessary
  if (resizedWidth > modelConfig.maxDimension || resizedHeight > modelConfig.maxDimension) {
    const aspectRatio = resizedWidth / resizedHeight;
    
    if (aspectRatio > 1) {
      // Width is larger
      resizedWidth = modelConfig.maxDimension;
      resizedHeight = Math.floor(modelConfig.maxDimension / aspectRatio);
    } else {
      // Height is larger or square
      resizedHeight = modelConfig.maxDimension;
      resizedWidth = Math.floor(modelConfig.maxDimension * aspectRatio);
    }
  }
  
  // Step 2: Scale so shortest side is target size if both dimensions exceed target
  if (resizedWidth > modelConfig.shortSideTarget && resizedHeight > modelConfig.shortSideTarget) {
    const aspectRatio = resizedWidth / resizedHeight;
    
    if (aspectRatio > 1) {
      // Width is larger, scale height to target
      resizedHeight = modelConfig.shortSideTarget;
      resizedWidth = Math.floor(modelConfig.shortSideTarget * aspectRatio);
    } else {
      // Height is larger or square, scale width to target
      resizedWidth = modelConfig.shortSideTarget;
      resizedHeight = Math.floor(modelConfig.shortSideTarget / aspectRatio);
    }
  }
  
  return { resizedWidth, resizedHeight };
}

/**
 * Calculate tokens for multiple images
 * 
 * @param images - Array of image inputs
 * @param pricing - Optional pricing configuration (overrides model defaults)
 * @returns Array of results and total summary
 */
export function calculateBatchImageTokens(
  images: ImageTokenInput[],
  pricing?: PricingConfig
): BatchCalculationResult {
  const results = images.map(image => calculateImageTokens(image, pricing));
  
  const totalTokens = results.reduce((sum, result) => sum + result.tokens, 0);
  const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
  
  // Calculate breakdown by model
  const byModel: Record<string, { count: number; tokens: number; cost: number }> = {};
  
  results.forEach(result => {
    if (!byModel[result.model]) {
      byModel[result.model] = { count: 0, tokens: 0, cost: 0 };
    }
    byModel[result.model].count++;
    byModel[result.model].tokens += result.tokens;
    byModel[result.model].cost += result.cost;
  });
  
  return {
    results,
    summary: {
      totalImages: images.length,
      totalTokens,
      totalCost,
      byModel
    }
  };
}

/**
 * Get pricing for a specific model
 */
export function getPricing(model: string = DEFAULT_MODEL): PricingConfig {
  const modelConfig = getModel(model);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${model}`);
  }
  return { costPer1kTokens: modelConfig.defaultCostPer1kTokens };
}

/**
 * Create a custom pricing configuration
 */
export function createPricing(costPer1kTokens: number): PricingConfig {
  if (costPer1kTokens <= 0) {
    throw new Error('Cost per 1k tokens must be positive');
  }
  
  return { costPer1kTokens };
}