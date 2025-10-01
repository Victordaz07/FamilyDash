import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  mockFamilyMembers,
  mockFeelings,
  mockGuidedResources,
  mockSolutionNotes,
  moodEmojis,
  moodColors,
  Feeling,
  GuidedResource,
  SolutionNote,
  Reaction
} from '../mock/safeRoomData';

export const useSafeRoom = () => {
  const [feelings, setFeelings] = useState<Feeling[]>(mockFeelings);
  const [resources, setResources] = useState<GuidedResource[]>(mockGuidedResources);
  const [solutionNotes, setSolutionNotes] = useState<SolutionNote[]>(mockSolutionNotes);
  const [familyMembers] = useState(mockFamilyMembers);
  const [activeTab, setActiveTab] = useState<'express' | 'reflections' | 'guided' | 'board'>('express');
  const [selectedMood, setSelectedMood] = useState<'happy' | 'neutral' | 'sad' | 'angry' | 'worried' | 'excited'>('neutral');
  const [newFeelingText, setNewFeelingText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Get feelings by mood filter
  const getFeelingsByMood = (mood?: string) => {
    if (!mood) return feelings;
    return feelings.filter(feeling => feeling.mood === mood);
  };

  // Get recent feelings (last 7 days)
  const getRecentFeelings = () => {
    return feelings.slice(0, 5); // Mock: show first 5
  };

  // Get resources by category
  const getResourcesByCategory = (category?: string) => {
    if (!category) return resources;
    return resources.filter(resource => resource.category === category);
  };

  // Get active solution notes
  const getActiveSolutionNotes = () => {
    return solutionNotes.filter(note => !note.isCompleted);
  };

  // Get completed solution notes
  const getCompletedSolutionNotes = () => {
    return solutionNotes.filter(note => note.isCompleted);
  };

  // Add new feeling
  const addFeeling = (type: 'text' | 'audio' | 'video', content: string, mood: string) => {
    const newFeeling: Feeling = {
      id: Date.now().toString(),
      memberId: 'mom', // Mock: current user is mom
      memberName: 'Mom',
      memberAvatar: '👩',
      type,
      content,
      mood: mood as any,
      createdAt: 'Just now',
      reactions: [],
      supportCount: 0
    };

    setFeelings(prev => [newFeeling, ...prev]);
    Alert.alert('Success', 'Your feeling has been shared with the family!');
  };

  // Add reaction to feeling
  const addReaction = (feelingId: string, reactionType: 'heart' | 'clap' | 'star' | 'support') => {
    const newReaction: Reaction = {
      id: Date.now().toString(),
      memberId: 'mom', // Mock: current user is mom
      memberName: 'Mom',
      type: reactionType
    };

    setFeelings(prev => prev.map(feeling => {
      if (feeling.id === feelingId) {
        return {
          ...feeling,
          reactions: [...feeling.reactions, newReaction],
          supportCount: feeling.supportCount + 1
        };
      }
      return feeling;
    }));
  };

  // Add solution note
  const addSolutionNote = (text: string, color: string) => {
    const newNote: SolutionNote = {
      id: Date.now().toString(),
      memberId: 'mom', // Mock: current user is mom
      memberName: 'Mom',
      memberAvatar: '👩',
      text,
      color,
      createdAt: 'Just now',
      isCompleted: false
    };

    setSolutionNotes(prev => [newNote, ...prev]);
    Alert.alert('Success', 'New family agreement added!');
  };

  // Toggle solution note completion
  const toggleSolutionNote = (noteId: string) => {
    setSolutionNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          isCompleted: !note.isCompleted,
          completedAt: !note.isCompleted ? 'Just now' : undefined
        };
      }
      return note;
    }));
  };

  // Delete solution note
  const deleteSolutionNote = (noteId: string) => {
    Alert.alert(
      'Delete Agreement',
      'Are you sure you want to delete this family agreement?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSolutionNotes(prev => prev.filter(note => note.id !== noteId));
          }
        }
      ]
    );
  };

  // Get statistics
  const getStatistics = () => {
    const totalFeelings = feelings.length;
    const happyFeelings = feelings.filter(f => f.mood === 'happy' || f.mood === 'excited').length;
    const sadFeelings = feelings.filter(f => f.mood === 'sad' || f.mood === 'angry' || f.mood === 'worried').length;
    const totalSupport = feelings.reduce((sum, feeling) => sum + feeling.supportCount, 0);
    const activeAgreements = solutionNotes.filter(note => !note.isCompleted).length;
    const completedAgreements = solutionNotes.filter(note => note.isCompleted).length;

    return {
      totalFeelings,
      happyFeelings,
      sadFeelings,
      totalSupport,
      activeAgreements,
      completedAgreements
    };
  };

  // Handle recording
  const startRecording = () => {
    setIsRecording(true);
    // Mock recording - in real app, this would start actual recording
    setTimeout(() => {
      setIsRecording(false);
      Alert.alert('Recording Complete', 'Your voice message has been saved!');
    }, 3000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return {
    // State
    feelings,
    resources,
    solutionNotes,
    familyMembers,
    activeTab,
    selectedMood,
    newFeelingText,
    isRecording,
    
    // Setters
    setActiveTab,
    setSelectedMood,
    setNewFeelingText,
    
    // Getters
    getFeelingsByMood,
    getRecentFeelings,
    getResourcesByCategory,
    getActiveSolutionNotes,
    getCompletedSolutionNotes,
    getStatistics,
    
    // Actions
    addFeeling,
    addReaction,
    addSolutionNote,
    toggleSolutionNote,
    deleteSolutionNote,
    startRecording,
    stopRecording,
    
    // Constants
    moodEmojis,
    moodColors
  };
};