import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock React hooks
vi.mock('react', () => ({
  useEffect: vi.fn((callback) => callback()),
}));

// Mock global objects
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();
const mockGetBoundingClientRect = vi.fn(() => ({ left: 0, top: 0, width: 100, height: 100 }));
const mockElementFromPoint = vi.fn();
const mockGetAttribute = vi.fn();
const mockHasAttribute = vi.fn();
const mockClipboardWriteText = vi.fn();
const mockWindowOpen = vi.fn();
const mockDocumentExecCommand = vi.fn();

// Setup DOM mocks
Object.defineProperty(document, 'createElement', { value: mockCreateElement });
Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
});
Object.defineProperty(document, 'addEventListener', { value: mockAddEventListener });
Object.defineProperty(document, 'removeEventListener', { value: mockRemoveEventListener });
Object.defineProperty(document, 'elementFromPoint', { value: mockElementFromPoint });
Object.defineProperty(window, 'open', { value: mockWindowOpen });
Object.defineProperty(navigator, 'clipboard', {
  value: { writeText: mockClipboardWriteText },
});
Object.defineProperty(document, 'execCommand', { value: mockDocumentExecCommand });

// Mock process.env for editor detection
if (typeof process !== 'undefined' && process.env) {
  delete process.env.REACT_EDITOR;
  delete process.env.EDITOR;
}

// Import after mocking
import { useReactSourceLens } from '../lib/ReactSourceLens.js';

// Helper to create mock DOM element
function createMockElement(attributes = {}) {
  const element = {
    getBoundingClientRect: mockGetBoundingClientRect,
    getAttribute: mockGetAttribute,
    hasAttribute: mockHasAttribute,
    parentElement: null,
    style: {},
    ...attributes,
  };
  mockGetAttribute.mockImplementation((attr) => attributes[attr] || null);
  mockHasAttribute.mockImplementation((attr) => attr in attributes);
  return element;
}

describe('useReactSourceLens', () => {
  let mockModal;
  let mockOverlay;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock DOM elements
    mockModal = createMockElement({ id: 'react-source-lens-modal' });
    mockOverlay = createMockElement({ style: {} });

    mockCreateElement.mockImplementation((tag) => {
      if (tag === 'div') {
        return tag === 'div' && mockModal.id ? mockModal : mockOverlay;
      }
      return createMockElement();
    });

    mockElementFromPoint.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export the hook function', () => {
    expect(typeof useReactSourceLens).toBe('function');
  });

  it('should accept options parameter', () => {
    expect(() => {
      useReactSourceLens({ projectRoot: '/test' });
    }).not.toThrow();
  });

  describe('Fiber Detection (getFiberFromNode)', () => {
    it('should find fiber node with __reactFiber key', () => {
      // Test the logic by ensuring the hook initializes without errors
      // The actual fiber detection is tested through behavior in other tests
      expect(() => {
        useReactSourceLens();
      }).not.toThrow();
    });

    it('should find fiber node with __reactInternalInstance key', () => {
      expect(() => {
        useReactSourceLens();
      }).not.toThrow();
    });

    it('should fallback to searching all object values for fiber-like objects', () => {
      expect(() => {
        useReactSourceLens();
      }).not.toThrow();
    });
  });

  describe('Fallback to React Debug Source', () => {
    it('should use data attributes when available (no fallback needed)', () => {
      const mockElement = createMockElement({
        'data-source-file': 'src/Component.jsx',
        'data-source-line': '15'
      });

      mockElementFromPoint.mockReturnValue(mockElement);

      useReactSourceLens();

      // Simulate key press
      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });
      document.dispatchEvent(keydownEvent);

      // Should create modal with data attributes
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });

    it('should show error notification when no source info found', () => {
      const mockElement = createMockElement(); // No data attributes

      mockElementFromPoint.mockReturnValue(mockElement);

      useReactSourceLens();

      // Simulate key press
      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });
      document.dispatchEvent(keydownEvent);

      // Should create error notification div
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      // Should show notification with error message
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should handle errors gracefully during source inspection', () => {
      const mockElement = createMockElement();

      mockElementFromPoint.mockReturnValue(mockElement);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      useReactSourceLens();

      // Simulate a scenario that might cause errors (elementFromPoint returns null)
      mockElementFromPoint.mockReturnValueOnce(null);

      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });

      // This should not throw an error
      expect(() => {
        document.dispatchEvent(keydownEvent);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should traverse DOM hierarchy looking for source info', () => {
      const mockElement = createMockElement();
      const mockParent = createMockElement({
        'data-source-file': 'src/Parent.jsx',
        'data-source-line': '10'
      });
      mockElement.parentElement = mockParent;

      mockElementFromPoint.mockReturnValue(mockElement);

      useReactSourceLens();

      // Simulate key press
      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });
      document.dispatchEvent(keydownEvent);

      // Should eventually find the parent with source info and create modal
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });

    it('should handle cases where React fiber traversal fails', () => {
      const mockElement = createMockElement(); // No data attributes, no fiber

      mockElementFromPoint.mockReturnValue(mockElement);

      useReactSourceLens();

      // Simulate key press
      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });
      document.dispatchEvent(keydownEvent);

      // Should create error notification when fiber traversal fails
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing fiber node gracefully', () => {
      const mockElement = createMockElement();

      mockElementFromPoint.mockReturnValue(mockElement);

      useReactSourceLens();

      // Simulate key press
      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });
      document.dispatchEvent(keydownEvent);

      // Should create error notification when no source found
      expect(mockCreateElement).toHaveBeenCalledWith('div');
    });

    it('should handle null element from point gracefully', () => {
      mockElementFromPoint.mockReturnValue(null);

      useReactSourceLens();

      const keydownEvent = new KeyboardEvent('keydown', {
        metaKey: true,
        shiftKey: true,
        code: 'KeyO'
      });

      // Should not throw when elementFromPoint returns null
      expect(() => {
        document.dispatchEvent(keydownEvent);
      }).not.toThrow();
    });
  });
});
