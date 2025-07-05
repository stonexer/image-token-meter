/**
 * Model configurations for different OpenAI Vision models
 */

export interface ModelConfig {
  /**
   * Model identifier
   */
  id: string;
  
  /**
   * Human-readable model name
   */
  name: string;
  
  /**
   * Base tokens for high detail mode
   */
  baseTokens: number;
  
  /**
   * Tokens per tile for high detail mode
   */
  tokensPerTile: number;
  
  /**
   * Size of each tile in pixels
   */
  tileSize: number;
  
  /**
   * Maximum dimension before scaling
   */
  maxDimension: number;
  
  /**
   * Target size for shortest side
   */
  shortSideTarget: number;
  
  /**
   * Tokens for low detail mode
   */
  lowDetailTokens: number;
  
  /**
   * Default cost per 1k input tokens in USD
   */
  defaultCostPer1kTokens: number;
  
  /**
   * Whether this model supports vision
   */
  supportsVision: boolean;
  
  /**
   * Additional notes about the model
   */
  notes?: string;
}

/**
 * Available models
 */
export const MODELS: Record<string, ModelConfig> = {
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 5.00,
    supportsVision: true,
    notes: 'Latest multimodal model with vision capabilities'
  },
  
  'gpt-4o-2024-05-13': {
    id: 'gpt-4o-2024-05-13',
    name: 'GPT-4o (2024-05-13)',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 5.00,
    supportsVision: true,
    notes: 'Specific version of GPT-4o'
  },
  
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 0.15,
    supportsVision: true,
    notes: 'Smaller, more affordable version of GPT-4o'
  },
  
  'gpt-4-vision-preview': {
    id: 'gpt-4-vision-preview',
    name: 'GPT-4 Vision Preview',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 10.00,
    supportsVision: true,
    notes: 'Original GPT-4 with vision capabilities'
  },
  
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 10.00,
    supportsVision: true,
    notes: 'GPT-4 Turbo with vision support'
  },
  
  'gpt-4-turbo-2024-04-09': {
    id: 'gpt-4-turbo-2024-04-09',
    name: 'GPT-4 Turbo (2024-04-09)',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 10.00,
    supportsVision: true,
    notes: 'Specific version of GPT-4 Turbo with vision'
  },
  
  'gpt-4-1106-vision-preview': {
    id: 'gpt-4-1106-vision-preview',
    name: 'GPT-4 Vision (1106)',
    baseTokens: 85,
    tokensPerTile: 170,
    tileSize: 512,
    maxDimension: 2048,
    shortSideTarget: 768,
    lowDetailTokens: 85,
    defaultCostPer1kTokens: 10.00,
    supportsVision: true,
    notes: 'November 2023 version of GPT-4 Vision'
  }
};

/**
 * Get a model configuration by ID
 */
export function getModel(modelId: string): ModelConfig | undefined {
  return MODELS[modelId];
}

/**
 * Get all available model IDs
 */
export function getAvailableModels(): string[] {
  return Object.keys(MODELS);
}

/**
 * Get all vision-enabled models
 */
export function getVisionModels(): ModelConfig[] {
  return Object.values(MODELS).filter(model => model.supportsVision);
}

/**
 * Default model ID
 */
export const DEFAULT_MODEL = 'gpt-4o';