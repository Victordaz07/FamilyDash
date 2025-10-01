import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GuidedResource } from '../mock/safeRoomData';

interface ResourceCardProps {
    resource: GuidedResource;
    onPress: (resource: GuidedResource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onPress }) => {
    const getCategoryColor = (category: string) => {
        const colors = {
            communication: '#3B82F6',
            frustration: '#EF4444',
            breathing: '#10B981',
            mindfulness: '#8B5CF6'
        };
        return colors[category as keyof typeof colors] || '#6B7280';
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return 'videocam';
            case 'audio':
                return 'headset';
            case 'exercise':
                return 'fitness';
            default:
                return 'play-circle';
        }
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onPress(resource)}
        >
            <View style={styles.thumbnail}>
                <Text style={styles.thumbnailEmoji}>{resource.thumbnail}</Text>
                <View style={styles.typeIcon}>
                    <Ionicons
                        name={getTypeIcon(resource.type)}
                        size={16}
                        color="white"
                    />
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{resource.title}</Text>
                <Text style={styles.description}>{resource.description}</Text>

                <View style={styles.footer}>
                    <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(resource.category) }]}>
                        <Text style={styles.categoryText}>
                            {resource.category.charAt(0).toUpperCase() + resource.category.slice(1)}
                        </Text>
                    </View>
                    <Text style={styles.duration}>{resource.duration}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        width: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    thumbnail: {
        height: 80,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    thumbnailEmoji: {
        fontSize: 32,
    },
    typeIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 6,
    },
    description: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '500',
    },
    duration: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
});

export default ResourceCard;
