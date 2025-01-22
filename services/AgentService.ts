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
    const prompt = `Reformat this CV HTML into a clean, professional layout:

    ${cvContent}

    Requirements:
    1. Structure the content with clear sections:
       - WORK HISTORY/EXPERIENCE (with dates right-aligned)
       - CAREER OBJECTIVE/SUMMARY
       - KEY SKILLS
       - EDUCATION
       - CERTIFICATIONS (if any)

    2. Formatting rules:
       - Use consistent heading styles (<h2> for main sections)
       - Create proper spacing between sections (margin-bottom: 1.5em)
       - Align dates to the right using <span class="date">
       - Use bullet points for skills and experiences
       - Maintain clean paragraph spacing
       - Ensure job titles and companies are bold

    3. HTML structure:
       - Wrap each section in <section class="cv-section">
       - Use <ul> and <li> for lists
       - Use <p> for paragraphs
       - Add appropriate class names for styling

    4. Example structure:
       <section class="cv-section">
         <h2>WORK HISTORY</h2>
         <div class="job-entry">
           <div class="job-header">
             <strong>Job Title</strong>
             <span class="date">2022-2023</span>
           </div>
           <ul class="job-details">
             <li>Achievement or responsibility</li>
           </ul>
         </div>
       </section>

    5. Critical requirements:
       - Preserve all content exactly as is
       - Maintain any existing styling attributes
       - Keep all positioning information intact
       - Only reorganize the structure within elements

    Return the complete HTML with improved formatting and structure.`;

    return this.getCompletion(prompt);
  }

  async enhanceCV(cvContent: string): Promise<string> {
    const prompt = `Enhance this CV's content while maintaining exact structure:

    ${cvContent}

    Requirements:
    1. Use strong action verbs
    2. Quantify achievements where possible
    3. Maintain professional tone
    4. Keep all HTML tags and attributes unchanged
    5. Preserve all positioning and styling
    6. Only modify text content within elements
    7.Return the enhanced CV content with improved language and quantified achievements.
    8. Focus on:
       - Clear accomplishments
       - Technical skills
       - Professional experience
       - Educational background
    9. Return complete HTML with enhanced content`;

    return this.getCompletion(prompt);
  }

  private getFormattingCSS(): string {
    return `
      <style>
        .cv-section {
          margin-bottom: 1.5em;
        }
        .cv-section h2 {
          font-size: 1.2em;
          font-weight: bold;
          margin-bottom: 1em;
          border-bottom: 1px solid #ccc;
        }
        .job-entry {
          margin-bottom: 1em;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5em;
        }
        .date {
          color: #666;
        }
        .job-details {
          margin-left: 1.5em;
        }
        ul {
          list-style-type: disc;
          margin-left: 1.2em;
        }
        li {
          margin-bottom: 0.3em;
        }
      </style>
    `;
  }

  async processCVWithSteps(cvContent: string): Promise<{
    originalContent: string;
    anonymizedContent: string;
    formattedContent: string;
    enhancedContent: string;
  }> {
    // Step 1: Anonymize
    const anonymizedContent = await this.anonymizeLastNames(cvContent);
    
    // Step 2: Reformat and add CSS
    let formattedContent = await this.reformatCV(anonymizedContent);
    formattedContent = this.getFormattingCSS() + formattedContent;
    
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