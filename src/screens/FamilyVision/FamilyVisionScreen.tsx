/**
 * 🌈 FAMILY VISION SCREEN — FamilyDash+
 * Elegant, motivational dashboard for shared family goals & reflections.
 * Visual inspiration meets progress tracking 💜
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
                <Text style={styles.headerTitle}>Family Vision</Text>
                <Text style={styles.headerSubtitle}>
                    Build your dreams, together ✨
                </Text>
            </LinearGradient>

            {/* DASHBOARD */}
            <View style={styles.statsRow}>
                <VisionStat icon="trophy" label="Goals" value={visions.length} color="#FFD54F" />
                <VisionStat icon="heart" label="Reflections" value={reflections.length} color="#F48FB1" />
                <VisionStat icon="sparkles" label="In Progress" value={visions.filter(v => v.progress > 0 && v.progress < 100).length} color="#81C784" />
            </View>

            {/* VISION BOARD */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="images-outline" size={20} color="#6C63FF" />
                    <Text style={styles.sectionTitle}>Vision Board</Text>
                </View>
                <Text style={styles.sectionSubtitle}>
                    Collect inspiring moments or images for your family's future.
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate("AddGoal")}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <Text style={styles.addText}>Add Inspiration</Text>
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
                        message="No goals yet — start your first family challenge!"
                        button="Create Goal"
                        onPress={() => navigation.navigate("AddGoal")}
                    />
                ) : (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.goalsScrollView}
                    >
                        {visions.map((vision) => (
                            <GoalCard key={vision.id} title={vision.title} progress={vision.progress} />
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
                    <Text style={styles.ctaText}>Start a New Family Vision</Text>
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

function GoalCard({ title, progress }: any) {
    return (
        <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>{title}</Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.goalProgress}>{progress}%</Text>
        </View>
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

    goalCard: {
        backgroundColor: "#fff",
        width: 150,
        height: 100,
        borderRadius: 18,
        padding: 12,
        marginRight: 12,
        justifyContent: "space-between",
        elevation: 2,
    },
    goalsScrollView: {
        marginTop: 12,
    },
    goalTitle: { fontWeight: "700", fontSize: 14, color: "#333" },
    progressBar: {
        height: 6,
        backgroundColor: "#EEE",
        borderRadius: 4,
        overflow: "hidden",
        marginVertical: 6,
    },
    progressFill: { height: "100%", backgroundColor: "#6C63FF", borderRadius: 4 },
    goalProgress: { fontSize: 12, color: "#666", alignSelf: "flex-end" },

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
