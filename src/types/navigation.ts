import { NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Root Stack Param List
export type RootStackParamList = {
  // Main Tabs
  Dashboard: undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Calendar: NavigatorScreenParams<CalendarStackParamList>;
  Goals: NavigatorScreenParams<GoalsStackParamList>;
  Penalties: NavigatorScreenParams<PenaltiesStackParamList>;
  SafeRoom: NavigatorScreenParams<SafeRoomStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Tasks Stack
export type TasksStackParamList = {
  TasksMain: undefined;
  TaskDetails: { taskId: string };
};

// Calendar Stack
export type CalendarStackParamList = {
  CalendarMain: undefined;
  ExpandedCalendar: undefined;
  ActivityDetail: { activityId: string };
  CalendarVoting: undefined;
  Voting: undefined;
  EventEditor: { eventId?: string };
};

// Goals Stack
export type GoalsStackParamList = {
  GoalsMain: undefined;
  GoalDetails: { goalId: string };
};

// Penalties Stack
export type PenaltiesStackParamList = {
  PenaltiesMain: undefined;
  PenaltyDetails: { penaltyId: string };
  PenaltyHistory: undefined;
};

// Safe Room Stack
export type SafeRoomStackParamList = {
  SafeRoomMain: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
};

// Navigation Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>;
  route: {
    params: RootStackParamList[T];
  };
};

export type TasksStackScreenProps<T extends keyof TasksStackParamList> = {
  navigation: StackNavigationProp<TasksStackParamList, T>;
  route: {
    params: TasksStackParamList[T];
  };
};

export type CalendarStackScreenProps<T extends keyof CalendarStackParamList> = {
  navigation: StackNavigationProp<CalendarStackParamList, T>;
  route: {
    params: CalendarStackParamList[T];
  };
};

export type GoalsStackScreenProps<T extends keyof GoalsStackParamList> = {
  navigation: StackNavigationProp<GoalsStackParamList, T>;
  route: {
    params: GoalsStackParamList[T];
  };
};

export type PenaltiesStackScreenProps<T extends keyof PenaltiesStackParamList> = {
  navigation: StackNavigationProp<PenaltiesStackParamList, T>;
  route: {
    params: PenaltiesStackParamList[T];
  };
};

export type SafeRoomStackScreenProps<T extends keyof SafeRoomStackParamList> = {
  navigation: StackNavigationProp<SafeRoomStackParamList, T>;
  route: {
    params: SafeRoomStackParamList[T];
  };
};

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = {
  navigation: StackNavigationProp<ProfileStackParamList, T>;
  route: {
    params: ProfileStackParamList[T];
  };
};




