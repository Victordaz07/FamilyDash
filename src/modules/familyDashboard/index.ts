/**
 * Family Dashboard Module Index
 * Central export for advanced family management functionality
 */

// Core services
export { FamilyDashboardService } from './FamilyDashboardService';

// Components
export { FamilyDashboard } from './components/FamilyDashboard';
export { FamilyChallenges } from './components/FamilyChallenges';

// Types
export type {
    FamilyMemberActivity,
    FamilyGoal,
    FamilyMilestone,
    FamilyReward,
    FamilyChallenge,
    FamilySchedule,
    FamilyDashboardData,
} from './FamilyDashboardService';

export type {
    FamilyDashboardProps,
} from './components/FamilyDashboard';

export type {
    FamilyChallengesProps,
} from './components/FamilyChallenges';
