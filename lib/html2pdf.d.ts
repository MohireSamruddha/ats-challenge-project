declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      windowWidth?: number;
      windowHeight?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      compress?: boolean;
      precision?: number;
      headingFontSize?: number; // Default heading font size is 14pt if not specified
      bodyFontSize?: number; // Default body font size is 12pt if not specified
    };
  }

  interface Html2Pdf {
    set(_options: Html2PdfOptions): Html2Pdf;
    from(_element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
    toPdf(): Html2Pdf;
    output(_type: string, _options?: { filename: string }): Promise<void>;
  }

  function html2pdf(): Html2Pdf;
  export = html2pdf;
}