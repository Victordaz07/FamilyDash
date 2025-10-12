/**
 * 🎯 FAMILY GOALS SCREEN — FamilyDash+
 * Powerful dashboard for family goals, targets, and achievements.
 * Track progress, celebrate milestones, achieve together 🏆
 */

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useFamily } from "../../contexts/FamilyContext";
import { useAuth } from "../../contexts/AuthContext";

const screenWidth = Dimensions.get("window").width;

export default function FamilyVisionScreen({ navigation }: any) {
    const { visions, visionsLoading, reflections, reflectionsLoading, familyStats } = useFamily();
    const { user } = useAuth();

    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* HEADER */}
            <LinearGradient colors={["#7B6CF6", "#E96AC0"]} style={styles.header}>
                <Text style={styles.headerTitle}>Family Goals</Text>
                <Text style={styles.headerSubtitle}>
                    Achieve your targets, together 🎯
                </Text>
            </LinearGradient>

            {/* DASHBOARD */}
            <View style={styles.statsRow}>
                <VisionStat icon="trophy" label="Goals" value={visions.length} color="#FFD54F" />
                <VisionStat icon="heart" label="Reflections" value={reflections.length} color="#F48FB1" />
                <VisionStat icon="sparkles" label="In Progress" value={visions.filter(v => v.progress > 0 && v.progress < 100).length} color="#81C784" />
            </View>

            {/* GOALS GALLERY */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="images-outline" size={20} color="#6C63FF" />
                    <Text style={styles.sectionTitle}>Goals Gallery</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                    Visual inspiration for your family goals and dreams.
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("AddInspiration")}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addText}>Add Goal Inspiration</Text>
                </TouchableOpacity>
            </View>

            {/* GOAL TRACKER */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="flag-outline" size={20} color="#6C63FF" />
                    <Text style={styles.sectionTitle}>Goal Tracker</Text>
                </View>
                {visions.length === 0 ? (
                    <EmptyState
                        icon="flag"
                        message="No goals yet — create your first family target!"
                        button="Create Goal"
                        onPress={() => navigation.navigate("AddGoal")}
                    />
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.goalsScrollView}
                    >
                        {visions.map((goal) => (
                            <EnhancedGoalCard 
                                key={goal.id} 
                                goal={goal} 
                                onPress={() => navigation.navigate('GoalDetails', { goalId: goal.id })}
                            />
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* REFLECTION CORNER */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="leaf-outline" size={20} color="#6C63FF" />
                    <Text style={styles.sectionTitle}>Reflection Corner</Text>
                </View>
                {reflections.map((reflection, index) => (
                    <Animated.View
                        key={reflection.id}
                        style={[
                            styles.reflectionCard,
                            {
                                opacity: fadeAnim,
                                transform: [{
                                    translateY: fadeAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    })
                                }]
                            }
                        ]}
                    >
                        <Text style={styles.reflectionText}>{reflection.content}</Text>
                    </Animated.View>
                ))}
            </View>

            {/* CTA */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={() => navigation.navigate("AddGoal")}
                >
                    <Ionicons name="add-outline" size={22} color="#fff" />
                    <Text style={styles.ctaText}>Create New Family Goal</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

function VisionStat({ icon, label, value, color }: any) {
    return (
        <View style={[styles.statCard, { borderBottomColor: color }]}>
            <Ionicons name={icon} size={22} color={color} />
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function EnhancedGoalCard({ goal, onPress }: any) {
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'spiritual': return 'leaf';
            case 'family': return 'heart';
            case 'personal': return 'star';
            case 'health': return 'fitness';
            case 'education': return 'school';
            case 'financial': return 'card';
            case 'relationship': return 'people';
            default: return 'flag';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'spiritual': return '#81C784';
            case 'family': return '#F48FB1';
            case 'personal': return '#FFD54F';
            case 'health': return '#4FC3F7';
            case 'education': return '#9575CD';
            case 'financial': return '#FFB74D';
            case 'relationship': return '#F06292';
            default: return '#6C63FF';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'En Progreso';
            case 'completed': return 'Completado';
            case 'paused': return 'Pausado';
            case 'cancelled': return 'Cancelado';
            default: return 'Activo';
        }
    };

    const completedMilestones = goal.milestones?.filter((m: any) => m.completed).length || 0;
    const totalMilestones = goal.milestones?.length || 0;
    const categoryColor = getCategoryColor(goal.category);
    const categoryIcon = getCategoryIcon(goal.category);

    return (
        <TouchableOpacity style={styles.enhancedGoalCard} onPress={onPress}>
            {/* Header with category */}
            <View style={styles.goalHeader}>
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                    <Ionicons name={categoryIcon} size={16} color="white" />
                </View>
                <Text style={styles.goalStatus}>{getStatusText(goal.status)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.enhancedGoalTitle} numberOfLines={2}>
                {goal.title}
            </Text>

            {/* Description */}
            {goal.description && (
                <Text style={styles.goalDescription} numberOfLines={2}>
                    {goal.description}
                </Text>
            )}

            {/* Progress Section */}
            <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progreso</Text>
                    <Text style={styles.progressPercent}>{goal.progress}%</Text>
                </View>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                        <View 
                            style={[
                                styles.progressBarFill, 
                                { 
                                    width: `${goal.progress}%`,
                                    backgroundColor: categoryColor
                                }
                            ]} 
                        />
                    </View>
                </View>
            </View>

            {/* Milestones */}
            {totalMilestones > 0 && (
                <View style={styles.milestonesSection}>
                    <View style={styles.milestonesInfo}>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                        <Text style={styles.milestonesText}>
                            {completedMilestones}/{totalMilestones} hitos completados
                        </Text>
                    </View>
                </View>
            )}

            {/* Target Date */}
            {goal.targetDate && (
                <View style={styles.dateSection}>
                    <Ionicons name="calendar" size={14} color="#666" />
                    <Text style={styles.dateText}>
                        Meta: {new Date(goal.targetDate).toLocaleDateString('es-ES')}
                    </Text>
                </View>
            )}

            {/* Action Button */}
            <View style={styles.goalActions}>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: categoryColor }]}>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

function EmptyState({ icon, message, button, onPress }: any) {
    return (
        <View style={styles.emptyState}>
            <Ionicons name={`${icon}-outline`} size={60} color="#C7C6E8" />
            <Text style={styles.emptyText}>{message}</Text>
            <TouchableOpacity onPress={onPress} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>{button}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F9F9FF" },
    header: {
        paddingVertical: 50,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitle: { fontSize: 26, color: "#fff", fontWeight: "800" },
    headerSubtitle: { fontSize: 14, color: "#EEE", marginTop: 4 },

    statsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: -25,
    },
    statCard: {
        backgroundColor: "#fff",
        width: screenWidth / 4.2,
        height: 85,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        borderBottomWidth: 3,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: { fontWeight: "700", fontSize: 15, marginTop: 4 },
    statLabel: { fontSize: 12, color: "#666" },

    section: { marginTop: 30, paddingHorizontal: 20 },
    sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
    sectionSubtitle: { color: "#777", fontSize: 13, marginTop: 4 },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#6C63FF",
        marginTop: 12,
        alignSelf: "flex-start",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addText: { color: "#fff", fontWeight: "700", marginLeft: 6 },

    goalsScrollView: {
        marginTop: 12,
    },
    
    // Enhanced Goal Card Styles
    enhancedGoalCard: {
        backgroundColor: "#fff",
        width: 280,
        borderRadius: 20,
        padding: 16,
        marginRight: 16,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    goalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    categoryBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    goalStatus: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    enhancedGoalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginBottom: 8,
        lineHeight: 22,
    },
    goalDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 16,
    },
    progressSection: {
        marginBottom: 12,
    },
    progressInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    progressLabel: {
        fontSize: 12,
        color: "#666",
        fontWeight: "500",
    },
    progressPercent: {
        fontSize: 14,
        fontWeight: "700",
        color: "#333",
    },
    progressBarContainer: {
        height: 8,
    },
    progressBarBackground: {
        height: "100%",
        backgroundColor: "#E5E7EB",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        borderRadius: 4,
    },
    milestonesSection: {
        marginBottom: 12,
    },
    milestonesInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    milestonesText: {
        fontSize: 12,
        color: "#10B981",
        marginLeft: 6,
        fontWeight: "500",
    },
    dateSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    dateText: {
        fontSize: 12,
        color: "#666",
        marginLeft: 6,
    },
    goalActions: {
        alignItems: "flex-end",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    actionButtonText: {
        color: "white",
        fontSize: 12,
        fontWeight: "600",
        marginLeft: 4,
    },

    reflectionCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginVertical: 6,
        elevation: 2,
    },
    reflectionText: { color: "#555", fontSize: 14, lineHeight: 20 },

    emptyState: { alignItems: "center", marginTop: 20 },
    emptyText: { color: "#666", fontSize: 14, marginTop: 10, textAlign: "center" },
    emptyButton: {
        backgroundColor: "#6C63FF",
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginTop: 10,
    },
    emptyButtonText: { color: "#fff", fontWeight: "700" },

    footer: { alignItems: "center", marginTop: 30, marginBottom: 50 },
    ctaButton: {
        backgroundColor: "#9C27B0",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 30,
        elevation: 4,
    },
    ctaText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
});
