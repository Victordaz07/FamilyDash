import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui/WorkingComponents';
import { theme } from '@/styles/simpleTheme';
import useVoting, { VotingProposal } from './useVoting';
import VotingCard from './components/VotingCard';
import NewProposalModal from './components/NewProposalModal';

interface VotingScreenProps {
  navigation: any;
}

const VotingScreen: React.FC<VotingScreenProps> = ({ navigation }) => {
  const {
    proposals,
    familyMembers,
    getActiveProposals,
    getCompletedProposals,
    getExpiredProposals,
    createProposal,
    voteOnProposal,
    getProposalResults
  } = useVoting();

  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'expired'>('active');
  const [showNewProposal, setShowNewProposal] = useState(false);

  const activeProposals = getActiveProposals();
  const completedProposals = getCompletedProposals();
  const expiredProposals = getExpiredProposals();

  const handleCreateProposal = (proposalData: any) => {
    createProposal(proposalData);
    setShowNewProposal(false);
    Alert.alert('Éxito', 'Propuesta creada correctamente');
  };

  const handleVote = (proposalId: string, optionId: string) => {
    // Por simplicidad, usamos 'mom' como votante actual
    const success = voteOnProposal(proposalId, optionId, 'mom');
    if (success) {
      Alert.alert('Voto registrado', 'Tu voto ha sido registrado');
    } else {
      Alert.alert('Error', 'Ya has votado en esta propuesta');
    }
  };

  const TabButton = ({ tab, label, count }: { tab: string, label: string, count: number }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTab]}
      onPress={() => setActiveTab(tab as any)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {label}
      </Text>
      <View style={[styles.tabBadge, activeTab === tab && styles.activeTabBadge]}>
        <Text style={[styles.tabBadgeText, activeTab === tab && styles.activeTabBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProposals = (proposalsList: VotingProposal[]) => {
    if (proposalsList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="list" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No hay propuestas</Text>
          <Text style={styles.emptySubtitle}>
            {activeTab === 'active' ? 'No hay votaciones activas' :
              activeTab === 'completed' ? 'No hay votaciones completadas' :
                'No hay votaciones expiradas'}
          </Text>
        </View>
      );
    }

    return proposalsList.map(proposal => (
      <VotingCard
        key={proposal.id}
        proposal={proposal}
        familyMembers={familyMembers}
        onVote={handleVote}
        showResults={activeTab !== 'active'}
      />
    ));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('CalendarMain')}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Voting</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => setShowNewProposal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{activeProposals.length}</Text>
          <Text style={styles.statLabel}>Activas</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{completedProposals.length}</Text>
          <Text style={styles.statLabel}>Completadas</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{familyMembers.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </Card>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton tab="active" label="Activas" count={activeProposals.length} />
        <TabButton tab="completed" label="Completadas" count={completedProposals.length} />
        <TabButton tab="expired" label="Expiradas" count={expiredProposals.length} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'active' && renderProposals(activeProposals)}
        {activeTab === 'completed' && renderProposals(completedProposals)}
        {activeTab === 'expired' && renderProposals(expiredProposals)}
      </ScrollView>

      {/* New Proposal Modal */}
      <NewProposalModal
        visible={showNewProposal}
        onClose={() => setShowNewProposal(false)}
        onSubmit={handleCreateProposal}
        familyMembers={familyMembers}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  newButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabBadge: {
    backgroundColor: theme.colors.textSecondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#ffffff',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  activeTabBadgeText: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default VotingScreen;




