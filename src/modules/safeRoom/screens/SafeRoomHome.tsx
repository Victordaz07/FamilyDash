import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeRoom } from '../hooks/useSafeRoom';

const { width: screenWidth } = Dimensions.get('window');

interface SafeRoomHomeProps {
    navigation: any;
}

const SafeRoomHome: React.FC<SafeRoomHomeProps> = ({ navigation }) => {
    const { getStatistics } = useSafeRoom();
    const stats = getStatistics();

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const cardsAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Entrance animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Cards animation with delay
        Animated.timing(cardsAnim, {
            toValue: 1,
            duration: 1200,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Pulse animation for heart icon
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        return () => {
            pulseAnimation.stop();
        };
    }, []);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleNavigateToTab = (tab: 'express' | 'reflections' | 'guided' | 'board') => {
        navigation.navigate('SafeRoomTabs', { initialTab: tab });
    };

    const handleHeartButton = () => {
        // Quick access to Express Feelings
        navigation.navigate('SafeRoomTabs', { initialTab: 'express' });
    };

    const mainCards = [
        {
            id: 'express',
            title: 'Express Feelings',
            subtitle: 'Share what\'s on your heart',
            icon: 'heart-outline',
            color: '#FF6B9D',
            gradient: ['#FF6B9D', '#FF8E9B']
        },
        {
            id: 'reflections',
            title: 'Family Reflections',
            subtitle: 'See what others are sharing',
            icon: 'people-outline',
            color: '#4ECDC4',
            gradient: ['#4ECDC4', '#44A08D']
        },
        {
            id: 'guided',
            title: 'Guided Help',
            subtitle: 'Learn and grow together',
            icon: 'book-outline',
            color: '#A8E6CF',
            gradient: ['#A8E6CF', '#7FCDCD']
        },
        {
            id: 'board',
            title: 'Solutions Board',
            subtitle: 'Family agreements & commitments',
            icon: 'bulb-outline',
            color: '#FFD93D',
            gradient: ['#FFD93D', '#FF8A80']
        }
    ];

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={['#FF6B9D', '#FF8E9B']}
                    style={styles.header}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerTitle}>Safe Room</Text>
                            <Text style={styles.headerSubtitle}>A space to share feelings without judgment</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <TouchableOpacity style={styles.headerButton} onPress={handleHeartButton}>
                                    <Ionicons name="heart" size={20} color="white" />
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </View>
                </LinearGradient>

                {/* Safe Space Rules */}
                <View style={styles.rulesSection}>
                    <View style={styles.rulesCard}>
                        <View style={styles.rulesHeader}>
                            <View style={styles.shieldIcon}>
                                <Ionicons name="heart" size={20} color="white" />
                            </View>
                            <View style={styles.rulesText}>
                                <Text style={styles.rulesTitle}>Safe Space Rules</Text>
                                <Text style={styles.rulesSubtitle}>No judgment, only love</Text>
                            </View>
                        </View>

                        <View style={styles.rulesList}>
                            <View style={styles.ruleItem}>
                                <Ionicons name="heart" size={16} color="#FF6B9D" />
                                <Text style={styles.ruleText}>Support each other with kindness</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Ionicons name="ear" size={16} color="#4ECDC4" />
                                <Text style={styles.ruleText}>Listen with your heart</Text>
                            </View>
                            <View style={styles.ruleItem}>
                                <Ionicons name="hand-left" size={16} color="#A8E6CF" />
                                <Text style={styles.ruleText}>Care for one another</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Main Cards */}
                <Animated.View style={[styles.cardsSection, { opacity: cardsAnim }]}>
                    <Text style={styles.sectionTitle}>What would you like to do?</Text>

                    <View style={styles.cardsGrid}>
                        {mainCards.map((card, index) => (
                            <Animated.View
                                key={card.id}
                                style={[
                                    styles.cardContainer,
                                    {
                                        transform: [{
                                            translateY: cardsAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [index * 20, 0],
                                            })
                                        }]
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.cardButton}
                                    onPress={() => handleNavigateToTab(card.id as any)}
                                >
                                    <LinearGradient
                                        colors={card.gradient as [string, string]}
                                        style={styles.card}
                                    >
                                        <View style={styles.cardIcon}>
                                            <Ionicons name={card.icon as any} size={32} color="white" />
                                        </View>
                                        <Text style={styles.cardTitle}>{card.title}</Text>
                                        <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                                        <View style={styles.cardStats}>
                                            <Text style={styles.cardStatsText}>
                                                {card.id === 'express' && `${stats.totalFeelings} shared`}
                                                {card.id === 'reflections' && `${stats.totalSupport} hearts`}
                                                {card.id === 'guided' && `${stats.activeAgreements} resources`}
                                                {card.id === 'board' && `${stats.completedAgreements} solutions`}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Statistics */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>This Week's Support</Text>

                    <LinearGradient
                        colors={['#FF6B9D', '#FF8E9B']}
                        style={styles.statsCard}
                    >
                        <View style={styles.statsHeader}>
                            <Text style={styles.statsTitle}>Family Connection</Text>
                            <Ionicons name="trending-up" size={20} color="white" />
                        </View>

                        <View style={styles.statsGrid}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalFeelings}</Text>
                                <Text style={styles.statLabel}>Messages Shared</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalSupport}</Text>
                                <Text style={styles.statLabel}>Hearts Given</Text>
                            </View>
                        </View>

                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>Family Connection</Text>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: '85%' }]} />
                            </View>
                            <Text style={styles.progressText}>Excellent</Text>
                        </View>
                    </LinearGradient>
                </View>

                {/* Recent Activity */}
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    <View style={styles.activityCard}>
                        <View style={styles.activityItem}>
                            <Text style={styles.activityEmoji}>👩</Text>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Mom shared a feeling</Text>
                                <Text style={styles.activityTime}>2 hours ago</Text>
                            </View>
                        </View>

                        <View style={styles.activityItem}>
                            <Text style={styles.activityEmoji}>👦</Text>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Jake completed an agreement</Text>
                                <Text style={styles.activityTime}>1 day ago</Text>
                            </View>
                        </View>

                        <View style={styles.activityItem}>
                            <Text style={styles.activityEmoji}>👧</Text>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityText}>Emma watched a guided resource</Text>
                                <Text style={styles.activityTime}>2 days ago</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bottom spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 32,
        paddingHorizontal: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerButton: {
        width: 40,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rulesSection: {
        paddingHorizontal: 20,
        marginTop: -20,
    },
    rulesCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    rulesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    shieldIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B9D',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rulesText: {
        flex: 1,
    },
    rulesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    rulesSubtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    rulesList: {
        gap: 12,
    },
    ruleItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ruleText: {
        fontSize: 14,
        color: '#374151',
        marginLeft: 12,
    },
    cardsSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    cardsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%',
        marginBottom: 16,
    },
    card: {
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        minHeight: 140,
        justifyContent: 'center',
    },
    cardIcon: {
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    statsSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    statsCard: {
        borderRadius: 16,
        padding: 20,
    },
    statsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    progressSection: {
        marginTop: 8,
    },
    progressLabel: {
        fontSize: 14,
        color: 'white',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    activitySection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    activityCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    activityEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    bottomSpacing: {
        height: 80,
    },
    cardButton: {
        flex: 1,
    },
    cardStats: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardStatsText: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
});

export default SafeRoomHome;
