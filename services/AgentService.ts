import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: "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", dangerouslyAllowBrowser: true
});

interface AgentStep {
  role: string;
  content: string;
}

export class CVAgent {
  private conversation: AgentStep[] = [];

  constructor() {
    // Initialize with system message defining the agent's capabilities
    this.conversation.push({
      role: "system",
      content: `Expert CV processor with multiple capabilities:
1. Anonymization:
- Remove only last names while preserving first names
- Keep other personal information intact

2. Formatting:
- Organize content into clear sections
- Apply consistent heading styles
- Structure bullet points uniformly
- Maintain clean spacing
- Preserve semantic HTML

3. Enhancement:
- Improve language clarity
- Strengthen impact of achievements
- Use active voice
- Maintain professional tone
- Keep factual content unchanged`
    });
  }

  private async getCompletion(prompt: string): Promise<string> {
    // Clear previous conversation to save tokens
    this.conversation = [this.conversation[0]];
    
    // Trim and clean the content to reduce tokens
    const cleanedPrompt = prompt
      .replace(/\n\s+/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
    
    this.conversation.push({ role: "user", content: cleanedPrompt });

    try {
      const completion = await openai.chat.completions.create({
        messages: this.conversation.map(step => ({
          role: step.role === "system" ? "system" : step.role === "user" ? "user" : "assistant",
          content: step.content
        })),
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_tokens: 16000
      });

      const response = completion.choices[0].message.content || "";
      this.conversation.push({ role: "assistant", content: response });
      return response;
    } catch (error: any) {
      if (typeof error.message === 'string' && error.message.includes('maximum context length')) {
        // Process in smaller chunks
        const chunks = this.splitContentIntoChunks(cleanedPrompt, 2000);
        let combinedResponse = '';
        
        for (const chunk of chunks) {
          const chunkResponse = await this.getCompletion(chunk);
          combinedResponse += chunkResponse + '\n';
        }
        
        return combinedResponse.trim();
      }
      throw error;
    }
  }

  private splitContentIntoChunks(content: string, maxChunkSize: number = 8000): string[] {
    const sections = content.split('\n\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const section of sections) {
      if ((currentChunk + section).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        // If a single section is too long, split it by lines
        if (section.length > maxChunkSize) {
          const lines = section.split('\n');
          let lineChunk = '';
          for (const line of lines) {
            if ((lineChunk + line).length > maxChunkSize) {
              chunks.push(lineChunk);
              lineChunk = line;
            } else {
              lineChunk += (lineChunk ? '\n' : '') + line;
            }
          }
          if (lineChunk) {
            chunks.push(lineChunk);
          }
        } else {
          currentChunk = section;
        }
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + section;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  async anonymizeLastNames(cvContent: string): Promise<string> {
    const prompt = `Remove ONLY last names from this CV, preserving all HTML formatting and other content exactly as is. Keep first names intact:
    ${cvContent}

    Rules:
    1. Only remove last names
    2. Keep first names
    3. Preserve all HTML tags and structure
    4. Don't modify any other content
    5. Don't change formatting`;
    
    return this.getCompletion(prompt);
  }

  async reformatCV(cvContent: string): Promise<string> {
    const prompt = `Reformat this CV HTML to have a consistent, professional layout while preserving the existing HTML structure. 
    
    ${cvContent}

    Requirements:
    1. Preserve all existing HTML tags and their structure exactly
    2. Keep all div positions and styling attributes intact
    3. Only modify text content organization within existing elements
    4. Maintain all PDF-specific positioning (left, top, etc.)
    5. Add semantic structure only within existing elements
    6. Keep all content and meaning intact
    7. Return the complete HTML with structure preserved`;

    return this.getCompletion(prompt);
  }

  async enhanceCV(cvContent: string): Promise<string> {
    const prompt = `Enhance this CV's language while strictly preserving HTML structure and positioning. 

    ${cvContent}

    Requirements:
    1. Keep all HTML tags and attributes exactly as they are
    2. Preserve all positioning and styling attributes
    3. Maintain PDF layout and structure
    4. Only modify the text content within existing elements
    5. Use active voice and professional language
    6. Keep all dates and facts unchanged
    7. Return the complete HTML with structure preserved`;

    return this.getCompletion(prompt);
  }

  async processCVWithSteps(cvContent: string): Promise<{
    originalContent: string;
    anonymizedContent: string;
    formattedContent: string;
    enhancedContent: string;
  }> {
    // Step 1: Anonymize
    const anonymizedContent = await this.anonymizeLastNames(cvContent);
    
    // Step 2: Reformat
    const formattedContent = await this.reformatCV(anonymizedContent);
    
    // Step 3: Enhance
    const enhancedContent = await this.enhanceCV(formattedContent);
    
    return {
      originalContent: cvContent,
      anonymizedContent,
      formattedContent,
      enhancedContent
    };
  }
} 