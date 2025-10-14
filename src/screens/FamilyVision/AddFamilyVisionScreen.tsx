/**
 * 🎯 CREATE FAMILY GOAL SCREEN — FamilyDash+
 * Create specific, measurable family goals with milestones and deadlines
 */

import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFamily } from '@/store';
import { useAuth } from '@/store';

export default function AddFamilyVisionScreen() {
    const navigation = useNavigation();
    const { createVision } = useFamily();
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [targetDate, setTargetDate] = useState("");
    const [milestone, setMilestone] = useState("");
    const [milestones, setMilestones] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: "spiritual", name: "Spiritual", icon: "leaf", color: "#81C784" },
        { id: "family", name: "Family", icon: "heart", color: "#F48FB1" },
        { id: "personal", name: "Personal", icon: "star", color: "#FFD54F" },
        { id: "health", name: "Health", icon: "fitness", color: "#4FC3F7" },
    ];

    const handleCreateVision = async () => {
        if (!title.trim()) {
            Alert.alert("Missing Title", "Please enter a title for your family vision");
            return;
        }

        if (!category) {
            Alert.alert("Missing Category", "Please select a category for your vision");
            return;
        }

        if (!user?.uid) {
            Alert.alert("Error", "You must be logged in to create a vision");
            return;
        }

        setLoading(true);
        try {
            const visionData = {
                title: title.trim(),
                description: description.trim(),
                category: category as any,
                progress: 0,
                createdBy: user.uid,
                assignedTo: [user.uid],
                status: 'active' as const,
                milestones: milestones.map((milestone, index) => ({
                    id: `milestone_${index}`,
                    title: milestone,
                    description: '',
                    completed: false,
                    completedAt: undefined,
                    completedBy: undefined
                })),
                targetDate: targetDate ? new Date(targetDate) : undefined,
                notes: ''
            };

            const success = await createVision(visionData);
            
            if (success) {
                Alert.alert("Vision Created", "Your family vision has been created! 🌟", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert("Error", "Failed to create vision. Please try again.");
            }
        } catch (error) {
            console.error('Error creating vision:', error);
            Alert.alert("Error", "An error occurred while creating the vision.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <LinearGradient colors={["#7B6CF6", "#E96AC0"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerText}>
                        <Text style={styles.headerTitle}>Create Family Goal</Text>
                        <Text style={styles.headerSubtitle}>Set a specific goal with milestones and deadlines 🎯</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* FORM */}
            <View style={styles.form}>
                {/* TITLE INPUT */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Vision Title</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="What's your family's dream?"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />
                </View>

                {/* DESCRIPTION INPUT */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                        style={[styles.textInput, styles.textArea]}
                        placeholder="Describe how you'll achieve this together..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                {/* CATEGORY SELECTION */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryCard,
                                    category === cat.id && styles.categoryCardSelected,
                                    { borderColor: cat.color }
                                ]}
                                onPress={() => setCategory(cat.id)}
                            >
                                <Ionicons
                                    name={cat.icon as any}
                                    size={24}
                                    color={category === cat.id ? "white" : cat.color}
                                />
                                <Text style={[
                                    styles.categoryText,
                                    category === cat.id && styles.categoryTextSelected
                                ]}>
                                    {cat.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* CREATE BUTTON */}
                <TouchableOpacity 
                    style={[styles.createButton, loading && styles.createButtonDisabled]} 
                    onPress={handleCreateVision}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={loading ? ["#ccc", "#999"] : ["#7B6CF6", "#E96AC0"]}
                        style={styles.createButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {loading ? (
                            <>
                                <Ionicons name="hourglass" size={20} color="white" />
                                <Text style={styles.createButtonText}>Creating...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="sparkles" size={20} color="white" />
                                <Text style={styles.createButtonText}>Create Vision</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9FF" },

    header: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: { fontSize: 24, color: "#fff", fontWeight: "800" },
    headerSubtitle: { fontSize: 14, color: "#EEE", marginTop: 4 },

    form: { padding: 20 },

    inputGroup: { marginBottom: 24 },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8
    },
    textInput: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: "#333",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },

    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    categoryCard: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        width: "47%",
        borderWidth: 2,
        borderColor: "#E5E7EB",
        elevation: 2,
    },
    categoryCardSelected: {
        backgroundColor: "#6C63FF",
    },
    categoryText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginTop: 8,
    },
    categoryTextSelected: {
        color: "white",
    },

    createButton: {
        marginTop: 20,
        borderRadius: 25,
        overflow: "hidden",
        elevation: 4,
    },
    createButtonDisabled: {
        opacity: 0.6,
        elevation: 2,
    },
    createButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    createButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 8,
    },
});
