export interface CVProcessingResult {
  originalContent: string;
  anonymizedContent: string;
  formattedContent: string;
  enhancedContent: string;
  editedContent?: string;
}

export interface JobRecommendation {
  title: string;
  matchReason: string;
  skills: string[];
}

export interface CareerPlan {
  currentLevel: string;
  shortTermGoals: string[];
  longTermGoals: string[];
  skillsToAcquire: string[];
} 