import { ImageTokenInput, ImageTokenResult, PricingConfig } from './types';

/**
 * Default GPT-4o pricing as of 2024
 */
const DEFAULT_PRICING: PricingConfig = {
  costPer1kTokens: 5.00 // $5.00 per 1K input tokens for GPT-4o
};

/**
 * Constants for token calculation
 */
const CONSTANTS = {
  BASE_TOKENS: 85,
  TOKENS_PER_TILE: 170,
  TILE_SIZE: 512,
  MAX_DIMENSION: 2048,
  SHORT_SIDE_TARGET: 768,
  LOW_DETAIL_TOKENS: 85
} as const;

/**
 * Calculate the number of tokens consumed by an image in GPT-4o
 * Based on OpenAI's documentation: https://platform.openai.com/docs/guides/images-vision
 * 
 * @param input - Image dimensions and detail level
 * @param pricing - Optional pricing configuration
 * @returns Token count and cost calculation
 */
export function calculateImageTokens(
  input: ImageTokenInput,
  pricing: PricingConfig = DEFAULT_PRICING
): ImageTokenResult {
  const { width, height, detail = 'high' } = input;
  
  // Validate input
  if (width <= 0 || height <= 0) {
    throw new Error('Image dimensions must be positive numbers');
  }
  
  // For low detail, always return 85 tokens
  if (detail === 'low') {
    const tokens = CONSTANTS.LOW_DETAIL_TOKENS;
    const cost = (tokens / 1000) * pricing.costPer1kTokens;
    
    return {
      tokens,
      cost,
      details: {
        originalSize: { width, height },
        resizedSize: { width: 512, height: 512 },
        tiles: { width: 1, height: 1, total: 1 },
        baseTokens: tokens,
        tokensPerTile: 0
      }
    };
  }
  
  // For high detail or auto (which defaults to high)
  const { resizedWidth, resizedHeight } = resizeImage(width, height);
  
  // Calculate number of tiles
  const tilesWidth = Math.ceil(resizedWidth / CONSTANTS.TILE_SIZE);
  const tilesHeight = Math.ceil(resizedHeight / CONSTANTS.TILE_SIZE);
  const totalTiles = tilesWidth * tilesHeight;
  
  // Calculate total tokens
  const tokens = CONSTANTS.BASE_TOKENS + (CONSTANTS.TOKENS_PER_TILE * totalTiles);
  
  // Calculate cost
  const cost = (tokens / 1000) * pricing.costPer1kTokens;
  
  return {
    tokens,
    cost,
    details: {
      originalSize: { width, height },
      resizedSize: { width: resizedWidth, height: resizedHeight },
      tiles: {
        width: tilesWidth,
        height: tilesHeight,
        total: totalTiles
      },
      baseTokens: CONSTANTS.BASE_TOKENS,
      tokensPerTile: CONSTANTS.TOKENS_PER_TILE
    }
  };
}

/**
 * Resize image dimensions according to GPT-4o rules
 * 
 * @param width - Original width
 * @param height - Original height
 * @returns Resized dimensions
 */
function resizeImage(width: number, height: number): { resizedWidth: number; resizedHeight: number } {
  let resizedWidth = width;
  let resizedHeight = height;
  
  // Step 1: Scale down to fit within 2048x2048 square if necessary
  if (resizedWidth > CONSTANTS.MAX_DIMENSION || resizedHeight > CONSTANTS.MAX_DIMENSION) {
    const aspectRatio = resizedWidth / resizedHeight;
    
    if (aspectRatio > 1) {
      // Width is larger
      resizedWidth = CONSTANTS.MAX_DIMENSION;
      resizedHeight = Math.floor(CONSTANTS.MAX_DIMENSION / aspectRatio);
    } else {
      // Height is larger or square
      resizedHeight = CONSTANTS.MAX_DIMENSION;
      resizedWidth = Math.floor(CONSTANTS.MAX_DIMENSION * aspectRatio);
    }
  }
  
  // Step 2: Scale so shortest side is 768px if both dimensions exceed 768px
  if (resizedWidth > CONSTANTS.SHORT_SIDE_TARGET && resizedHeight > CONSTANTS.SHORT_SIDE_TARGET) {
    const aspectRatio = resizedWidth / resizedHeight;
    
    if (aspectRatio > 1) {
      // Width is larger, scale height to 768
      resizedHeight = CONSTANTS.SHORT_SIDE_TARGET;
      resizedWidth = Math.floor(CONSTANTS.SHORT_SIDE_TARGET * aspectRatio);
    } else {
      // Height is larger or square, scale width to 768
      resizedWidth = CONSTANTS.SHORT_SIDE_TARGET;
      resizedHeight = Math.floor(CONSTANTS.SHORT_SIDE_TARGET / aspectRatio);
    }
  }
  
  return { resizedWidth, resizedHeight };
}

/**
 * Calculate tokens for multiple images
 * 
 * @param images - Array of image inputs
 * @param pricing - Optional pricing configuration
 * @returns Array of results and total summary
 */
export function calculateBatchImageTokens(
  images: ImageTokenInput[],
  pricing: PricingConfig = DEFAULT_PRICING
) {
  const results = images.map(image => calculateImageTokens(image, pricing));
  
  const totalTokens = results.reduce((sum, result) => sum + result.tokens, 0);
  const totalCost = results.reduce((sum, result) => sum + result.cost, 0);
  
  return {
    results,
    summary: {
      totalImages: images.length,
      totalTokens,
      totalCost
    }
  };
}

/**
 * Get current pricing configuration
 */
export function getPricing(): PricingConfig {
  return { ...DEFAULT_PRICING };
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