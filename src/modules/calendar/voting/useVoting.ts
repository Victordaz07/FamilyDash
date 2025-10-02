import { useState, useEffect } from 'react';

export interface VotingProposal {
  id: string;
  title: string;
  description: string;
  category: 'entertainment' | 'food' | 'activity' | 'movie' | 'travel' | 'other';
  options: VotingOption[];
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'active' | 'completed' | 'expired';
  totalVotes: number;
}

export interface VotingOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  optionId: string;
  votedAt: Date;
}

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  role: 'parent' | 'child' | 'teen';
}

const useVoting = () => {
  const [proposals, setProposals] = useState<VotingProposal[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [familyMembers] = useState<FamilyMember[]>([
    { id: 'mom', name: 'Mom', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg', role: 'parent' },
    { id: 'dad', name: 'Dad', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg', role: 'parent' },
    { id: 'emma', name: 'Emma', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg', role: 'teen' },
    { id: 'jake', name: 'Jake', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg', role: 'child' }
  ]);

  // Mock data inicial
  useEffect(() => {
    const mockProposals: VotingProposal[] = [
      {
        id: '1',
        title: '¿Qué película vemos esta noche?',
        description: 'Elegimos una película para ver en familia',
        category: 'movie',
        options: [
          { id: 'opt1', text: 'Avengers: Endgame', votes: 2, voters: ['mom', 'jake'] },
          { id: 'opt2', text: 'Frozen 2', votes: 1, voters: ['emma'] },
          { id: 'opt3', text: 'The Lion King', votes: 1, voters: ['dad'] }
        ],
        createdBy: 'mom',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas más
        status: 'active',
        totalVotes: 4
      },
      {
        id: '2',
        title: '¿Dónde vamos a cenar el fin de semana?',
        description: 'Decidamos el restaurante para la cena familiar',
        category: 'food',
        options: [
          { id: 'opt4', text: 'Pizza Palace', votes: 3, voters: ['mom', 'dad', 'jake'] },
          { id: 'opt5', text: 'Sushi Bar', votes: 1, voters: ['emma'] },
          { id: 'opt6', text: 'Burger King', votes: 0, voters: [] }
        ],
        createdBy: 'dad',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 horas más
        status: 'active',
        totalVotes: 4
      },
      {
        id: '3',
        title: '¿Qué actividad hacemos el domingo?',
        description: 'Plan familiar para el domingo',
        category: 'activity',
        options: [
          { id: 'opt7', text: 'Ir al parque', votes: 2, voters: ['jake', 'emma'] },
          { id: 'opt8', text: 'Visitar museo', votes: 1, voters: ['mom'] },
          { id: 'opt9', text: 'Quedar en casa', votes: 1, voters: ['dad'] }
        ],
        createdBy: 'emma',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
        expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás (expirada)
        status: 'expired',
        totalVotes: 4
      }
    ];

    setProposals(mockProposals);
  }, []);

  const createProposal = (proposalData: Omit<VotingProposal, 'id' | 'createdAt' | 'status' | 'totalVotes'>) => {
    const newProposal: VotingProposal = {
      ...proposalData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'active',
      totalVotes: 0
    };

    setProposals(prev => [newProposal, ...prev]);
    return newProposal;
  };

  const voteOnProposal = (proposalId: string, optionId: string, voterId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'active') return false;

    // Verificar si ya votó
    const existingVote = votes.find(v => v.proposalId === proposalId && v.voterId === voterId);
    if (existingVote) return false;

    // Crear nuevo voto
    const newVote: Vote = {
      id: Date.now().toString(),
      proposalId,
      voterId,
      optionId,
      votedAt: new Date()
    };

    // Actualizar propuesta
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        const updatedOptions = p.options.map(opt => {
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: opt.votes + 1,
              voters: [...opt.voters, voterId]
            };
          }
          return opt;
        });

        return {
          ...p,
          options: updatedOptions,
          totalVotes: p.totalVotes + 1
        };
      }
      return p;
    }));

    setVotes(prev => [...prev, newVote]);
    return true;
  };

  const getProposalResults = (proposalId: string) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return null;

    const sortedOptions = [...proposal.options].sort((a, b) => b.votes - a.votes);
    const winner = sortedOptions[0];
    const totalVotes = proposal.totalVotes;

    return {
      proposal,
      winner,
      sortedOptions,
      totalVotes,
      participation: (totalVotes / familyMembers.length) * 100
    };
  };

  const getActiveProposals = () => {
    return proposals.filter(p => p.status === 'active');
  };

  const getCompletedProposals = () => {
    return proposals.filter(p => p.status === 'completed');
  };

  const getExpiredProposals = () => {
    return proposals.filter(p => p.status === 'expired');
  };

  const getUserVotes = (userId: string) => {
    return votes.filter(v => v.voterId === userId);
  };

  const getProposalCategories = () => {
    return [
      { id: 'entertainment', name: 'Entretenimiento', icon: 'game-controller', color: '#8B5CF6' },
      { id: 'food', name: 'Comida', icon: 'restaurant', color: '#F59E0B' },
      { id: 'activity', name: 'Actividad', icon: 'bicycle', color: '#10B981' },
      { id: 'movie', name: 'Películas', icon: 'film', color: '#EC4899' },
      { id: 'travel', name: 'Viajes', icon: 'airplane', color: '#3B82F6' },
      { id: 'other', name: 'Otros', icon: 'ellipsis-horizontal', color: '#6B7280' }
    ];
  };

  return {
    proposals,
    votes,
    familyMembers,
    createProposal,
    voteOnProposal,
    getProposalResults,
    getActiveProposals,
    getCompletedProposals,
    getExpiredProposals,
    getUserVotes,
    getProposalCategories
  };
};

export default useVoting;
