import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import html2pdf from 'html2pdf.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function downloadAsPDF(content: string, firstName: string) {
  // Create a temporary container
  const container = document.createElement('div');
  
  // Add both the CSS and content
  const cssStyle = `
    <style>
      @page {
        size: A4;
        margin: 0;
      }
      * {
        box-sizing: border-box;
      }
      .pdf-container {
        width: 210mm;
        padding: 15mm;
        margin: 0 auto;
        font-family: Arial, sans-serif;
        line-height: 1.5;
      }
      .cv-name {
        font-size: 24pt !important;
        font-weight: bold !important;
        text-align: center !important;
        margin-bottom: 20pt !important;
      }
      .cv-section {
        margin-bottom: 15pt !important;
      }
      .cv-section h2 {
        font-size: 16pt !important;
        margin-bottom: 10pt !important;
      }
      .job-header {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 8pt !important;
      }
      .job-title {
        font-size: 12pt !important;
      }
      .date {
        font-size: 11pt !important;
      }
      p, li {
        font-size: 11pt !important;
        margin-bottom: 5pt !important;
        page-break-inside: avoid !important;
      }
      ul {
        margin: 0 0 10pt 20pt !important;
        padding: 0 !important;
      }
    </style>
  `;
  
  // Wrap content in a container div
  const wrappedContent = `
    <div class="pdf-container">
      ${content}
    </div>
  `;
  
  container.innerHTML = cssStyle + wrappedContent;
  document.body.appendChild(container);

  const options = {
    filename: `${firstName}_enhanced_cv.pdf`,
    image: { type: 'jpeg', quality: 1.0 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      logging: false,
      scrollY: -window.scrollY,
      windowWidth: 794, // A4 width in pixels at 96 DPI
      windowHeight: 1123,
      onclone: (clonedDoc) => {
        const element = clonedDoc.querySelector('.pdf-container');
        if (element) {
          element.style.transform = 'none';
          element.style.width = '210mm';
          element.style.minHeight = '297mm';
          element.style.margin = '0 auto';
          element.style.boxSizing = 'border-box';
          element.style.padding = '15mm';
          element.style.backgroundColor = 'white';
        }
      }
    },
    jsPDF: { 
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    }
  };

  try {
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 500));
    await html2pdf().set(options).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}
