'use client';

import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist';
import { GlobalWorkerOptions } from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface ParsedCV {
  content: string;
  firstName: string | null;
  html: string;
  originalHtml: string;
}

export class CVParser {
  async parse(file: File): Promise<ParsedResult> {
    return CVParser.parseFile(file);
  }

  private async parsePDF(file: File) {
    // Implement PDF parsing logic
    // You might want to use pdf.js or similar library
  }

  private async parseDocx(file: File) {
    const buffer = await file.arrayBuffer();
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer: buffer }),  // Gets plain text
      mammoth.convertToHtml({ arrayBuffer: buffer })    // Gets HTML
    ]);
  }

  static async parseFile(file: File): Promise<ParsedCV> {
    // Ensure we're on client side
    if (typeof window === 'undefined') {
      throw new Error('File parsing must be done on client side');
    }

    const fileType = file.type;
    const buffer = await file.arrayBuffer();
    const { text, html, originalHtml } = await this.parseContent(fileType, buffer);
    const firstName = this.extractFirstName(text);

    return {
      content: this.anonymizeContent(text, firstName),
      firstName,
      html: this.anonymizeContent(html, firstName),
      originalHtml: originalHtml
    };
  }

  private static async parseContent(fileType: string, buffer: ArrayBuffer): Promise<{ text: string, html: string, originalHtml: string }> {
    switch (fileType) {
      case 'application/pdf':
        return this.parsePDF(buffer);
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.parseDocx(buffer);
      case 'application/msword':
        return this.parseDoc();
      case 'text/plain':
        return this.parseTxt(buffer);
      default:
        throw new Error('Unsupported file type');
    }
  }

  private static extractFirstName(content: string): string | null {
    try {
      // Split content into lines and clean them
      const lines = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      console.log('Processing content:', content);
      console.log('Lines found:', lines);

      // First, try to find a name in the first paragraph
      const firstParagraph = lines.find(line => 
        line.includes('engineer') || 
        line.includes('professional') || 
        line.includes('experience')
      );

      if (firstParagraph) {
        console.log('Analyzing first paragraph:', firstParagraph);
        // Look for words that are likely to be names (capitalized, 3+ chars, not common words)
        const words = firstParagraph.split(/\s+/);
        const commonWords = ['Dedicated', 'Professional', 'Summary', 'CV', 'Resume'];
        
        for (const word of words) {
          if (word.match(/^[A-Z][a-z]{2,}$/) && !commonWords.includes(word)) {
            console.log('Found potential name:', word);
            return word;
          }
        }
      }

      // If no name found in first paragraph, try looking at the beginning
      for (const line of lines.slice(0, 5)) {
        // Look for a standalone capitalized word that might be a name
        const nameMatch = line.match(/^[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,})*$/);
        if (nameMatch && !line.includes('Summary') && !line.includes('CV')) {
          console.log('Found name in header:', nameMatch[0]);
          return nameMatch[0].split(/\s+/)[0];
        }
      }

      // If still no name found, try extracting from the professional summary
      const summaryMatch = content.match(/(?:engineer|professional)\s+([A-Z][a-z]{2,})/i);
      if (summaryMatch && summaryMatch[1]) {
        console.log('Found name in summary:', summaryMatch[1]);
        return summaryMatch[1];
      }

      console.log('No name found in content');
      return null;
    } catch (error) {
      console.error('Error extracting name:', error);
      return null;
    }
  }

  private static anonymizeContent(content: string, firstName: string | null): string {
    if (!firstName) return content;

    try {
      // Look for patterns that might be full names
      const patterns = [
        // First name followed by 1-2 capitalized words
        new RegExp(`${firstName}\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?`, 'g'),
        // First name at the start of a line followed by capitals
        new RegExp(`^${firstName}\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?`, 'gm')
      ];

      let anonymizedContent = content;
      patterns.forEach(pattern => {
        anonymizedContent = anonymizedContent.replace(pattern, firstName);
      });

      return anonymizedContent;
    } catch (error) {
      console.error('Error anonymizing content:', error);
      return content;
    }
  }

  private static async parsePDF(buffer: ArrayBuffer): Promise<{ text: string, html: string, originalHtml: string }> {
    const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    let html = '<div class="pdf-content">';
    let originalHtml = '<div class="pdf-content">';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Add page wrapper with proper styling
      html += `<div class="pdf-page" style="position: relative; width: ${viewport.width}px; height: ${viewport.height}px;" data-page="${i}">`;
      originalHtml += `<div class="pdf-page" style="position: relative; width: ${viewport.width}px; height: ${viewport.height}px;" data-page="${i}">`;
      
      let lastY: number | null = null;
      let currentParagraph = '';
      let currentOriginalParagraph = '';

      // Process each text item with positioning
      content.items
        .filter((item): item is TextItem => 'str' in item)
        .forEach((item) => {
          const [, , , , x, y] = item.transform;
          text += item.str + ' ';
          
          // Create positioned text elements
          const textElement = `<span style="position: absolute; left: ${x}px; top: ${viewport.height - y}px; font-size: ${item.height}px;">${item.str}</span>`;
          
          // Check if we need to start a new paragraph based on Y position
          if (lastY !== null && Math.abs(lastY - y) > 5) {
            if (currentParagraph.trim()) {
              html += `<div class="pdf-line" style="position: relative;">${currentParagraph.trim()}</div>`;
              originalHtml += `<div class="pdf-line" style="position: relative;">${currentOriginalParagraph.trim()}</div>`;
              currentParagraph = '';
              currentOriginalParagraph = '';
            }
          }
          
          currentParagraph += textElement;
          currentOriginalParagraph += textElement;
          lastY = y;
        });

      // Add any remaining paragraph
      if (currentParagraph.trim()) {
        html += `<div class="pdf-line" style="position: relative;">${currentParagraph.trim()}</div>`;
        originalHtml += `<div class="pdf-line" style="position: relative;">${currentOriginalParagraph.trim()}</div>`;
      }

      html += '</div>'; // Close page div
      originalHtml += '</div>'; // Close page div
      text += '\n';
    }
    
    html += '</div>';
    originalHtml += '</div>';
    
    return { text, html, originalHtml };
  }

  private static async parseDocx(buffer: ArrayBuffer): Promise<{ text: string, html: string, originalHtml: string }> {
    const [textResult, htmlResult] = await Promise.all([
      mammoth.extractRawText({ arrayBuffer: buffer }),
      mammoth.convertToHtml({ arrayBuffer: buffer })
    ]);

    return {
      text: textResult.value,
      html: htmlResult.value,
      originalHtml: htmlResult.value
    };
  }

  private static async parseDoc(): Promise<{ text: string, html: string, originalHtml: string }> {
    throw new Error('Please save your .doc file as .docx and try again');
  }

  private static async parseTxt(buffer: ArrayBuffer): Promise<{ text: string, html: string, originalHtml: string }> {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    const htmlContent = '<div class="txt-content">' + 
      text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => `<p>${line}</p>`)
        .join('\n') +
      '</div>';
    
    return { 
      text, 
      html: htmlContent,
      originalHtml: htmlContent 
    };
  }
} 