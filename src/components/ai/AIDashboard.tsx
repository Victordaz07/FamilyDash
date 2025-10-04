import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'expo-linear-gradient';
import { useAI } from '../../hooks/useAI';
import { AdvancedCard } from '../advanced/AdvancedCard';
import { AdvancedButton } from '../advanced/AdvancedButton';

interface AIDashboardProps {
  familyId: string;
}

export function AIDashboard({ familyId }: AIDashboardProps) {
  const {
    recommendations,
    insights,
    voiceCommands,
    predictions,
    familyPatterns,
    productivityTrends,
    goalRecommendations,
    isLoading,
    processVoiceCommand,
    analyzeSentiment,
    optimizeSchedule,
  } = useAI(familyId);

  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'predictions' | 'patterns'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh AI data would be handled by hooks
    setTimeout(() => setRefreshing(false), 1000);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'home' },
    { key: 'recommendations', label: 'Smart Tips', icon: 'bulb' },
    { key: 'predictions', label: 'Predictions', icon: 'trending-up' },
    { key: 'patterns', label: 'Patterns', icon: 'analytics' },
  ];

  const getTabIcon = (iconName: string) => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      home: 'home',
      bulb: 'bulb',
      trending: 'trending-up',
      analytics: 'analytics',
    };
    return iconMap[iconName] || 'help-circle';
  };

  const handleVoiceDemo = () => {
    Alert.alert(
      'Voice Command Demo',
      'Simulating voice command processing...',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Process',
          onPress: () => {
            processVoiceCommand('demo_user', 'Hey assistant, create a family game night task');
          },
        },
      ]
    );
  };

  const handleSentimentDemo = () => {
    Alert.alert(
      'Sentiment Analysis Demo',
      'Analyzing sample text...',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Analyze',
          onPress: () => {
            analyzeSentiment('demo_user', 'Great work today! I\'m so proud of our family!');
          },
        },
      ],
    );
  };

  const handleScheduleOptimization = async () => {
    Alert.alert(
      'Schedule Optimization',
      'Optimizing family schedule...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Optimize',
          onPress: async () => {
            const optimizedSchedule = await optimizeSchedule();
            Alert.alert(
              'Schedule Optimized!',
              `Found ${optimizedSchedule.length} optimal time slots for family activities.`,
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* AI Status Card */}
      <AdvancedCard style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons name="checkmark-circle" size={28} color="#10B981" />
          <Text style={styles.statusText}>AI Assistant Active</Text>
        </View>
        <Text style={styles.statusDescription}>
          Smart recommendations and predictions are ready to help your family!
        </Text>
      </AdvancedCard>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick AI Actions</Text>
        
        <View style={styles.actionButtons}>
          <AdvancedButton
            title="Voice Demo"
            icon="mic"
            variant="primary"
            onPress={handleVoiceDemo}
            style={styles.actionButton}
          />
          
          <AdvancedButton
            title="Sentiment"
            icon="happy"
            variant="secondary"
            onPress={handleSentimentDemo}
            style={styles.actionButton}
          />
          
          <AdvancedButton
            title="Optimize"
            icon="time"
            variant="accent"
            onPress={handleScheduleOptimization}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Current Insights */}
      {insights.length > 0 && (
        <View style={styles.currentInsights}>
          <Text style={styles.sectionTitle}>Current Family Insights</Text>
          
          {insights.slice(0, 2).map((insight, index) => (
            <AdvancedCard key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons 
                  name={insight.severity === 'high' ? 'warning' : insight.severity === 'medium' ? 'information-circle' : 'checkmark-circle'} 
                  size={20}
                  color={insight.severity === 'high' ? '#EF4444' : insight.severity === 'medium' ? '#F59E0B' : '#10B981'}
                />
                <Text style={styles.insightTitle}>{insight.title}</Text>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              <Text style={styles.insightConfidence}>
                {insight.confidence}% confidence
              </Text>
            </AdvancedCard>
          ))}
        </View>
      )}

      {/* Recent Predictions */}
      {predictions.length > 0 && (
        <View style={styles.recentPredictions}>
          <Text style={styles.sectionTitle}>Recent Predictions</Text>
          
          {predictions.slice(0, 2).map((prediction, index) => (
            <AdvancedCard key={index} style={styles.predictionCard}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionTitle}>{prediction.predictionType}</Text>
                <Text style={styles.predictionConfidence}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.predictionBar}>
                <View 
                  style={[
                    styles.predictionBarFill,
                    { width: `${prediction.predictedValue * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.predictionValue}>
                {prediction.predictionType === 'Task Completion' 
                  ? `${prediction.predictedValue * 100}% completion rate`
                  : `${prediction.predictedValue * 100}% mood level`
                }
              </Text>
            </AdvancedCard>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderRecommendations = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Smart Recommendations</Text>
      
      {recommendations.length === 0 ? (
        <AdvancedCard style={styles.emptyState}>
          <Ionicons name="bulb-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Generating smart recommendations...</Text>
          <Text style={styles.emptyStateSubtext}>
            Our AI is analyzing your family patterns to provide personalized suggestions.
          </Text>
        </AdvancedCard>
      ) : (
        recommendations.map((rec, index) => (
          <AdvancedCard key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationIcon}>
                <Ionicons 
                  name={
                    rec.priority === 'urgent' ? 'alert-circle' :
                    rec.priority === 'high' ? 'star' :
                    rec.priority === 'medium' ? 'checkmark-circle' : 'information-circle'
                  } 
                  size={24}
                  color={
                    rec.priority === 'urgent' ? '#EF4444' :
                    rec.priority === 'high' ? '#F59E0B' :
                    rec.priority === 'medium' ? '#10B981' : '#3B82F6'
                  }
                />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Priority:</Text>
                <Text style={[styles.metaValue, { color: 
                  rec.priority === 'urgent' ? '#EF4444' :
                  rec.priority === 'high' ? '#F59E0B' :
                  rec.priority === 'medium' ? '#10B981' : '#3B82F6'
                }]}>
                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Effort:</Text>
                <Text style={styles.metaValue}>
                  {rec.effortLevel.charAt(0).toUpperCase() + rec.effortLevel.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Timeframe:</Text>
                <Text style={styles.metaValue}>{rec.timeframe}</Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Impact:</Text>
                <Text style={styles.metaValue}>High</Text>
              </View>
            </View>

            <AdvancedButton
              title="View Details"
              icon="arrow-forward"
              variant="outline"
              onPress={() => Alert.alert('Recommendation Details', rec.expectedImpact)}
              style={styles.detailsButton}
            />
          </AdvancedCard>
        ))
      )}
    </ScrollView>
  );

  const renderPredictions = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>AI Predictions</Text>
      
      {/* Task Completion Predictions */}
      <AdvancedCard style={styles.predictionSection}>
        <Text style={styles.subsectionTitle}>Task Completion Probability</Text>
        
        {predictions
          .filter(p => p.predictionType === 'Task Completion')
          .map((prediction, index) => (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionLabel}>Family Task Completion</Text>
                <Text style={styles.predictionPercentage}>
                  {(prediction.predictedValue * 100).toFixed(0)}%
                </Text>
              </View>
              
              <View style={styles.predictionBar}>
                <LinearGradient
                  colors={[ '#10B981', '#34D399' ]}
                  style={[
                    styles.predictionBarFill,
                    { width: `${prediction.predictedValue * 100}%` }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              
              <Text style={styles.predictionAdvice}>
                {prediction.recommendations[0]}
              </Text>
            </View>
          ))}
      </AdvancedCard>

      {/* Family Mood Predictions */}
      <AdvancedCard style={styles.predictionSection}>
        <Text style={styles.subsectionTitle}>Family Mood Forecast</Text>
        
        {predictions
          .filter(p => p.predictionType === 'Family Mood')
          .map((prediction, index) => (
            <View key={index} style={styles.predictionItem}>
              <View style={styles.predictionHeader}>
                <Text style={styles.predictionLabel}>Current Family Mood</Text>
                <Text style={styles.predictionPercentage}>
                  {(prediction.predictedValue * 100).toFixed(0)}%
                </Text>
              </View>
              
              <View style={styles.predictionBar}>
                <LinearGradient
                  colors={prediction.predictedValue > 0.7 ? [ '#F59E0B', '#FBBF24' ] : prediction.predictedValue > 0.5 ? [ '#3B82F6', '#60A5FA' ] : [ '#EF4444', '#F87171' ]}
                  style={[
                    styles.predictionBarFill,
                    { width: `${prediction.predictedValue * 100}%` }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              
              <Text style={styles.predictionAdvice}>
                {prediction.recommendations[0]}
              </Text>
            </View>
          ))}
      </AdvancedCard>

      {/* Goal Recommendations */}
      {goalRecommendations.length > 0 && (
        <AdvancedCard style={styles.predictionSection}>
          <Text style={styles.subsectionTitle}>AI-Generated Goal Ideas</Text>
          
          {goalRecommendations.slice(0, 3).map((goal, index) => (
            <View key={index} style={styles.goalRecommendation}>
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalProbability}>
                  {(goal.successProbability * 100).toFixed(0)}% success rate
                </Text>
              </View>
              
              <Text style={styles.goalDescription}>
                {goal.difficulty.toUpperCase()} • {goal.timeframe}
              </Text>
              
              <View style={styles.goalBenefits}>
                {goal.benefits.map((benefit, idx) => (
                  <View key={idx} style={styles.benefitItem}>
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </AdvancedCard>
      )}
    </ScrollView>
  );

  const renderPatterns = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Family Behavior Patterns</Text>
      
      {familyPatterns.length === 0 ? (
        <AdvancedCard style={styles.emptyState}>
          <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>Analyzing family patterns...</Text>
          <Text style={styles.emptyStateSubtext}>
            Our AI is learning from your family's behavior to identify helpful patterns.
          </Text>
        </AdvancedCard>
      ) : (
        familyPatterns.map((pattern, index) => (
          <AdvancedCard key={index} style={styles.patternCard}>
            <View style={styles.patternHeader}>
              <Ionicons name="trending-up" size={24} color="#3B82F6" />
              <Text style={styles.patternType}>{pattern.patternType}</Text>
              <Text style={styles.patternConfidence}>
                {pattern.confidence}%
              </Text>
            </View>
            
            <Text style={styles.patternDescription}>{pattern.description}</Text>
            
            <Text style={styles.patternRecommendationsLabel}>Recommendations:</Text>
            {pattern.recommendations.map((rec, idx) => (
              <View key={idx} style={styles.patternRecommendation}>
                <Ionicons name="arrow-right" size={16} color="#6B7280" />
                <Text style={styles.patternRecommendationText}>{rec}</Text>
              </View>
            ))}
          </AdvancedCard>
        ))
      )}

      {/* Productivity Trends */}
      {productivityTrends.length > 0 && (
        <AdvancedCard style={styles.predictionSection}>
          <Text style={styles.subsectionTitle}>Productivity Trends</Text>
          
          {productivityTrends.map((trend, index) => (
            <View key={index} style={styles.trendItem}>
              <View style={styles.trendHeader}>
                <Text style={styles.trendTimeSlot}>{trend.timeSlot}</Text>
                <View style={styles.trendBadge}>
                  <Ionicons 
                    name={
                      trend.trend === 'improving' ? 'trending-up' :
                      trend.trend === 'stable' ? 'remove' : 'trending-down'
                    } 
                    size={14} 
                    color={
                      trend.trend === 'improving' ? '#10B981' :
                      trend.trend === 'stable' ? '#6B7280' : '#EF4444'
                    }
                  />
                  <Text style={[
                    styles.trendText,
                    { 
                      color: trend.trend === 'improving' ? '#10B981' :
                             trend.trend === 'stable' ? '#6B7280' : '#EF4444'
                    }
                  ]}>
                    {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.productivityBar}>
                <View 
                  style={[
                    styles.productivityBarFill,
                    { width: `${trend.productivityLevel}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.patternRecommendationsLabel}>Recommendations:</Text>
              <Text style={styles.trendRecommendation}>{trend.recommendations[0]}</Text>
            </View>
          ))}
        </AdvancedCard>
      )}

      {/* Recent Voice Commands */}
      {voiceCommands.length > 0 && (
        <AdvancedCard style={styles.predictionSection}>
          <Text style={styles.subsectionTitle}>Recent Voice Commands</Text>
          
          {voiceCommands.slice(-3).map((command, index) => (
            <View key={index} style={styles.voiceCommand}>
              <View style={styles.voiceCommandHeader}>
                <Ionicons name="mic" size={16} color="#6B7280" />
                <Text style={styles.voiceCommandIntent}>{command.intent}</Text>
                <Text style={styles.voiceCommandConfidence}>
                  {command.confidence}%
                </Text>
              </View>
              
              <Text style={styles.voiceCommandTranscript}>
                "{command.transcript}"
              </Text>
              
              <View style={styles.voiceCommandStatus}>
                <Ionicons 
                  name={command.executed ? 'checkmark-circle' : 'close-circle'} 
                  size={14} 
                  color={command.executed ? '#10B981' : '#EF4444'} 
                />
                <Text style={[
                  styles.voiceCommandStatusText,
                  { color: command.executed ? '#10B981' : '#EF4444' }
                ]}>
                  {command.executed ? 'Executed' : 'Failed'}
                </Text>
              </View>
            </View>
          ))}
        </AdvancedCard>
      )}
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recommendations':
        return renderRecommendations();
      case 'predictions':
        return renderPredictions();
      case 'patterns':
        return renderPatterns();
      default:
        return renderOverview();
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#3B82F6', '#1D4ED8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="sparkles" size={32} color="white" />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Smart insights and predictions for your family
        </Text>
      </LinearGradient>

      {/* Tab Navigator */}
      <View style={styles.tabNavigator}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={getTabIcon(tab.icon)}
                size={20}
                color={activeTab === tab.key ? '#3B82F6' : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.activeTabLabel,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
      
      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <AdvancedCard style={styles.loadingCard}>
            <Ionicons name="hourglass" size={32} color="#3B82F6" />
            <Text style={styles.loadingText}>AI Analysis in Progress...</Text>
          </AdvancedCard>
        </View>
      )}
    </ScrollView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  tabNavigator: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#EBF8FF',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabLabel: {
    color: '#3B82F6',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusCard: {
    marginBottom: 20,
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: '#375C40',
    lineHeight: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  currentInsights: {
    marginBottom: 20,
  },
  insightCard: {
    marginBottom: 12,
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  recentPredictions: {
    marginBottom: 20,
  },
  predictionCard: {
    marginBottom: 12,
    backgroundColor: '#FEFEFE',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  predictionBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  predictionBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  predictionValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationCard: {
    marginBottom: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailsButton: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  predictionSection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  predictionItem: {
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  predictionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  predictionAdvice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  goalRecommendation: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  goalProbability: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  goalBenefits: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  patternCard: {
    marginBottom: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patternType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  patternConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  patternDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  patternRecommendationsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  patternRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  patternRecommendationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  trendItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendTimeSlot: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productivityBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  productivityBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  trendRecommendation: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  voiceCommand: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  voiceCommandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceCommandIntent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  voiceCommandConfidence: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
  },
  voiceCommandTranscript: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  voiceCommandStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceCommandStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
});
