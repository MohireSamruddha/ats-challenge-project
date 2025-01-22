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
      content: `Expert CV processor. Format CV sections:
      1. Professional Summary (3-4 sentences)
      2. Skills (Technical, Soft)
      3. Experience (reverse chronological)
      4. Education
      5. Optional: Certifications, Projects, Awards

      Format rules:
      - Clear headings
      - Experience: company, title, dates, 3-5 bullet points
      - Skills: categorized
      - Education: institution, degree, date
      - Use action verbs
      - Quantify achievements
      - Industry keywords
      - Professional tone
      - Clear spacing
      - No personal info`
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
        temperature: 0.7,
        max_tokens: 4000
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

  async analyzeStructure(cvContent: string): Promise<string> {
    const prompt = `Analyze CV structure:
    ${cvContent}

    List:
    1. Current sections
    2. Missing sections
    3. Format issues
    4. Enhancement areas`;
    
    return this.getCompletion(prompt);
  }

  async identifyPersonalInfo(cvContent: string): Promise<string> {
    const prompt = `Find personal info to anonymize:
    ${cvContent}

    List:
    1. Personal details found
    2. Suggested replacements
    3. Hidden personal info`;
    
    return this.getCompletion(prompt);
  }

  async enhanceContent(cvContent: string): Promise<string> {
    const prompt = `Enhance CV:
    ${cvContent}

    Make:
    1. Strong summary
    2. Categorized skills
    3. Quantified achievements
    4. Technical details
    5. Clear format`;

    return this.getCompletion(prompt);
  }

  async planReformatting(cvContent: string, structureAnalysis: string): Promise<string> {
    const prompt = `Analysis: ${structureAnalysis}
    CV: ${cvContent}

    Plan reformatting:
    1. Section order
    2. Content structure
    3. Format fixes
    4. Enhancements needed`;
    
    return this.getCompletion(prompt);
  }

  async executeChanges(
    cvContent: string, 
    personalInfo: string, 
    reformatPlan: string
  ): Promise<string> {
    const prompt = `Transform CV:
    - Anonymize: ${personalInfo}
    - Format: ${reformatPlan}
    - Content: ${cvContent}

    Use:
    1. # for sections
    2. * for bullets
    3. Action verbs
    4. Metrics
    5. Keywords`;
    
    return this.getCompletion(prompt);
  }

  async processCVWithSteps(cvContent: string): Promise<{
    structureAnalysis: string;
    personalInfo: string;
    reformatPlan: string;
    finalCV: string;
  }> {
    // Step 1: Analyze Structure
    const structureAnalysis = await this.analyzeStructure(cvContent);
    
    // Step 2: Identify Personal Information
    const personalInfo = await this.identifyPersonalInfo(cvContent);
    
    // Step 3: Plan Reformatting
    const reformatPlan = await this.planReformatting(cvContent, structureAnalysis);
    
    // Step 4: Execute Changes with Enhanced Content
    const finalCV = await this.executeChanges(cvContent, personalInfo, reformatPlan);
    
    return {
      structureAnalysis,
      personalInfo,
      reformatPlan,
      finalCV
    };
  }
} 