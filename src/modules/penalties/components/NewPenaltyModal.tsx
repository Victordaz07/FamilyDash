import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { penaltyTypes, commonReasons, mockFamilyMembers } from '../mock/penalties';

interface NewPenaltyModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (penaltyData: NewPenaltyData) => void;
}

interface NewPenaltyData {
    memberId: string;
    penaltyType: string;
    reason: string;
    duration: number;
    description: string;
}

const NewPenaltyModal: React.FC<NewPenaltyModalProps> = ({ visible, onClose, onSubmit }) => {
    console.log('NewPenaltyModal render - visible:', visible);
    
    if (!visible) {
        console.log('Modal not visible, returning null');
        return null;
    }

    const [formData, setFormData] = useState<NewPenaltyData>({
        memberId: '',
        penaltyType: '',
        reason: '',
        duration: 15,
        description: ''
    });

    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [customReason, setCustomReason] = useState<string>('');

    const handleSubmit = () => {
        if (!selectedMember) {
            Alert.alert('Error', 'Please select a family member');
            return;
        }
        if (!selectedType) {
            Alert.alert('Error', 'Please select a penalty type');
            return;
        }
        if (!formData.reason.trim() && !customReason.trim()) {
            Alert.alert('Error', 'Please enter a reason for the penalty');
            return;
        }

        const penaltyData = {
            ...formData,
            memberId: selectedMember,
            penaltyType: selectedType,
            reason: customReason.trim() || formData.reason
        };

        onSubmit(penaltyData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            memberId: '',
            penaltyType: '',
            reason: '',
            duration: 15,
            description: ''
        });
        setSelectedMember('');
        setSelectedType('');
        setCustomReason('');
        onClose();
    };

    const getSelectedMemberInfo = () => {
        return mockFamilyMembers.find(member => member.id === selectedMember);
    };

    const getSelectedTypeInfo = () => {
        return penaltyTypes.find(type => type.id === selectedType);
    };

    const durationOptions = [
        { value: 5, label: '5 minutes' },
        { value: 10, label: '10 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 120, label: '2 hours' },
        { value: 180, label: '3 hours' }
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#EF4444', '#DC2626']}
                        style={styles.modalHeader}
                    >
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>New Penalty</Text>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                            <Text style={styles.saveButtonText}>Create</Text>
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        {/* Family Member Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Family Member *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.membersScrollView}>
                                {mockFamilyMembers.map(member => (
                                    <TouchableOpacity
                                        key={member.id}
                                        style={[
                                            styles.memberOption,
                                            { backgroundColor: selectedMember === member.id ? '#EF4444' : '#F3F4F6' }
                                        ]}
                                        onPress={() => setSelectedMember(member.id)}
                                    >
                                        <View style={styles.memberAvatar}>
                                            <Text style={styles.memberAvatarText}>
                                                {member.name.charAt(0)}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.memberName,
                                            { color: selectedMember === member.id ? 'white' : '#374151' }
                                        ]}>
                                            {member.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Penalty Type Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Penalty Type *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScrollView}>
                                {penaltyTypes.map(type => (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeOption,
                                            { backgroundColor: selectedType === type.id ? type.color : '#F3F4F6' }
                                        ]}
                                        onPress={() => setSelectedType(type.id)}
                                    >
                                        <Ionicons
                                            name={type.icon as any}
                                            size={20}
                                            color={selectedType === type.id ? 'white' : type.color}
                                        />
                                        <Text style={[
                                            styles.typeOptionText,
                                            { color: selectedType === type.id ? 'white' : '#374151' }
                                        ]}>
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Duration Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Duration *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationScrollView}>
                                {durationOptions.map(option => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.durationOption,
                                            { backgroundColor: formData.duration === option.value ? '#EF4444' : '#F3F4F6' }
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, duration: option.value }))}
                                    >
                                        <Text style={[
                                            styles.durationOptionText,
                                            { color: formData.duration === option.value ? 'white' : '#374151' }
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Reason Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Reason *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reasonsScrollView}>
                                {commonReasons.map((reason, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.reasonOption,
                                            { backgroundColor: formData.reason === reason ? '#F59E0B' : '#F3F4F6' }
                                        ]}
                                        onPress={() => setFormData(prev => ({ ...prev, reason }))}
                                    >
                                        <Text style={[
                                            styles.reasonOptionText,
                                            { color: formData.reason === reason ? 'white' : '#374151' }
                                        ]}>
                                            {reason}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Custom Reason */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Custom Reason</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter custom reason..."
                                value={customReason}
                                onChangeText={setCustomReason}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Description</Text>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                placeholder="Additional details about this penalty..."
                                value={formData.description}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Preview */}
                        {(selectedMember || selectedType) && (
                            <View style={styles.previewSection}>
                                <Text style={styles.previewTitle}>Preview</Text>
                                <View style={styles.previewCard}>
                                    <View style={styles.previewHeader}>
                                        <View style={styles.previewAvatar}>
                                            <Text style={styles.previewAvatarText}>
                                                {getSelectedMemberInfo()?.name.charAt(0) || '?'}
                                            </Text>
                                        </View>
                                        <View style={styles.previewInfo}>
                                            <Text style={styles.previewMemberName}>
                                                {getSelectedMemberInfo()?.name || 'Select Member'}
                                            </Text>
                                            <Text style={styles.previewPenaltyType}>
                                                {getSelectedTypeInfo()?.name || 'Select Type'}
                                            </Text>
                                        </View>
                                        <View style={styles.previewDuration}>
                                            <Text style={styles.previewDurationText}>
                                                {formData.duration}m
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.previewReason}>
                                        Reason: {customReason.trim() || formData.reason || 'No reason specified'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Quick Actions */}
                        <View style={styles.quickActionsContainer}>
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => setFormData(prev => ({ ...prev, duration: 15 }))}
                            >
                                <Ionicons name="time" size={16} color="#EF4444" />
                                <Text style={styles.quickActionText}>15 min</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => setFormData(prev => ({ ...prev, duration: 30 }))}
                            >
                                <Ionicons name="hourglass" size={16} color="#EF4444" />
                                <Text style={styles.quickActionText}>30 min</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.quickActionButton}
                                onPress={() => setFormData(prev => ({ ...prev, duration: 60 }))}
                            >
                                <Ionicons name="timer" size={16} color="#EF4444" />
                                <Text style={styles.quickActionText}>1 hour</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom spacing for fixed button */}
                        <View style={styles.bottomSpacing} />
                    </ScrollView>

                    {/* Fixed Create Button */}
                    <View style={styles.fixedButtonContainer}>
                        <LinearGradient
                            colors={['#EF4444', '#DC2626']}
                            style={styles.fixedCreateButton}
                        >
                            <TouchableOpacity style={styles.fixedCreateButtonTouch} onPress={handleSubmit}>
                                <Text style={styles.fixedCreateButtonText}>Create Penalty</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        width: '100%',
        maxHeight: '90%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: '#EF4444',
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    saveButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    modalContent: {
        padding: 20,
        paddingBottom: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    membersScrollView: {
        marginTop: 8,
    },
    memberOption: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
        gap: 8,
    },
    memberAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    memberName: {
        fontSize: 14,
        fontWeight: '500',
    },
    typesScrollView: {
        marginTop: 8,
    },
    typeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
        gap: 8,
    },
    typeOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    durationScrollView: {
        marginTop: 8,
    },
    durationOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
    },
    durationOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    reasonsScrollView: {
        marginTop: 8,
    },
    reasonOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 12,
    },
    reasonOptionText: {
        fontSize: 14,
        fontWeight: '500',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    previewSection: {
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    previewCard: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    previewAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    previewAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    previewInfo: {
        flex: 1,
    },
    previewMemberName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#374151',
    },
    previewPenaltyType: {
        fontSize: 14,
        color: '#6B7280',
    },
    previewDuration: {
        alignItems: 'flex-end',
    },
    previewDurationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    previewReason: {
        fontSize: 14,
        color: '#6B7280',
    },
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    quickActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    quickActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#EF4444',
    },
    bottomSpacing: {
        height: 80,
    },
    fixedButtonContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    fixedCreateButton: {
        borderRadius: 12,
        paddingVertical: 16,
    },
    fixedCreateButtonTouch: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    fixedCreateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
});

export default NewPenaltyModal;
