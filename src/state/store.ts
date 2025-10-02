import { create } from 'zustand';

// Types for our family dashboard
export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
}

export interface Penalty {
    id: string;
    userId: string;
    reason: string;
    duration: number; // in minutes
    startTime: Date;
    active: boolean;
}

export interface Activity {
    id: string;
    title: string;
    description: string;
    date: Date;
    participants: string[];
    completed: boolean;
}

// Goal interface moved to src/modules/goals/types/goalTypes.ts

export interface SafeRoomMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
    isRead: boolean;
}

// Store interface
interface FamilyDashStore {
    // User state
    user: User | null;
    setUser: (user: User | null) => void;

    // Tasks state
    tasks: Task[];
    addTask: (task: Omit<Task, 'id'>) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    deleteTask: (id: string) => void;

    // Penalties state
    penalties: Penalty[];
    addPenalty: (penalty: Omit<Penalty, 'id'>) => void;
    updatePenalty: (id: string, updates: Partial<Penalty>) => void;

    // Activities state
    activities: Activity[];
    addActivity: (activity: Omit<Activity, 'id'>) => void;
    updateActivity: (id: string, updates: Partial<Activity>) => void;

    // Goals state moved to src/modules/goals/store/goalsStore.ts

    // Safe Room state
    safeRoomMessages: SafeRoomMessage[];
    addSafeRoomMessage: (message: Omit<SafeRoomMessage, 'id'>) => void;
    markMessageAsRead: (id: string) => void;

    // UI state
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

// Generate mock data
const generateMockData = () => {
    const mockTasks: Task[] = [
        {
            id: '1',
            title: 'Limpiar la cocina',
            description: 'Lavar platos y limpiar superficies',
            assignedTo: 'demo-user-123',
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            completed: false,
            priority: 'medium'
        },
        {
            id: '2',
            title: 'Sacar la basura',
            description: 'Llevar bolsas de basura al contenedor',
            assignedTo: 'demo-user-123',
            dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
            completed: true,
            priority: 'high'
        }
    ];

    const mockPenalties: Penalty[] = [
        {
            id: '1',
            userId: 'demo-user-123',
            reason: 'No completó tarea asignada',
            duration: 30,
            startTime: new Date(Date.now() - 10 * 60 * 1000),
            active: true
        }
    ];

    const mockActivities: Activity[] = [
        {
            id: '1',
            title: 'Noche de películas',
            description: 'Ver película familiar en el salón',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            participants: ['demo-user-123'],
            completed: false
        }
    ];

    // Goals mock data moved to src/modules/goals/mock/goalsData.ts

    const mockSafeRoomMessages: SafeRoomMessage[] = [
        {
            id: '1',
            content: '¡Te amo mucho! ❤️',
            sender: 'demo-user-123',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            isRead: false
        }
    ];

    return {
        tasks: mockTasks,
        penalties: mockPenalties,
        activities: mockActivities,
        safeRoomMessages: mockSafeRoomMessages
    };
};

// Create the store
export const useFamilyDashStore = create<FamilyDashStore>((set, get) => {
    const mockData = generateMockData();

    return {
        // User state
        user: null,
        setUser: (user) => set({ user }),

        // Tasks state
        tasks: mockData.tasks,
        addTask: (task) => set((state) => ({
            tasks: [...state.tasks, { ...task, id: Date.now().toString() }]
        })),
        updateTask: (id, updates) => set((state) => ({
            tasks: state.tasks.map(task =>
                task.id === id ? { ...task, ...updates } : task
            )
        })),
        deleteTask: (id) => set((state) => ({
            tasks: state.tasks.filter(task => task.id !== id)
        })),

        // Penalties state
        penalties: mockData.penalties,
        addPenalty: (penalty) => set((state) => ({
            penalties: [...state.penalties, { ...penalty, id: Date.now().toString() }]
        })),
        updatePenalty: (id, updates) => set((state) => ({
            penalties: state.penalties.map(penalty =>
                penalty.id === id ? { ...penalty, ...updates } : penalty
            )
        })),

        // Activities state
        activities: mockData.activities,
        addActivity: (activity) => set((state) => ({
            activities: [...state.activities, { ...activity, id: Date.now().toString() }]
        })),
        updateActivity: (id, updates) => set((state) => ({
            activities: state.activities.map(activity =>
                activity.id === id ? { ...activity, ...updates } : activity
            )
        })),

        // Goals state moved to src/modules/goals/store/goalsStore.ts

        // Safe Room state
        safeRoomMessages: mockData.safeRoomMessages,
        addSafeRoomMessage: (message) => set((state) => ({
            safeRoomMessages: [...state.safeRoomMessages, { ...message, id: Date.now().toString() }]
        })),
        markMessageAsRead: (id) => set((state) => ({
            safeRoomMessages: state.safeRoomMessages.map(message =>
                message.id === id ? { ...message, isRead: true } : message
            )
        })),

        // UI state
        isLoading: false,
        setLoading: (loading) => set({ isLoading: loading })
    };
});
