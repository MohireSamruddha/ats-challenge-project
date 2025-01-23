import { CVAgent } from '@/services/AgentService';
import { describe, expect, test, beforeEach, mock } from "bun:test";

describe('CVAgent', () => {
  let agent: CVAgent;

  beforeEach(() => {
    mock.module('openai', () => ({
      default: class MockOpenAI {
        chat = {
          completions: {
            create: async ({ messages }: { messages: any[] }) => {
              const lastMessage = messages[messages.length - 1];
              
              if (lastMessage.content.includes('Anonymize this CV')) {
                return {
                  choices: [{
                    message: {
                      content: `<h1 class="cv-name">John</h1>
                        <p>Software Engineer at Tech Corp</p>
                        <p>University of Technology</p>`
                    }
                  }]
                };
              } else if (lastMessage.content.includes('Reformat this CV')) {
                return {
                  choices: [{
                    message: {
                      content: `<section class="cv-section">
                        <h2>EXPERIENCE</h2>
                        <div class="job-header">
                          <div class="job-title">Tech Corp | Software Engineer</div>
                          <div class="date">2020 - 2023</div>
                        </div>
                      </section>`
                    }
                  }]
                };
              } else if (lastMessage.content.includes('Enhance this CV')) {
                return {
                  choices: [{
                    message: {
                      content: `<section class="cv-section">
                        <h2>EXPERIENCE</h2>
                        <div class="job-header">
                          <div class="job-title">Senior Software Engineer at Tech Corp</div>
                          <div class="achievements">
                            <ul>
                              <li>Led development of core platform features</li>
                              <li>Improved system performance by 40%</li>
                            </ul>
                          </div>
                        </div>
                      </section>`
                    }
                  }]
                };
              }
            }
          }
        }
      }
    }));

    agent = new CVAgent();
  });

  test('should anonymize correctly', async () => {
    const testCV = `
      <h1>John Smith</h1>
      <p>Email: john.smith@example.com</p>
      <p>Software Engineer at Tech Corp</p>
      <p>University of Technology</p>
    `;
    const result = await agent.anonymizeLastNames(testCV);
    
    expect(result).toContain('John');
    expect(result).toContain('Software Engineer at Tech Corp');
    expect(result).toContain('University of Technology');
    expect(result).not.toContain('Smith');
    expect(result).not.toContain('john.smith@example.com');
  });

  test('should reformat CV with proper structure', async () => {
    const testCV = `
      <h1>John</h1>
      <p>Software Engineer at Tech Corp</p>
      <p>2020 - 2023</p>
    `;
    
    const result = await agent.reformatCV(testCV);
    
    expect(result).toContain('cv-section');
    expect(result).toContain('job-header');
    expect(result).toContain('Tech Corp | Software Engineer');
    expect(result).toContain('2020 - 2023');
  }, 10000);
});