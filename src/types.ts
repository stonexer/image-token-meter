/**
 * Image detail level for OpenAI Vision API
 */
export type ImageDetail = 'high' | 'low' | 'auto';

/**
 * Supported OpenAI Vision models
 */
export type VisionModel = 
  | 'gpt-4o'
  | 'gpt-4o-2024-05-13'
  | 'gpt-4o-mini'
  | 'gpt-4-vision-preview'
  | 'gpt-4-turbo'
  | 'gpt-4-turbo-2024-04-09'
  | 'gpt-4-1106-vision-preview'
  | string; // Allow custom model strings

/**
 * Input parameters for calculating image tokens
 */
export interface ImageTokenInput {
  /**
   * Width of the image in pixels
   */
  width: number;
  
  /**
   * Height of the image in pixels
   */
  height: number;
  
  /**
   * Detail level - 'high' for full resolution, 'low' for 512x512, 'auto' defaults to 'high'
   * @default 'high'
   */
  detail?: ImageDetail;
  
  /**
   * Model to calculate tokens for
   * @default 'gpt-4o'
   */
  model?: VisionModel;
}

/**
 * Result of image token calculation
 */
export interface ImageTokenResult {
  /**
   * Total number of tokens consumed
   */
  tokens: number;
  
  /**
   * Cost in USD based on model pricing
   */
  cost: number;
  
  /**
   * Model used for calculation
   */
  model: string;
  
  /**
   * Human-readable model name
   */
  modelName: string;
  
  /**
   * Calculation details
   */
  details: {
    /**
     * Original image dimensions
     */
    originalSize: {
      width: number;
      height: number;
    };
    
    /**
     * Resized image dimensions (after scaling)
     */
    resizedSize: {
      width: number;
      height: number;
    };
    
    /**
     * Number of tiles in each dimension
     */
    tiles: {
      width: number;
      height: number;
      total: number;
    };
    
    /**
     * Base tokens (always 85 for high detail)
     */
    baseTokens: number;
    
    /**
     * Tokens per tile (always 170 for high detail)
     */
    tokensPerTile: number;
    
    /**
     * Detail level used
     */
    detailLevel: ImageDetail;
  };
}

/**
 * Pricing configuration
 */
export interface PricingConfig {
  /**
   * Cost per 1000 input tokens in USD
   */
  costPer1kTokens: number;
}

/**
 * Batch calculation result
 */
export interface BatchCalculationResult {
  /**
   * Individual results for each image
   */
  results: ImageTokenResult[];
  
  /**
   * Summary statistics
   */
  summary: {
    /**
     * Total number of images
     */
    totalImages: number;
    
    /**
     * Total tokens across all images
     */
    totalTokens: number;
    
    /**
     * Total cost across all images
     */
    totalCost: number;
    
    /**
     * Breakdown by model
     */
    byModel: Record<string, {
      count: number;
      tokens: number;
      cost: number;
    }>;
  };
}