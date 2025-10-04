import { create } from 'zustand';

// Legacy types - these are now handled by specific module stores
// Keeping for backward compatibility during transition

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

// Legacy interfaces - moved to specific modules:
// - Task → src/modules/tasks/types/taskTypes.ts
// - Penalty → src/modules/penalties/types/penaltyTypes.ts  
// - Activity → src/modules/calendar/types/calendarTypes.ts
// - Goal → src/modules/goals/types/goalTypes.ts
// - FamilyMember → src/store/familyStore.ts

export interface SafeRoomMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
    isRead: boolean;
}

// Simplified main store - most functionality moved to module-specific stores
interface FamilyDashStore {
    // User state
    user: User | null;
    setUser: (user: User | null) => void;

    // Safe Room state (keeping here as it's cross-module)
    safeRoomMessages: SafeRoomMessage[];
    addSafeRoomMessage: (message: Omit<SafeRoomMessage, 'id'>) => void;
    markMessageAsRead: (id: string) => void;

    // UI state
    isLoading: boolean;
    setLoading: (loading: boolean) => void;

    // App state
    isInitialized: boolean;
    initializeApp: () => void;
}

// Generate mock data for Safe Room messages
const generateMockData = () => {
    const mockSafeRoomMessages: SafeRoomMessage[] = [
        {
            id: '1',
            content: '¡Te amo mucho! ❤️',
            sender: 'demo-user-123',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false
        },
        {
            id: '2',
            content: 'Gracias por ser tan paciente conmigo',
            sender: 'demo-user-456',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isRead: true
        }
    ];

    return {
        safeRoomMessages: mockSafeRoomMessages
    };
};

// Create the simplified store
export const useFamilyDashStore = create<FamilyDashStore>((set, get) => {
    const mockData = generateMockData();

    return {
        // User state
        user: null,
        setUser: (user) => set({ user }),

        // Safe Room state
        safeRoomMessages: mockData.safeRoomMessages,
        addSafeRoomMessage: (message) => set((state) => ({
            safeRoomMessages: [...state.safeRoomMessages, { 
                ...message, 
                id: Date.now().toString(),
                timestamp: new Date(),
                isRead: false
            }]
        })),
        markMessageAsRead: (id) => set((state) => ({
            safeRoomMessages: state.safeRoomMessages.map(message =>
                message.id === id ? { ...message, isRead: true } : message
            )
        })),

        // UI state
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading }),

        // App state
        isInitialized: false,
        initializeApp: () => {
            const { isInitialized } = get();
            if (!isInitialized) {
                // Initialize all module stores
                import('../modules/tasks/store/tasksStore').then(({ useTasksStore }) => {
                    useTasksStore.getState().initializeTasks();
                });
                import('../modules/goals/store/goalsStore').then(({ useGoalsStore }) => {
                    useGoalsStore.getState().initializeGoals();
                });
                import('../modules/penalties/store/penaltiesStore').then(({ usePenaltiesStore }) => {
                    usePenaltiesStore.getState().initializePenalties();
                });
                import('../store/familyStore').then(({ useFamilyStore }) => {
                    useFamilyStore.getState().initializeWithMockData();
                });
                
                set({ isInitialized: true });
            }
        }
    };
});