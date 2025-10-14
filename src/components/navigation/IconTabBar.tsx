import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface TabItem {
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradientColors?: string[];
}

interface IconTabBarProps {
    tabs: TabItem[];
    activeTab: string;
    onTabPress: (tabKey: string) => void;
    showGradient?: boolean;
}

export const IconTabBar: React.FC<IconTabBarProps> = ({
    tabs,
    activeTab,
    onTabPress,
    showGradient = true
}) => {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const gradientColors = tab.gradientColors || ['#667eea', '#764ba2'] as const;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        onPress={() => onTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        {isActive && showGradient ? (
                            <LinearGradient
                                colors={gradientColors}
                                style={styles.activeTabBackground}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Ionicons
                                    name={tab.icon}
                                    size={20}
                                    color="white"
                                    style={styles.tabIcon}
                                />
                                <Text style={styles.activeTabText}>{tab.label}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={styles.inactiveTab}>
                                <Ionicons
                                    name={tab.icon}
                                    size={20}
                                    color={isActive ? gradientColors[0] : '#999'}
                                    style={styles.tabIcon}
                                />
                                <Text style={[
                                    styles.inactiveTabText,
                                    { color: isActive ? gradientColors[0] : '#999' }
                                ]}>
                                    {tab.label}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 12,
        marginHorizontal: 2,
    },
    activeTabBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    inactiveTab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    tabIcon: {
        marginRight: 4,
    },
    activeTabText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    inactiveTabText: {
        fontSize: 12,
        fontWeight: '500',
    },
});

export default IconTabBar;




