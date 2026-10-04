export interface VocabWord {
  word: string;
  type: string;
  meaningVi: string;
  ipa: string;
  example?: string;
  dateAdded?: string;
}

export interface FeedbackData {
  isCorrect: boolean;
  betterVersion: string;
  explanationVi: string;
  pronunciationTips: string[];
  praiseVi: string;
  fluencyScore: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  textEn: string;
  textVi?: string;
  timestamp: number;
  audioUrl?: string;
  feedback?: FeedbackData;
  keyVocab?: VocabWord[];
  suggestedReplies?: string[];
  audioBase64?: string;
}

export interface Topic {
  id: string;
  titleEn: string;
  titleVi: string;
  descriptionVi: string;
  level: 'A1' | 'A2' | 'A1-A2';
  icon: string;
  starterPromptEn: string;
  starterPromptVi: string;
  starterAiMessageEn: string;
  starterAiMessageVi: string;
  sampleKeywords: string[];
  color: string;
}

export interface LearnerStats {
  dailyStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todaySpeakingSeconds: number;
  totalSpeakingSeconds: number;
  totalExchanges: number;
  averageFluency: number;
  savedVocab: VocabWord[];
}

export interface SessionReport {
  overallScore: number;
  grammarScore: number;
  vocabScore: number;
  overallFeedbackVi: string;
  strengths: string[];
  improvements: {
    mistake: string;
    correction: string;
    explanationVi: string;
  }[];
  keyWordsLearned: {
    word: string;
    ipa: string;
    meaningVi: string;
  }[];
  durationSeconds: number;
  exchangesCount: number;
}
