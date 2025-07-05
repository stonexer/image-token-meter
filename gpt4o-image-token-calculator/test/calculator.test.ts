import { describe, it, expect } from 'vitest';
import { calculateImageTokens, calculateBatchImageTokens, createPricing } from '../src';

describe('calculateImageTokens', () => {
  describe('high detail mode', () => {
    it('should calculate tokens for small images (fits in one tile)', () => {
      const result = calculateImageTokens({
        width: 512,
        height: 512,
        detail: 'high'
      });
      
      expect(result.tokens).toBe(255); // 85 + 170 * 1
      expect(result.details.tiles.total).toBe(1);
      expect(result.details.resizedSize).toEqual({ width: 512, height: 512 });
    });
    
    it('should calculate tokens for images from OpenAI examples', () => {
      // Example from search results: 767x767
      const result1 = calculateImageTokens({
        width: 767,
        height: 767,
        detail: 'high'
      });
      
      expect(result1.tokens).toBe(765); // 85 + 170 * 4
      expect(result1.details.tiles.total).toBe(4);
      
      // Example: 900x900
      const result2 = calculateImageTokens({
        width: 900,
        height: 900,
        detail: 'high'
      });
      
      expect(result2.tokens).toBe(765); // Same as 767x767 due to scaling
      expect(result2.details.tiles.total).toBe(4);
    });
    
    it('should handle large images with proper scaling', () => {
      // Example: 3000x1200
      const result = calculateImageTokens({
        width: 3000,
        height: 1200,
        detail: 'high'
      });
      
      // First scales to fit 2048x2048, then shortest side to 768
      expect(result.tokens).toBe(1445); // 85 + 170 * 8
      expect(result.details.tiles.total).toBe(8);
      expect(result.details.resizedSize.height).toBe(768);
    });
    
    it('should handle portrait orientation', () => {
      // Example: 3000x5000
      const result = calculateImageTokens({
        width: 3000,
        height: 5000,
        detail: 'high'
      });
      
      // First scales to fit 2048x2048, then shortest side to 768
      expect(result.tokens).toBe(1105); // 85 + 170 * 6
      expect(result.details.tiles.total).toBe(6);
      expect(result.details.resizedSize.width).toBe(768);
    });
    
    it('should handle exact tile boundaries', () => {
      const result = calculateImageTokens({
        width: 1024,
        height: 1024,
        detail: 'high'
      });
      
      // Scales to 768x768, which is 2x2 tiles
      expect(result.tokens).toBe(765); // 85 + 170 * 4
      expect(result.details.tiles.width).toBe(2);
      expect(result.details.tiles.height).toBe(2);
    });
  });
  
  describe('low detail mode', () => {
    it('should always return 85 tokens for low detail', () => {
      const sizes = [
        { width: 100, height: 100 },
        { width: 512, height: 512 },
        { width: 4096, height: 8192 },
      ];
      
      sizes.forEach(size => {
        const result = calculateImageTokens({
          ...size,
          detail: 'low'
        });
        
        expect(result.tokens).toBe(85);
        expect(result.details.resizedSize).toEqual({ width: 512, height: 512 });
      });
    });
  });
  
  describe('auto detail mode', () => {
    it('should default to high detail for auto mode', () => {
      const result = calculateImageTokens({
        width: 1024,
        height: 768,
        detail: 'auto'
      });
      
      expect(result.tokens).toBeGreaterThan(85);
      expect(result.details.tiles.total).toBeGreaterThan(1);
    });
  });
  
  describe('cost calculation', () => {
    it('should calculate cost with default pricing', () => {
      const result = calculateImageTokens({
        width: 512,
        height: 512,
        detail: 'high'
      });
      
      // 255 tokens at $5.00 per 1k tokens
      expect(result.cost).toBeCloseTo(255 / 1000 * 5.00, 4);
    });
    
    it('should calculate cost with custom pricing', () => {
      const customPricing = createPricing(2.50); // $2.50 per 1k tokens
      const result = calculateImageTokens({
        width: 512,
        height: 512,
        detail: 'high'
      }, customPricing);
      
      expect(result.cost).toBeCloseTo(255 / 1000 * 2.50, 4);
    });
  });
  
  describe('edge cases', () => {
    it('should handle square images', () => {
      const result = calculateImageTokens({
        width: 2048,
        height: 2048,
        detail: 'high'
      });
      
      // Scales to 768x768
      expect(result.details.resizedSize).toEqual({ width: 768, height: 768 });
      expect(result.tokens).toBe(765); // 85 + 170 * 4
    });
    
    it('should handle very small images', () => {
      const result = calculateImageTokens({
        width: 100,
        height: 100,
        detail: 'high'
      });
      
      expect(result.tokens).toBe(255); // 85 + 170 * 1
      expect(result.details.tiles.total).toBe(1);
    });
    
    it('should throw error for invalid dimensions', () => {
      expect(() => calculateImageTokens({
        width: 0,
        height: 100,
        detail: 'high'
      })).toThrow('Image dimensions must be positive numbers');
      
      expect(() => calculateImageTokens({
        width: -100,
        height: 100,
        detail: 'high'
      })).toThrow('Image dimensions must be positive numbers');
    });
  });
});

describe('calculateBatchImageTokens', () => {
  it('should calculate tokens for multiple images', () => {
    const images = [
      { width: 512, height: 512, detail: 'high' as const },
      { width: 1024, height: 768, detail: 'high' as const },
      { width: 2048, height: 2048, detail: 'low' as const }
    ];
    
    const result = calculateBatchImageTokens(images);
    
    expect(result.results).toHaveLength(3);
    expect(result.summary.totalImages).toBe(3);
    
    const expectedTotal = 255 + result.results[1].tokens + 85;
    expect(result.summary.totalTokens).toBe(expectedTotal);
  });
  
  it('should calculate total cost correctly', () => {
    const images = [
      { width: 512, height: 512 },
      { width: 512, height: 512 }
    ];
    
    const result = calculateBatchImageTokens(images);
    
    expect(result.summary.totalTokens).toBe(510); // 255 * 2
    expect(result.summary.totalCost).toBeCloseTo(510 / 1000 * 5.00, 4);
  });
});