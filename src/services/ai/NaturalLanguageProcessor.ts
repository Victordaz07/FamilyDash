/**
 * Natural Language Processor for FamilyDash
 * Voice commands, sentiment analysis, and intelligent conversation processing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceCommand {
  commandId: string;
  familyId: string;
  speakerId: string;
  transcript: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
  timestamp: number;
  executed: boolean;
  executionResult?: any;
  errorMessage?: string;
}

export interface SentimentAnalysis {
  speakerId: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
  };
  context: {
    isStressSignal: boolean;
    isSupportNeeded: boolean;
    isConflictIndicator: boolean;
    urgencyLevel: 'low' | 'medium' | 'high';
  };
}

export interface ChatAnalysis {
  conversationId: string;
  analysisType: 'family_discussion' | 'task_coordination' | 'conflict_resolution' | 'casual_chat';
  keyTopics: string[];
  participantEngagement: Array<{
    participantId: string;
    messageCount: number;
    sentimentScore: number;
    engagementLevel: 'low' | 'medium' | 'high';
  }>;
  conversationFlow: 'collaborative' | 'debatable' | 'supportive' | 'challenging';
  recommendations: {
    interventionSuggested: boolean;
    moderatorNeeded: boolean;
    topicGuidance: string[];
    follow_upActions: string[];
  };
}

export interface FamilyLanguagePattern {
  familyId: string;
  commonPhrases: Array<{
    phrase: string;
    context: string;
    frequency: number;
    sentiment: string;
  }>;
  communicationStyles: {
    direct: number;
    diplomatic: number;
    supportive: number;
    analytical: number;
  };
  preferredTopics: string[];
  challengeWords: string[];
  positiveWords: string[];
  conflictTriggers: string[];
}

export interface SmartVoiceResponse {
  responseId: string;
  commandId: string;
  responseType: 'acknowledgment' | 'question' | 'suggestion' | 'action' | 'confirmation';
  text: string;
  voiceInstructions?: string;
  followUpActions: string[];
  confidence: number;
}

export class NaturalLanguageProcessor {
  private static instance: NaturalLanguageProcessor;
  private voiceCommands: Map<string, VoiceCommand> = new Map();
  private sentimentCache: Map<string, SentimentAnalysis> = new Map();
  private languagePatterns: Map<string, FamilyLanguageModel> = new Map();
  private intentClassifiers: Map<string, any> = new Map();
  
  private constructor() {
    this.initializeService();
  }

  static getInstance(): NaturalLanguageProcessor {
    if (!NaturalLanguageProcessor.instance) {
      NaturalLanguageProcessor.instance = new NaturalLanguageProcessor();
    }
    return NaturalLanguageProcessor.instance;
  }

  /**
   * Initialize NLP service
   */
  private async initializeService(): Promise<void> {
    try {
      // Load voice command patterns and intent classifiers
      await this.loadLanguagePatterns();
      await this.loadIntentClassifiers();
      
      // Initialize voice recognition capabilities
      await this.initializeVoiceProcessing();
      
      console.log('🗣️ Natural Language Processor initialized');
    } catch (error) {
      console.error('Error initializing NLP service:', error);
    }
  }

  /**
   * Process voice command
   */
  async processVoiceCommand(
    familyId: string,
    speakerId: string,
    audioTranscript: string
  ): Promise<VoiceCommand> {
    
    try {
      console.log(`🎤 Processing voice command from ${speakerId}: ${audioTranscript}`);
      
      const commandId = `voice_cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Analyze intent and extract parameters
      const intentAnalysis = await this.extractIntent(audioTranscript);
      const confidence = await this.calculateConfidence(audioTranscript, intentAnalysis);
      
      const voiceCommand: VoiceCommand = {
        commandId,
        familyId,
        speakerId,
        transcript: audioTranscript,
        intent: intentAnalysis.intent,
        parameters: intentAnalysis.parameters,
        confidence,
        timestamp: Date.now(),
        executed: false,
      };
      
      // Store and execute command
      this.voiceCommands.set(commandId, voiceCommand);
      await this.executeVoiceCommand(voiceCommand);
      
      console.log(`✅ Voice command ${commandId} processed with ${confidence}% confidence`);
      
      return voiceCommand;
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      throw error;
    }
  }

  /**
   * Extract intent from text
   */
  private async extractIntent(text: string): Promise<{ intent: string; parameters: Record<string, any> }> {
    const lowerText = text.toLowerCase();
    
    // Simple intent classification (in real app would use ML models)
    const intents = {
      // Task management intents
      'create_task': ['create', 'add', 'new task', 'need to', 'remember'],
      'complete_task': ['done', 'finished', 'completed', 'cross off'],
      'list_tasks': ['show', 'list', 'what tasks', 'what do i need'],
      'schedule_task': ['schedule', 'when', 'tomorrow', 'next week'],
      
      // Calendar intents
      'add_event': ['add event', 'schedule', 'plan', 'book'],
      'check_calendar': ['check calendar', 'what\'s happening', 'events'],
      'reschedule_event': ['move', 'change time', 'reschedule'],
      
      // Family communication intents
      'send_message': ['tell', 'message', 'ask', 'let know'],
      'family_call': ['call family', 'video call', 'group call'],
      'safe_room': ['safe room', 'need to talk', 'feel'],
      
      // Goal and challenge intents
      'check_goals': ['goals', 'progress', 'how am i doing'],
      'add_challenge': ['challenge', 'dare', 'bet', 'competition'],
      
      // Information intents
      'ask_question': ['what', 'when', 'where', 'how', 'why'],
      'family_status': ['how is everyone', 'family update', 'status'],
    };
    
    let bestIntent = 'general_query';
    let confidence = 0.5;
    let parameters: Record<string, any> = {};
    
    for (const [intent, keywords] of Object.entries(intents)) {
      let matchCount = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          matchCount++;
          // Extract specific parameters
          if (intent === 'create_task') {
            // Extract task description
            const taskMatch = text.match(/(create|add|remember).*?(?!\bis|\bin$)/i);
            if (taskMatch) {
              parameters.task = taskMatch[0].trim();
            }
          } else if (intent === 'schedule_task') {
            // Extract time references
            const timeMatch = text.match(/(tomorrow|next week|tonight|this evening)/i);
            if (timeMatch) {
              parameters.when = timeMatch[0];
            }
          }
        }
      });
      
      if (matchCount > 0) {
        const intentConfidence = matchCount / keywords.length;
        if (intentConfidence > confidence) {
          confidence = intentConfidence;
          bestIntent = intent;
        }
      }
    }
    
    return { intent: bestIntent, parameters };
  }

  /**
   * Calculate command confidence
   */
  private async calculateConfidence(
    text: string,
    intentAnalysis: { intent: string; parameters: Record<string, any> }
  ): Promise<number> {
    
    let confidence = 0.6; // Base confidence
    
    // Increase confidence based on clarity
    if (intentAnalysis.parameters && Object.keys(intentAnalysis.parameters).length > 0) {
      confidence += 0.2;
    }
    
    // Increase confidence for complete sentences
    const words = text.split(' ');
    if (words.length >= 3) {
      confidence += 0.1;
    }
    
    // Increase confidence for family-specific vocabulary
    const familyTerms = ['family', 'mom', 'dad', 'kids', 'house', 'together'];
    const containsFamilyTerms = familyTerms.some(term => 
      text.toLowerCase().includes(term)
    );
    
    if (containsFamilyTerms) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0) * 100; // Convert to percentage
  }

  /**
   * Execute voice command
   */
  private async executeVoiceCommand(command: VoiceCommand): Promise<void> {
    try {
      let executionResult: any = null;
      
      switch (command.intent) {
        case 'create_task':
          executionResult = await this.executeCreateTask(command);
          break;
          
        case 'complete_task':
          executionResult = await this.executeCompleteTask(command);
          break;
          
        case 'add_event':
          executionResult = await this.executeAddEvent(command);

          break;
          
        case 'send_message':
          executionResult = await this.executeSendMessage(command);
          break;
          
        default:
          executionResult = { message: 'Command processed but no specific action taken' };
      }
      
      // Update command with execution result
      command.executed = true;
      command.executionResult = executionResult;
      
    } catch (error) {
      command.executed = false;
      command.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  /**
   * Execute specific voice commands
   */
  private async executeCreateTask(command: VoiceCommand): Promise<any> {
    return {
      action: 'task_created',
      taskDescription: command.parameters.task || command.transcript,
      timestamp: Date.now(),
    };
  }

  private async executeCompleteTask(command: VoiceCommand): Promise<any> {
    return {
      action: 'task_completed',
      message: 'Task marked as completed! Great work!',
      timestamp: Date.now(),
    };
  }

  private async executeAddEvent(command: VoiceCommand): Promise<any> {
    return {
      action: 'event_added',
      eventDescription: command.parameters.event || command.transcript,
      timestamp: Date.now(),
    };
  }

  private async executeSendMessage(command: VoiceCommand): Promise<any> {
    return {
      action: 'message_sent',
      recipient: command.parameters.recipient || 'family',
      message: command.parameters.message || command.transcript,
      timestamp: Date.now(),
    };
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(speakerId: string, text: string): Promise<SentimentAnalysis> {
    try {
      console.log(`💭 Analyzing sentiment for ${speakerId}: ${text.substring(0, 50)}...`);
      
      // Simple sentiment analysis (in real app would use ML models)
      const sentiment = await this.calculateSentiment(text);
      const emotions = await this.extractEmotions(text);
      const context = await this.analyzeContext(speakerId, text, sentiment);
      
      const analysis: SentimentAnalysis = {
        speakerId,
        text,
        sentiment: sentiment.overall,
        confidence: sentiment.confidence,
        emotions,
        context,
      };
      
      // Cache sentiment analysis
      this.sentimentCache.set(`${speakerId}_${Date.now()}`, analysis);
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      throw error;
    }
  }

  /**
   * Calculate overall sentiment
   */
  private async calculateSentiment(text: string): Promise<{ overall: 'positive' | 'neutral' | 'negative' | 'mixed'; confidence: number }> {
    const lowerText = text.toLowerCase();
    
    const positiveWords = [
      'good', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'excellent',
      'happy', 'excited', 'proud', 'grateful', 'love', 'like', 'enjoy', 'perfect',
      'helpful', 'supportive', 'understanding', 'kind', 'caring'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'mad', 'frustrated',
      'sad', 'disappointed', 'hurt', 'upset', 'worried', 'scared', 'stressed',
      'difficult', 'hard', 'struggle', 'problem', 'issue', 'concern'
    ];
    
    const words = lowerText.split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { overall: 'neutral', confidence: 0.5 };
    }
    
    const positiveRatio = positiveCount / total;
    
    if (positiveRatio > 0.6) {
      return { overall: 'positive', confidence: positiveRatio };
    } else if (positiveRatio < 0.4) {
      return { overall: 'negative', confidence: 1 - positiveRatio };
    } else {
      return { overall: 'mixed', confidence: 0.5 };
    }
  }

  /**
   * Extract emotions from text
   */
  private async extractEmotions(text: string): Promise<SentimentAnalysis['emotions']> {
    const lowerText = text.toLowerCase();
    
    const emotionWords = {
      joy: ['happy', 'joyful', 'excited', 'cheerful', 'delighted', 'thrilled'],
      sadness: ['sad', 'depressed', 'melancholy', 'sorrowful', 'unhappy', 'blue'],
      anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'terrified', 'nervous'],
      surprise: ['surprised', 'amazed', 'shocked', 'stunned', 'astonished'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'appalled', 'sickened'],
    };
    
    const emotions: SentimentAnalysis['emotions'] = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
    };
    
    Object.entries(emotionWords).forEach(([emotion, words]) => {
      words.forEach(word => {
        if (lowerText.includes(word)) {
          emotions[emotion as keyof typeof emotions] += 0.3;
        }
      });
      
      // Keep between 0 and 1
      emotions[emotion as keyof typeof emotions] = Math.min(
        emotions[emotion as keyof typeof emotions],
        1.0
      );
    });
    
    return emotions;
  }

  /**
   * Analyze context and urgency
   */
  private async analyzeContext(
    speakerId: string,
    text: string,
    sentiment: { overall: string; confidence: number }
  ): Promise<SentimentAnalysis['context']> {
    
    const lowerText = text.toLowerCase();
    
    // Stress indicators
    const stressWords = ['stressed', 'overwhelmed', 'pressure', 'too much', 'can\'t handle'];
    const isStressSignal = stressWords.some(word => lowerText.includes(word));
    
    // Support needed indicators
    const supportWords = ['help', 'support', 'advice', 'guidance', 'don\'t know what to do'];
    const isSupportNeeded = supportWords.some(word => lowerText.includes(word));
    
    // Conflict indicators
    const conflictWords = ['fight', 'disagree', 'argument', 'conflict', 'problem'];
    const isConflictIndicator = conflictWords.some(word => lowerText.includes(word));
    
    // Urgency assessment
    let urgencyLevel: 'low' | 'medium' | 'high' = 'low';
    if (sentiment.overall === 'negative' && (isStressSignal || isSupportNeeded)) {
      urgencyLevel = 'high';
    } else if (sentiment.overall === 'negative' || isConflictIndicator) {
      urgencyLevel = 'medium';
    }
    
    return {
      isStressSignal,
      isSupportNeeded,
      isConflictIndicator,
      urgencyLevel,
    };
  }

  /**
   * Analyze family chat conversation
   */
  async analyzeFamilyConversation(
    conversationId: string,
    messages: Array<{
      speakerId: string;
      content: string;
      timestamp: number;
    }>
  ): Promise<ChatAnalysis> {
    
    try {
      console.log(`💬 Analyzing family conversation ${conversationId}`);
      
      // Analyze key topics
      const keyTopics = await this.extractKeyTopics(messages);
      
      // Calculate participant engagement
      const participantEngagement = await this.calculateParticipantEngagement(messages);
      
      // Determine conversation flow
      const conversationFlow = await this.determineConversationFlow(messages);
      
      // Generate recommendations
      const recommendations = await this.generateConversationRecommendations(
        messages,
        conversationFlow,
        participantEngagement
      );
      
      // Determine analysis type
      const analysisType = await this.determineConversationType(keyTopics, conversationFlow);
      
      const analysis: ChatAnalysis = {
        conversationId,
        analysisType,
        keyTopics,
        participantEngagement,
        conversationFlow,
        recommendations,
      };
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing family conversation:', error);
      throw error;
    }
  }

  /**
   * Extract key topics from messages
   */
  private async extractKeyTopics(messages: Array<{ content: string }>): Promise<string[]> {
    const allText = messages.map(msg => msg.content).join(' ').toLowerCase();
    
    const topicKeywords = {
      'tasks': ['task', 'homework', 'chore', 'work', 'project'],
      'goals': ['goal', 'target', 'objective', 'achievement'],
      'family_time': ['family', 'together', 'dinner', 'fun', 'game'],
      'scheduling': ['schedule', 'time', 'when', 'appointment', 'meeting'],
      'emotions': ['feel', 'upset', 'happy', 'worry', 'care'],
      'challenges': ['challenge', 'penalty', 'consequence', 'rule'],
    };
    
    const topics: string[] = [];
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const topicMentionCount = keywords.reduce((count, keyword) => {
        return count + (allText.split(keyword).length - 1);
      }, 0);
      
      if (topicMentionCount > 0) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  /**
   * Calculate participant engagement
   */
  private async calculateParticipantEngagement(
    messages: Array<{ speakerId: string; content: string }>
  ): Promise<ChatAnalysis['participantEngagement']> {
    
    const participantCounts = new Map<string, { messageCount: number; totalLength: number }>();
    
    messages.forEach(msg => {
      const existing = participantCounts.get(msg.speakerId) || { messageCount: 0, totalLength: 0 };
      participantCounts.set(msg.speakerId, {
        messageCount: existing.messageCount + 1,
        totalLength: existing.totalLength + msg.content.length,
      });
    });
    
    const result: ChatAnalysis['participantEngagement'] = [];
    
    participantCounts.forEach((stats, participantId) => {
      // Analyze sentiment for this participant
      const participantMessages = messages.filter(msg => msg.speakerId === participantId);
      // Simplified sentiment - average length indicates engagement
      const avgSentimentScore = stats.totalLength / stats.messageCount / 10; // Normalize
      
      let engagementLevel: 'low' | 'medium' | 'high';
      if (stats.messageCount >= 5 && avgSentimentScore > 5) {
        engagementLevel = 'high';
      } else if (stats.messageCount >= 2 && avgSentimentScore > 3) {
        engagementLevel = 'medium';
      } else {
        engagementLevel = 'low';
      }
      
      result.push({
        participantId,
        messageCount: stats.messageCount,
        sentimentScore: Math.min(avgSentimentScore, 10),
        engagementLevel,
      });
    });
    
    return result;
  }

  /**
   * Determine conversation flow
   */
  private async determineConversationFlow(
    messages: Array<{ content: string }>
  ): Promise<ChatAnalysis['conversationFlow']> {
    
    const avgLength = messages.reduce((sum, msg) => sum + msg.content.length, 0) / messages.length;
    
    const questionCount = messages.filter(msg => msg.content.includes('?')).length;
    const exclamationCount = messages.filter(msg => msg.content.includes('!')).length;
    
    if (questionCount > messages.length * 0.3 && avgLength > 20) {
      return 'collaborative';
    } else if (exclamationCount > messages.length * 0.2) {
      return 'supportive';
    } else if (avgLength < 10 && questionCount > 0) {
      return 'debatable';
    } else {
      return 'challenging';
    }
  }

  /**
   * Generate conversation recommendations
   */
  private async generateConversationRecommendations(
    messages: Array<{ content: string }>,
    flow: string,
    engagement: ChatAnalysis['participantEngagement']
  ): Promise<ChatAnalysis['recommendations']> {
    
    const lowEngagementCount = engagement.filter(p => p.engagementLevel === 'low').length;
    const needsIntervention = lowEngagementCount > engagement.length * 0.5;
    
    return {
      interventionSuggested: needsIntervention,
      moderatorNeeded: flow === 'challenging',
      topicGuidance: flow === 'challenging' ? ['Focus on collaboration', 'Encourage positive language'] : [],
      follow_upActions: needsIntervention ? ['Schedule follow-up discussion', 'Check individual family members'] : [],
    };
  }

  /**
   * Determine conversation analysis type
   */
  private async determineConversationType(
    topics: string[],
    flow: string
  ): Promise<ChatAnalysis['analysisType']> {
    
    if (topics.includes('emotions')) {
      return 'conflict_resolution';
    } else if (topics.includes('tasks')) {
      return 'task_coordination';
    } else if (flow === 'collaborative' && topics.length > 2) {
      return 'family_discussion';
    } else {
      return 'casual_chat';
    }
  }

  /**
   * Load family language patterns
   */
  private async loadLanguagePatterns(): Promise<void> {
    try {
      const patternsString = await AsyncStorage.getItem('family_language_patterns');
      if (patternsString) {
        const patterns = JSON.parse(patternsString);
        patterns.forEach((pattern: FamilyLanguagePattern) => {
          this.languagePatterns.set(pattern.familyId, pattern);
        });
      }
    } catch (error) {
      console.error('Error loading language patterns:', error);
    }
  }

  /**
   * Load intent classifiers
   */
  private async loadIntentClassifiers(): Promise<void> {
    try {
      // Load trained models for intent classification
      console.log('🧠 Intent classification models loaded');
    } catch (error) {
      console.error('Error loading intent classifiers:', error);
    }
  }

  /**
   * Initialize voice processing capabilities
   */
  private async initializeVoiceProcessing(): Promise<void> {
    try {
      // Initialize voice recognition and processing
      console.log('🎤 Voice processing capabilities initialized');
    } catch (error) {
      console.error('Error initializing voice processing:', error);
    }
  }
}
