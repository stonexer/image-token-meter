/**
 * Image detail level for GPT-4o Vision API
 */
export type ImageDetail = 'high' | 'low' | 'auto';

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
   * Cost in USD based on current GPT-4o pricing
   */
  cost: number;
  
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
  };
}

/**
 * GPT-4o pricing configuration
 */
export interface PricingConfig {
  /**
   * Cost per 1000 input tokens in USD
   */
  costPer1kTokens: number;
}