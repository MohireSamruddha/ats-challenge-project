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
      content: `Expert CV processor with strict anonymization rules:

1. Anonymization:
   - Keep ONLY first names
   - Remove ALL last names, middle names, family names
   - Remove emails and social media
   - Handle names in any format or case
   - Preserve professional titles and credentials
   - Keep company and institution names intact

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
   - Keep factual content unchanged

Do not include any explanatory text in your response - return only the processed HTML.`
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
    const prompt = `Anonymize this CV by removing personally identifiable information while keeping the first name:

    ${cvContent}

    Strict anonymization rules:
    1. Remove ALL last names, middle names, and family names
    2. Keep ONLY the first name
    3. Remove:
       - email addresses
       - social media handles
       - phone numbers
       - addresses
    4. IMPORTANT: Preserve exactly as is:
       - ALL company names
       - ALL organization names
       - ALL educational institution names
       - ALL job titles
       - ALL professional certifications
    5. Handle various name formats:
       - ALL CAPS: "JOHN SMITH" → "JOHN"
       - Mixed case: "John Smith" → "John"
       - With titles: "Mr. John Smith" → "John"
       - With middle names: "John Robert Smith" → "John"
    5. Preserve:
       - All HTML formatting and structure
       - Professional titles and credentials
       - Company names
       - Educational institution names
    
    Return ONLY the anonymized HTML with no explanations.`;
    
    return this.getCompletion(prompt);
  }

  async reformatCV(cvContent: string): Promise<string> {
    const prompt = `Reformat this CV HTML into a clean, professional layout:

    ${cvContent}

    Requirements:
    1. Structure the content with clear sections:
       - Add first name at the top in <h1 class="cv-name">First Name</h1>
       - WORK HISTORY/EXPERIENCE (with dates right-aligned)
       - CAREER OBJECTIVE/SUMMARY
       - KEY SKILLS
       - EDUCATION
       - CERTIFICATIONS (if any)
       - Format job entries as:
       <div class="job-header">
         <div class="job-title">Company Name | Position</div>
         <div class="date">YYYY - YYYY</div>
       </div>
    
    2. Example format:
       <h1 class="cv-name">John</h1>
       ZMS Electrical | Electrician                         2022 - 2023

    3. CRITICAL - DO NOT MODIFY:
       - Company names must remain EXACTLY as in original
       - Job titles must remain EXACTLY as in original
       - Dates must remain in YYYY-YYYY format
       - Educational institutions
       - Certifications

    3. Only modify:
       - HTML structure and formatting
       - Section organization
       - Spacing and layout
       - List formatting

    4. HTML structure:
       - Wrap each section in <section class="cv-section">
       - Use <ul> and <li> for lists
       - Use <p> for paragraphs
       - Add appropriate class names for styling

    Return the complete HTML with improved formatting and structure ONLY.`;

    return this.getCompletion(prompt);
  }

  async enhanceCV(cvContent: string): Promise<string> {
    const prompt = `Enhance this CV's content while maintaining exact structure:

    ${cvContent}

    STRICT Requirements:
    1. DO NOT MODIFY under any circumstances:
       - First name at the top (<h1 class="cv-name">)
       - Company names (keep exactly as is)
       - Job titles (keep exactly as is)
       - Organization names
       - Dates and durations
       - Educational institutions
       - Certification names

    2. Only enhance:
       - Achievement descriptions
       - Skill descriptions
       - Summary/objective statements
       - Responsibility descriptions (while keeping core meaning)

    3. Enhancement guidelines:
       - Use strong action verbs
       - Quantify achievements where possible
       - Maintain professional tone
       - Keep all HTML formatting intact
       - Ensure first name remains in <h1> at top

    Return the enhanced CV with improved descriptions ONLY, keeping all company names and positions exactly as in the original.`;

    return this.getCompletion(prompt);
  }

  getFormattingCSS(): string {
    return `<style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        line-height: 1.6;
        margin: 0;
        padding: 0;
        background-color: #f9f9f9;
      }
      .cv-name {
        font-size: 2.5em;
        font-weight: bold;
        text-align: center;
        margin: 1em 0;
        color: #222;
      }
      .cv-section {
        margin: 1.5em 2em;
        padding: 1em;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .cv-section h2 {
        font-size: 1.5em;
        font-weight: bold;
        margin-bottom: 1em;
        color: #555;
        border-bottom: 2px solid #ddd;
        padding-bottom: 0.3em;
      }
      .job-entry {
        margin-bottom: 1.5em;
      }
      .job-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1em;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5em;
      }
      .date {
        color: #666;
        font-size: 0.9em;
      }
      .job-details {
        margin-left: 1.5em;
      }
      ul {
        list-style-type: circle;
        margin-left: 1.5em;
      }
      li {
        margin-bottom: 0.4em;
      }
      .job-title {
        font-size: 1.1em;
        color: #333;
      }
      .job-title span {
        font-weight: normal;
        color: #666;
      }
    </style>`;
  }

  async processCVWithSteps(cvContent: string): Promise<{
    originalContent: string;
    anonymizedContent: string;
    formattedContent: string;
    enhancedContent: string;
  }> {
    // Step 1: Anonymize the CV content first
    const anonymizedContent = await this.anonymizeLastNames(cvContent);
    console.log('Anonymization complete');
    
    // Step 2: Reformat the anonymized content
    let formattedContent = await this.reformatCV(anonymizedContent);
    console.log('Reformatting complete');
    formattedContent = this.getFormattingCSS() + formattedContent;
    
    // Step 3: Enhance the formatted content
    let enhancedContent = await this.enhanceCV(formattedContent);
    console.log('Enhancement complete');
    enhancedContent = this.getFormattingCSS() + enhancedContent;
    
    return {
      originalContent: cvContent,
      anonymizedContent,
      formattedContent,
      enhancedContent
    };
  }
} 