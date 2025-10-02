import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../../components/ui/WorkingComponents';
import { theme } from '../../../../styles/simpleTheme';
import { VotingProposal, FamilyMember } from '../useVoting';

interface VotingCardProps {
  proposal: VotingProposal;
  familyMembers: FamilyMember[];
  onVote: (proposalId: string, optionId: string) => void;
  showResults?: boolean;
}

const VotingCard: React.FC<VotingCardProps> = ({
  proposal,
  familyMembers,
  onVote,
  showResults = false
}) => {
  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      entertainment: 'game-controller',
      food: 'restaurant',
      activity: 'bicycle',
      movie: 'film',
      travel: 'airplane',
      other: 'ellipsis-horizontal'
    };
    return icons[category] || 'ellipsis-horizontal';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      entertainment: '#8B5CF6',
      food: '#F59E0B',
      activity: '#10B981',
      movie: '#EC4899',
      travel: '#3B82F6',
      other: '#6B7280'
    };
    return colors[category] || '#6B7280';
  };

  const getMemberName = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    return member?.name || memberId;
  };

  const getMemberAvatar = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    return member?.avatar;
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(proposal.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return 'Expirada';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getWinner = () => {
    if (!showResults) return null;
    return proposal.options.reduce((prev, current) =>
      prev.votes > current.votes ? prev : current
    );
  };

  const winner = getWinner();
  const timeRemaining = getTimeRemaining();
  const categoryColor = getCategoryColor(proposal.category);

  return (
    <Card style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
            <Ionicons
              name={getCategoryIcon(proposal.category)}
              size={16}
              color="#ffffff"
            />
          </View>
          <Text style={styles.categoryText}>
            {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
          </Text>
        </View>
        <View style={styles.timeContainer}>
          <Ionicons name="time" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.timeText}>{timeRemaining}</Text>
        </View>
      </View>

      {/* Title and Description */}
      <Text style={styles.title}>{proposal.title}</Text>
      {proposal.description && (
        <Text style={styles.description}>{proposal.description}</Text>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        {proposal.options.map((option, index) => {
          const isWinner = showResults && winner?.id === option.id;
          const percentage = proposal.totalVotes > 0
            ? (option.votes / proposal.totalVotes) * 100
            : 0;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                isWinner && styles.winnerOption,
                showResults && styles.resultsOption
              ]}
              onPress={() => !showResults && onVote(proposal.id, option.id)}
              disabled={showResults}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionText,
                  isWinner && styles.winnerText
                ]}>
                  {option.text}
                </Text>
                {showResults && (
                  <Text style={styles.percentageText}>
                    {percentage.toFixed(0)}%
                  </Text>
                )}
              </View>

              {showResults && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: categoryColor }
                    ]}
                  />
                </View>
              )}

              {/* Voters */}
              {option.voters.length > 0 && (
                <View style={styles.votersContainer}>
                  <View style={styles.votersAvatars}>
                    {option.voters.slice(0, 3).map((voterId, idx) => (
                      <View key={idx} style={styles.voterAvatar}>
                        <Text style={styles.voterInitial}>
                          {getMemberName(voterId).charAt(0)}
                        </Text>
                      </View>
                    ))}
                    {option.voters.length > 3 && (
                      <View style={styles.moreVoters}>
                        <Text style={styles.moreVotersText}>
                          +{option.voters.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.votesCount}>
                    {option.votes} voto{option.votes !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {proposal.totalVotes} de {familyMembers.length} miembros han votado
        </Text>
        {showResults && winner && (
          <View style={styles.winnerBadge}>
            <Ionicons name="trophy" size={16} color="#F59E0B" />
            <Text style={styles.winnerText}>Ganador: {winner.text}</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: theme.colors.background,
  },
  resultsOption: {
    backgroundColor: '#ffffff',
  },
  winnerOption: {
    borderColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    flex: 1,
  },
  winnerText: {
    color: '#92400E',
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  votersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  votersAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  voterInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  moreVoters: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreVotersText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  votesCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default VotingCard;
