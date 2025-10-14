import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VoteOptionProps {
    option: {
        id: string;
        title: string;
        description: string;
        votes: number;
        voters: string[];
        poster?: string;
        rating?: number;
        duration?: string;
        genre?: string;
        tags?: string[];
    };
    isSelected?: boolean;
    onPress?: () => void;
    onVote?: () => void;
    showVoteButton?: boolean;
}

const VoteOption: React.FC<VoteOptionProps> = ({
    option,
    isSelected = false,
    onPress,
    onVote,
    showVoteButton = false
}) => {
    const getProgressPercentage = () => {
        const totalVotes = option.votes;
        return Math.min((totalVotes / 4) * 100, 100); // Assuming max 4 family members
    };

    return (
        <TouchableOpacity
            style={[styles.optionCard, isSelected && styles.selectedCard]}
            onPress={onPress}
        >
            {option.poster && (
                <Image source={{ uri: option.poster }} style={styles.posterImage} />
            )}

            <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    {isSelected && (
                        <View style={styles.selectedBadge}>
                            <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                    )}
                </View>

                <Text style={styles.optionDescription}>{option.description}</Text>

                {option.tags && option.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {option.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {option.rating && (
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.ratingText}>{option.rating}</Text>
                    </View>
                )}

                <View style={styles.votesContainer}>
                    <Text style={styles.votesText}>{option.votes} vote{option.votes !== 1 ? 's' : ''}</Text>

                    <View style={styles.votersContainer}>
                        {option.voters.map((avatar, index) => (
                            <Image
                                key={index}
                                source={{ uri: avatar }}
                                style={[styles.voterAvatar, { marginLeft: index > 0 ? -4 : 0 }]}
                            />
                        ))}
                        {option.votes > 0 && (
                            <Text style={styles.votedText}>voted for this</Text>
                        )}
                    </View>
                </View>

                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${getProgressPercentage()}%`,
                                    backgroundColor: isSelected ? '#3B82F6' : '#8B5CF6'
                                }
                            ]}
                        />
                    </View>
                </View>

                {showVoteButton && !isSelected && (
                    <TouchableOpacity
                        style={[styles.voteButton, { borderColor: '#8B5CF6' }]}
                        onPress={onVote}
                    >
                        <Text style={[styles.voteButtonText, { color: '#8B5CF6' }]}>Vote for This</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    optionCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCard: {
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    posterImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 12,
    },
    optionContent: {
        flex: 1,
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
        flex: 1,
    },
    selectedBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tag: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 4,
        fontWeight: '500',
    },
    votesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    votesText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    votersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    voterAvatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'white',
    },
    votedText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 8,
    },
    progressBarContainer: {
        marginBottom: 12,
    },
    progressBarBackground: {
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
    },
    progressBarFill: {
        height: 4,
        borderRadius: 2,
    },
    voteButton: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
    },
    voteButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default VoteOption;




