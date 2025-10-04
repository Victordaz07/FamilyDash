/**
 * AI Services Export Hub
 * Central export point for all AI-powered services
 */

export { SmartFamilyAssistant } from './SmartFamilyAssistant';
export type { 
  FamilyInsight,
  SmartRecommendation,
  AIProfile,
  SmartGoalRecommendation,
  AIConversationContext
} from './SmartFamilyAssistant';

export { NaturalLanguageProcessor } from './NaturalLanguageProcessor';
export type {
  VoiceCommand,
  SentimentAnalysis,
  ChatAnalysis,
  FamilyLanguagePattern,
  SmartVoiceResponse
} from './NaturalLanguageProcessor';

export { PredictiveAnalytics } from './PredictiveAnalytics';
export type {
  PredictiveModel,
  PredictionResult,
  FamilyInsightPattern,
  SmartForecast,
  PerformanceOptimization
} from './PredictiveAnalytics';
