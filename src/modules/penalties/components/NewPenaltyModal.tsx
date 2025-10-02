import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockFamilyMembers, penaltyTypeConfigs, penaltySelectionMethods, penaltyCategories } from '../mock/penaltiesData';
import PenaltyRoulette from './PenaltyRoulette';
import { theme } from '../../../styles/simpleTheme';

interface NewPenaltyModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (penaltyData: NewPenaltyData) => void;
}

interface NewPenaltyData {
    memberId: string;
    memberName: string;
    memberAvatar: string;
    reason: string;
    duration: number;
    category: 'behavior' | 'chores' | 'screen_time' | 'homework' | 'other';
    penaltyType: 'yellow' | 'red';
    selectionMethod: 'fixed' | 'random';
    createdBy: string;
}

const NewPenaltyModal: React.FC<NewPenaltyModalProps> = ({ visible, onClose, onSubmit }) => {
    const insets = useSafeAreaInsets();

    const [formData, setFormData] = useState<NewPenaltyData>({
        memberId: '',
        memberName: '',
        memberAvatar: '',
        reason: '',
        duration: 3,
        category: 'behavior',
        penaltyType: 'yellow',
        selectionMethod: 'fixed',
        createdBy: 'mom',
    });

    const [showRoulette, setShowRoulette] = useState(false);

    const handleSubmit = () => {
        if (!formData.memberId) {
            Alert.alert('Error', 'Por favor selecciona un miembro de la familia');
            return;
        }
        if (!formData.reason.trim()) {
            Alert.alert('Error', 'Por favor ingresa una razón para la penalidad');
            return;
        }

        onSubmit(formData);
        onClose();
    };

    const selectMember = (member: any) => {
        setFormData({
            ...formData,
            memberId: member.id,
            memberName: member.name,
            memberAvatar: member.avatar,
        });
    };

    const selectPenaltyType = (type: 'yellow' | 'red') => {
        const config = penaltyTypeConfigs.find(c => c.type === type);
        setFormData({
            ...formData,
            penaltyType: type,
            duration: config?.minDays || 3,
        });
    };

    const selectSelectionMethod = (method: 'fixed' | 'random') => {
        setFormData({
            ...formData,
            selectionMethod: method,
        });

        if (method === 'random') {
            setShowRoulette(true);
        }
    };

    const handleRouletteResult = (duration: number) => {
        setFormData({
            ...formData,
            duration,
        });
        setShowRoulette(false);
    };

    const selectCategory = (category: NewPenaltyData['category']) => {
        setFormData({
            ...formData,
            category,
        });
    };

    const selectDuration = (duration: number) => {
        setFormData({
            ...formData,
            duration,
        });
    };

    const currentTypeConfig = penaltyTypeConfigs.find(c => c.type === formData.penaltyType);
    const currentMethodConfig = penaltySelectionMethods.find(m => m.method === formData.selectionMethod);

    if (!visible) return null;

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                transparent={true}
                onRequestClose={onClose}
            >
                <View style={styles.modalOverlay}>
                    <ScrollView
                        style={[styles.modalContent, { paddingBottom: insets.bottom + 24 }]}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nueva Penalidad</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Select Member */}
                        <Text style={styles.sectionTitle}>Seleccionar Miembro</Text>
                        <View style={styles.memberGrid}>
                            {mockFamilyMembers.filter(m => m.role !== 'parent').map((member) => (
                                <TouchableOpacity
                                    key={member.id}
                                    style={[
                                        styles.memberOption,
                                        formData.memberId === member.id && styles.memberSelected
                                    ]}
                                    onPress={() => selectMember(member)}
                                >
                                    <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                                    <Text style={styles.memberName}>{member.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Select Penalty Type */}
                        <Text style={styles.sectionTitle}>Tipo de Penalidad</Text>
                        <View style={styles.typeGrid}>
                            {penaltyTypeConfigs.map((config) => (
                                <TouchableOpacity
                                    key={config.type}
                                    style={[
                                        styles.typeOption,
                                        { borderColor: config.color },
                                        formData.penaltyType === config.type && {
                                            backgroundColor: config.color,
                                            borderColor: config.color
                                        }
                                    ]}
                                    onPress={() => selectPenaltyType(config.type)}
                                >
                                    <Ionicons
                                        name={config.icon as any}
                                        size={24}
                                        color={formData.penaltyType === config.type ? 'white' : config.color}
                                    />
                                    <Text style={[
                                        styles.typeText,
                                        { color: formData.penaltyType === config.type ? 'white' : config.color }
                                    ]}>
                                        {config.name}
                                    </Text>
                                    <Text style={[
                                        styles.typeSubtext,
                                        { color: formData.penaltyType === config.type ? 'white' : config.color }
                                    ]}>
                                        {config.minDays}-{config.maxDays} días
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Select Selection Method */}
                        <Text style={styles.sectionTitle}>Método de Selección</Text>
                        <View style={styles.methodGrid}>
                            {penaltySelectionMethods.map((method) => (
                                <TouchableOpacity
                                    key={method.method}
                                    style={[
                                        styles.methodOption,
                                        formData.selectionMethod === method.method && styles.methodSelected
                                    ]}
                                    onPress={() => selectSelectionMethod(method.method)}
                                >
                                    <Ionicons
                                        name={method.icon as any}
                                        size={20}
                                        color={formData.selectionMethod === method.method ? 'white' : theme.colors.text}
                                    />
                                    <Text style={[
                                        styles.methodText,
                                        { color: formData.selectionMethod === method.method ? 'white' : theme.colors.text }
                                    ]}>
                                        {method.name}
                                    </Text>
                                    <Text style={[
                                        styles.methodSubtext,
                                        { color: formData.selectionMethod === method.method ? 'white' : theme.colors.gray }
                                    ]}>
                                        {method.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Duration Selection (only for fixed method) */}
                        {formData.selectionMethod === 'fixed' && currentTypeConfig && (
                            <>
                                <Text style={styles.sectionTitle}>Duración (días)</Text>
                                <View style={styles.durationGrid}>
                                    {currentTypeConfig.durationOptions.map((duration) => (
                                        <TouchableOpacity
                                            key={duration}
                                            style={[
                                                styles.durationOption,
                                                { borderColor: currentTypeConfig.color },
                                                formData.duration === duration && {
                                                    backgroundColor: currentTypeConfig.color,
                                                    borderColor: currentTypeConfig.color
                                                }
                                            ]}
                                            onPress={() => selectDuration(duration)}
                                        >
                                            <Text style={[
                                                styles.durationText,
                                                { color: formData.duration === duration ? 'white' : currentTypeConfig.color }
                                            ]}>
                                                {duration}d
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Selected Duration Display (for random method) */}
                        {formData.selectionMethod === 'random' && (
                            <View style={styles.selectedDurationContainer}>
                                <Text style={styles.sectionTitle}>Duración Seleccionada</Text>
                                <View style={[
                                    styles.selectedDurationCard,
                                    { backgroundColor: currentTypeConfig?.color + '20', borderColor: currentTypeConfig?.color }
                                ]}>
                                    <Ionicons
                                        name={currentTypeConfig?.icon as any}
                                        size={24}
                                        color={currentTypeConfig?.color}
                                    />
                                    <Text style={[styles.selectedDurationText, { color: currentTypeConfig?.color }]}>
                                        {formData.duration} días
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Select Category */}
                        <Text style={styles.sectionTitle}>Categoría</Text>
                        <View style={styles.categoryGrid}>
                            {penaltyCategories.map((category) => (
                                <TouchableOpacity
                                    key={category.id}
                                    style={[
                                        styles.categoryOption,
                                        { borderColor: category.color },
                                        formData.category === category.id && {
                                            backgroundColor: category.color,
                                            borderColor: category.color
                                        }
                                    ]}
                                    onPress={() => selectCategory(category.id as any)}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={16}
                                        color={formData.category === category.id ? 'white' : category.color}
                                    />
                                    <Text style={[
                                        styles.categoryText,
                                        { color: formData.category === category.id ? 'white' : category.color }
                                    ]}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Reason Input */}
                        <Text style={styles.sectionTitle}>Razón</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Ej: No limpió su habitación"
                            value={formData.reason}
                            onChangeText={(text) => setFormData({ ...formData, reason: text })}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary, theme.colors.primaryDark]}
                                style={styles.submitButtonGradient}
                            >
                                <Ionicons name="add-circle" size={20} color="white" />
                                <Text style={styles.submitButtonText}>Crear Penalidad</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Roulette Modal */}
            {showRoulette && currentTypeConfig && (
                <PenaltyRoulette
                    durationOptions={currentTypeConfig.durationOptions}
                    penaltyType={formData.penaltyType}
                    onResult={handleRouletteResult}
                    onClose={() => setShowRoulette(false)}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.cardBackground,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.text,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.semibold,
        color: theme.colors.text,
        marginBottom: 12,
        marginTop: 16,
    },
    memberGrid: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    memberOption: {
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        minWidth: 80,
    },
    memberSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.text,
    },
    typeGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    typeOption: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    typeText: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.bold,
        marginTop: 8,
        textAlign: 'center',
    },
    typeSubtext: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    methodGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    methodOption: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    methodSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    methodText: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeight.medium,
        marginTop: 8,
        textAlign: 'center',
    },
    methodSubtext: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    durationGrid: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    durationOption: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
        minWidth: 60,
    },
    durationText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.bold,
    },
    selectedDurationContainer: {
        marginBottom: 16,
    },
    selectedDurationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        backgroundColor: theme.colors.background,
    },
    selectedDurationText: {
        fontSize: 18,
        fontWeight: theme.typography.fontWeight.bold,
        marginLeft: 12,
    },
    categoryGrid: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    categoryOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    categoryText: {
        fontSize: 14,
        marginLeft: 6,
        textTransform: 'capitalize',
    },
    textInput: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.small,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        backgroundColor: theme.colors.background,
        marginBottom: 24,
        textAlignVertical: 'top',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: theme.typography.fontWeight.bold,
        color: 'white',
        marginLeft: 8,
    },
});

export default NewPenaltyModal;