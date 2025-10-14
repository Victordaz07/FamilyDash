import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SolutionNote } from '../mock/safeRoomData';

interface StickyNoteProps {
    note: SolutionNote;
    onToggle: (noteId: string) => void;
    onDelete: (noteId: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onToggle, onDelete }) => {
    return (
        <View style={[styles.note, { backgroundColor: note.color }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.memberInfo}>
                    <Text style={styles.avatar}>{note.memberAvatar}</Text>
                    <Text style={styles.memberName}>{note.memberName}</Text>
                </View>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onDelete(note.id)}
                >
                    <Ionicons name="close" size={16} color="rgba(0,0,0,0.6)" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <Text style={styles.text}>{note.text}</Text>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.date}>
                    {note.isCompleted ? `Completed ${note.completedAt}` : `Created ${note.createdAt}`}
                </Text>

                <TouchableOpacity
                    style={[styles.checkButton, note.isCompleted && styles.checkButtonCompleted]}
                    onPress={() => onToggle(note.id)}
                >
                    <Ionicons
                        name={note.isCompleted ? "checkmark-circle" : "ellipse-outline"}
                        size={20}
                        color={note.isCompleted ? "#4CAF50" : "rgba(0,0,0,0.6)"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    note: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        marginRight: 12,
        width: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        fontSize: 16,
        marginRight: 6,
    },
    memberName: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(0,0,0,0.8)',
    },
    deleteButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.9)',
        lineHeight: 18,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 10,
        color: 'rgba(0,0,0,0.6)',
        flex: 1,
    },
    checkButton: {
        padding: 4,
    },
    checkButtonCompleted: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderRadius: 12,
    },
});

export default StickyNote;




