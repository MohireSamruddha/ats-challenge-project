import { CVParser } from '@/services/CVParser';
import { describe, expect, test, beforeEach, afterEach } from "bun:test";

describe('CVParser', () => {
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      TextDecoder: TextDecoder,
      Worker: class {},
      URL: {
        createObjectURL: () => 'mock-url'
      }
    };
    global.window = mockWindow;
  });

  afterEach(() => {
    global.window = undefined;
  });

  test('should throw error when parsing on server side', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    global.window = undefined;
    
    await expect(CVParser.parseFile(file)).rejects.toThrow('File parsing must be done on client side');
  });

  test('should throw error for unsupported file types', async () => {
    const file = new File(['test'], 'test.xyz', { type: 'application/xyz' });
    await expect(CVParser.parseFile(file)).rejects.toThrow('Unsupported file type');
  });
});