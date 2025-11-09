import { describe, it, expect, vi } from 'vitest';

// Mock React hooks
vi.mock('react', () => ({
  useEffect: vi.fn((callback) => callback()),
}));

// Import after mocking
import { useReactSourceLens } from '../lib/ReactSourceLens.js';

describe('useReactSourceLens', () => {
  it('should export the hook function', () => {
    expect(typeof useReactSourceLens).toBe('function');
  });

  it('should accept options parameter', () => {
    expect(() => {
      useReactSourceLens({ projectRoot: '/test' });
    }).not.toThrow();
  });
});
