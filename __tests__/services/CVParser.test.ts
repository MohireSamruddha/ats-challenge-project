import { CVParser } from '@/services/CVParser';
import { describe, expect, test, beforeEach, afterEach } from "bun:test";

interface MockWindow {
  TextDecoder: typeof TextDecoder;
  Worker: typeof Worker;
  URL: {
    createObjectURL: () => string;
  };
}

describe('CVParser', () => {
  let mockWindow: MockWindow;

  beforeEach(() => {
    mockWindow = {
      TextDecoder: TextDecoder,
      Worker: class {},
      URL: {
        createObjectURL: () => 'mock-url'
      }
    };
    global.window = mockWindow as unknown as typeof window;
  });

  afterEach(() => {
    global.window = undefined as unknown as typeof window;
  });

  test('should throw error when parsing on server side', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    global.window = undefined as unknown as typeof window;
    
    await expect(CVParser.parseFile(file)).rejects.toThrow('File parsing must be done on client side');
  });

  test('should throw error for unsupported file types', async () => {
    const file = new File(['test'], 'test.xyz', { type: 'application/xyz' });
    await expect(CVParser.parseFile(file)).rejects.toThrow('Unsupported file type');
  });
});