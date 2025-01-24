declare module 'mammoth/mammoth.browser' {
  interface MammothOptions {
    arrayBuffer: ArrayBuffer;
  }

  interface MammothResult {
    value: string;
  }

  export function extractRawText(_options: MammothOptions): Promise<MammothResult>;
} 