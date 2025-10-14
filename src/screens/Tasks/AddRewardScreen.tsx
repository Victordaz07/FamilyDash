/**
 * AddRewardScreen - Create new rewards for the reward catalog
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors, useThemeFonts, useThemeGradient } from '@/contexts/ThemeContext';
import { createReward } from '@/services/tasks';

// Predefined reward categories with icons and colors
const rewardCategories = [
    { id: 'screen-time', name: 'Screen Time', icon: 'phone-portrait', color: '#4CAF50', defaultPoints: 50 },
    { id: 'treat', name: 'Treat/Snack', icon: 'ice-cream', color: '#FF9800', defaultPoints: 25 },
    { id: 'toy', name: 'Toy/Game', icon: 'game-controller', color: '#E91E63', defaultPoints: 100 },
    { id: 'activity', name: 'Special Activity', icon: 'bicycle', color: '#2196F3', defaultPoints: 75 },
    { id: 'privilege', name: 'Special Privilege', icon: 'star', color: '#9C27B0', defaultPoints: 60 },
    { id: 'money', name: 'Allowance', icon: 'cash', color: '#4CAF50', defaultPoints: 200 },
    { id: 'custom', name: 'Custom Reward', icon: 'gift', color: '#607D8B', defaultPoints: 50 },
];

export default function AddRewardScreen() {
    const navigation = useNavigation();
    const colors = useThemeColors();
    const fonts = useThemeFonts();
    const gradient = useThemeGradient();

    const [name, setName] = useState('');
    const [points, setPoints] = useState('50');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCategorySelect = (categoryId: string) => {
        const category = rewardCategories.find(cat => cat.id === categoryId);
        if (category) {
            setSelectedCategory(categoryId);
            setName(category.name);
            setPoints(category.defaultPoints.toString());
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Name Required', 'Please enter a reward name.');
            return;
        }

        if (Number(points) <= 0) {
            Alert.alert('Invalid Points', 'Please enter a valid number of points (greater than 0).');
            return;
        }

        setLoading(true);

        try {
            console.log('🏆 Creating new reward:', name, 'worth', points, 'points');

            await createReward(name.trim(), Number(points));

            Alert.alert(
                'Success!',
                'Reward created successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            console.error('❌ Error creating reward:', error);
            Alert.alert(
                'Error',
                'Failed to create reward. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Header */}
            <LinearGradient
                colors={gradient}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>New Reward</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.textInverseSecondary }]}>
                            Add a reward to the catalog
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Reward Categories */}
                <View style={[styles.categoriesCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        Choose Category
                    </Text>
                    <Text style={[styles.sectionDescription, { color: colors.textSecondary, fontSize: fonts.body }]}>
                        Select a category to auto-fill the reward details
                    </Text>

                    <View style={styles.categoriesGrid}>
                        {rewardCategories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryButton,
                                    {
                                        backgroundColor: selectedCategory === category.id ? category.color : colors.border,
                                        borderColor: selectedCategory === category.id ? category.color : 'transparent'
                                    }
                                ]}
                                onPress={() => handleCategorySelect(category.id)}
                            >
                                <Ionicons
                                    name={category.icon as keyof typeof Ionicons.glyphMap}
                                    size={24}
                                    color={selectedCategory === category.id ? 'white' : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    {
                                        color: selectedCategory === category.id ? 'white' : colors.textSecondary,
                                        fontSize: fonts.caption
                                    }
                                ]}>
                                    {category.name}
                                </Text>
                                <Text style={[
                                    styles.categoryPoints,
                                    {
                                        color: selectedCategory === category.id ? 'rgba(255,255,255,0.8)' : colors.textSecondary,
                                        fontSize: fonts.caption
                                    }
                                ]}>
                                    {category.defaultPoints} pts
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Reward Details */}
                <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                        Reward Details
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                            Reward Name *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.inputBackground,
                                    fontSize: fonts.body
                                }
                            ]}
                            placeholder="e.g., Extra Screen Time, Ice Cream, New Toy..."
                            placeholderTextColor={colors.textSecondary}
                            value={name}
                            onChangeText={setName}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.inputLabel, { color: colors.text, fontSize: fonts.body }]}>
                            Points Value *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderColor: colors.border,
                                    color: colors.text,
                                    backgroundColor: colors.inputBackground,
                                    fontSize: fonts.body
                                }
                            ]}
                            placeholder="50"
                            placeholderTextColor={colors.textSecondary}
                            value={points}
                            onChangeText={setPoints}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                        <Text style={[styles.inputHint, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                            How many points this reward costs to redeem
                        </Text>
                    </View>
                </View>

                {/* Preview */}
                {(name || selectedCategory) && (
                    <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fonts.h3 }]}>
                            Preview
                        </Text>
                        <View style={styles.previewContent}>
                            <View style={styles.previewHeader}>
                                <View style={[styles.previewIconContainer, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="star" size={24} color="white" />
                                </View>
                                <View style={styles.previewTextContainer}>
                                    <Text style={[styles.previewName, { color: colors.text, fontSize: fonts.h3 }]}>
                                        {name || 'Reward Name'}
                                    </Text>
                                    <Text style={[styles.previewPoints, { color: colors.warning, fontSize: fonts.body }]}>
                                        {points} points
                                    </Text>
                                </View>
                            </View>

                            {selectedCategory && (
                                <View style={styles.previewCategory}>
                                    <Text style={[styles.previewCategoryLabel, { color: colors.textSecondary, fontSize: fonts.caption }]}>
                                        Category: {rewardCategories.find(cat => cat.id === selectedCategory)?.name}
                                    </Text>
                                </View>
                            )}

                            <View style={[styles.previewStatus, { backgroundColor: colors.success }]}>
                                <Ionicons name="checkmark-circle" size={16} color="white" />
                                <Text style={[styles.previewStatusText, { color: 'white', fontSize: fonts.caption }]}>
                                    Ready to be redeemed
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Create Button */}
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleSave}
                    disabled={loading || !name.trim() || Number(points) <= 0}
                >
                    <LinearGradient
                        colors={gradient as readonly [string, string]}
                        style={[
                            styles.createButtonGradient,
                            (!name.trim() || Number(points) <= 0 || loading) && styles.createButtonDisabled
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="gift" size={20} color="white" style={styles.buttonIcon} />
                        <Text style={[styles.createButtonText, { fontSize: fonts.button }]}>
                            {loading ? 'Creating...' : 'Create Reward'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginRight: 15,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    categoriesCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    sectionDescription: {
        marginBottom: 16,
        lineHeight: 18,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    categoryButton: {
        width: '47%',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryText: {
        marginTop: 8,
        fontWeight: '600',
        textAlign: 'center',
    },
    categoryPoints: {
        marginTop: 4,
        textAlign: 'center',
    },
    formCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontWeight: '600',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
    },
    inputHint: {
        marginTop: 4,
        fontStyle: 'italic',
    },
    previewCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    previewContent: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    previewIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    previewTextContainer: {
        flex: 1,
    },
    previewName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    previewPoints: {
        fontWeight: '600',
    },
    previewCategory: {
        marginBottom: 12,
    },
    previewCategoryLabel: {
        fontStyle: 'italic',
    },
    previewStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    previewStatusText: {
        marginLeft: 6,
        fontWeight: 'bold',
    },
    createButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
    },
    createButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    createButtonDisabled: {
        opacity: 0.6,
    },
    buttonIcon: {
        marginRight: 10,
    },
    createButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
