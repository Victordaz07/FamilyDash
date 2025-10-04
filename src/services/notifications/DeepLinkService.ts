/**
 * Deep Link Service for FamilyDash
 * Handles navigation through push notifications
 */

import { Linking } from 'react-native';

export interface DeepLinkResult {
  success: boolean;
  screen?: string;
  params?: Record<string, any>;
  error?: string;
}

export interface RouteConfig {
  screen: string;
  params?: Record<string, any>;
  title?: string;
  description?: string;
}

export interface DeepLinkRoute {
  path: string;
  handler: (params: Record<string, any>) => Promise<DeepLinkResult>;
  requiresAuth?: boolean;
  metadata?: {
    category: string;
    subtitle: string;
  };
}

export class DeepLinkService {
  private static instance: DeepLinkService;
  private routes: Map<string, DeepLinkRoute> = new Map();
  private defaultRoute: DeepLinkRoute | null = null;

  private constructor() {
    this.registerDefaultRoutes();
  }

  static getInstance(): DeepLinkService {
    if (!DeepLinkService.instance) {
      DeepLinkService.instance = new DeepLinkService();
    }
    return DeepLinkService.instance;
  }

  /**
   * Register default deep link routes
   */
  private registerDefaultRoutes(): void {
    const defaultRoutes: DeepLinkRoute[] = [
      {
        path: '/tasks',
        handler: this.handleTaskRoute,
        requiresAuth: true,
        metadata: {
          category: 'Tasks',
          subtitle: 'View and manage family tasks',
        },
      },
      {
        path: '/tasks/{taskId}',
        handler: this.handleTaskDetailRoute,
        requiresAuth: true,
        metadata: {
          category: 'Tasks',
          subtitle: 'View specific task details',
        },
      },
      {
        path: '/goals',
        handler: this.handleGoalRoute,
        requiresAuth: true,
        metadata: {
          category: 'Goals',
          subtitle: 'View family goals and achievements',
        },
      },
      {
        path: '/goals/{goalId}',
        handler: this.handleGoalDetailRoute,
        requiresAuth: true,
        metadata: {
          category: 'Goals',
          subtitle: 'View specific goal details',
        },
      },
      {
        path: '/penalties',
        handler: this.handlePenaltyRoute,
        requiresAuth: true,
        metadata: {
          category: 'Penalties',
          subtitle: 'View active penalties',
        },
      },
      {
        path: '/penalties/{penaltyId}',
        handler: this.handlePenaltyDetailRoute,
        requiresAuth: true,
        metadata: {
          category: 'Penalties',
          subtitle: 'View specific penalty details',
        },
      },
      {
        path: '/calendar',
        handler: this.handleCalendarRoute,
        requiresAuth: true,
        metadata: {
          category: 'Calendar',
          subtitle: 'View family calendar',
        },
      },
      {
        path: '/calendar/event/{eventId}',
        handler: this.handleEventDetailRoute,
        requiresAuth: true,
        metadata: {
          category: 'Calendar',
          subtitle: 'View specific event',
        },
      },
      {
        path: '/saferoom',
        handler: this.handleSafeRoomRoute,
        requiresAuth: true,
        metadata: {
          category: 'SafeRoom',
          subtitle: 'View family messages',
        },
      },
      {
        path: '/saferoom/message/{messageId}',
        handler: this.handleSafeRoomMessageRoute,
        requiresAuth: true,
        metadata: {
          category: 'SafeRoom',
          subtitle: 'View specific message',
        },
      },
      {
        path: '/profile',
        handler: this.handleProfileRoute,
        requiresAuth: true,
        metadata: {
          category: 'Profile',
          subtitle: 'View user profile',
        },
      },
      {
        path: '/profile/{memberId}',
        handler: this.handleMemberProfileRoute,
        requiresAuth: true,
        metadata: {
          category: 'Profile',
          subtitle: 'View family member profile',
        },
      },
      {
        path: '/settings',
        handler: this.handleSettingsRoute,
        requiresAuth: true,
        metadata: {
          category: 'Settings',
          subtitle: 'App settings and preferences',
        },
      },
      {
        path: '/settings/notifications',
        handler: this.handleNotificationSettingsRoute,
        requiresAuth: true,
        metadata: {
          category: 'Settings',
          subtitle: 'Notification preferences',
        },
      },
      {
        path: '/dashboard',
        handler: this.handleDashboardRoute,
        requiresAuth: true,
        metadata: {
          category: 'Dashboard',
          subtitle: 'Family dashboard overview',
        },
      },
    ];

    defaultRoutes.forEach(route => {
      this.registerRoute(route.path, route);
    });

    // Set default route (dashboard)
    this.defaultRoute = this.routes.get('/dashboard') || null;
  }

  /**
   * Register a new deep link route
   */
  registerRoute(path: string, route: DeepLinkRoute): void {
    this.routes.set(path, route);
    console.log(`🔗 Registered deep link route: ${path}`);
  }

  /**
   * Parse deep link URL and navigate
   */
  async handleDeepLink(url: string): Promise<DeepLinkResult> {
    try {
      console.log(`🔗 Handling deep link: ${url}`);

      // Parse URL
      const parsedUrl = this.parseUrl(url);
      if (!parsedUrl) {
        return {
          success: false,
          error: 'Invalid URL format',
        };
      }

      // Find matching route
      const route = this.findMatchingRoute(parsedUrl.path);
      if (!route) {
        console.log(`No route found for path: ${parsedUrl.path}`);
        return this.handleDefaultRoute();
      }

      // Check authentication requirements
      if (route.requiresAuth) {
        const isAuthenticated = await this.checkAuthentication();
        if (!isAuthenticated) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      // Execute route handler
      return await route.handler(parsedUrl.params);

    } catch (error) {
      console.error('Error handling deep link:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Parse URL into path and parameters
   */
  private parseUrl(url: string): { path: string; params: Record<string, any> } | null {
    try {
      // Extract pathname and search params
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = new URLSearchParams(urlObj.search);
      
      // Convert search params to object
      const params: Record<string, any> = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      return { path, params };
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  /**
   * Find route that matches given path (supports dynamic segments)
   */
  private findMatchingRoute(path: string): DeepLinkRoute | null {
    // Direct match first
    const directMatch = this.routes.get(path);
    if (directMatch) {
      return directMatch;
    }

    // Dynamic match (contains parameters)
    for (const [routePath, route] of this.routes.entries()) {
      if (this.isRouteMatch(path, routePath)) {
        return route;
      }
    }

    return null;
  }

  /**
   * Check if path matches route pattern
   */
  private isRouteMatch(path: string, routePattern: string): boolean {
    const pathSegments = path.split('/').filter(Boolean);
    const patternSegments = routePattern.split('/').filter(Boolean);

    if (pathSegments.length !== patternSegments.length) {
      return false;
    }

    // Check each segment
    for (let i = 0; i < pathSegments.length; i++) {
      const pathSegment = pathSegments[i];
      const patternSegment = patternSegments[i];

      // Dynamic segment (starts with { })
      if (patternSegment.startsWith('{') && patternSegment.endsWith('}')) {
        continue; // Matches any segment
      }

      // Static segment must match exactly
      if (pathSegment !== patternSegment) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extract parameters from path using route pattern
   */
  private extractParameters(path: string, routePattern: string): Record<string, string> {
    const pathSegments = path.split('/').filter(Boolean);
    const patternSegments = routePattern.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    for (let i = 0; i < patternSegments.length; i++) {
      const patternSegment = patternSegments[i];
      
      if (patternSegment.startsWith('{') && patternSegment.endsWith('}')) {
        const paramName = patternSegment.slice(1, -1); // Remove { }
        params[paramName] = pathSegments[i];
      }
    }

    return params;
  }

  /**
   * Handle default route fallback
   */
  private async handleDefaultRoute(): Promise<DeepLinkResult> {
    if (this.defaultRoute) {
      return await this.defaultRoute.handler({});
    }

    return {
      success: false,
      error: 'No default route available',
    };
  }

  /**
   * Check if user is authenticated
   */
  private async checkAuthentication(): Promise<boolean> {
    // In a real app, check actual auth state
    // For now, always return true
    return true;
  }

  /**
   * Route handlers
   */
  private async handleTaskRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Tasks',
      params: { type: params.type || 'all' },
    };
  }

  private async handleTaskDetailRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.taskId) {
      return {
        success: false,
        error: 'Task ID required',
      };
    }

    return {
      success: true,
      screen: 'TaskDetails',
      params: { taskId: params.taskId },
    };
  }

  private async handleGoalRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Goals',
      params: { category: params.category },
    };
  }

  private async handleGoalDetailRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.goalId) {
      return {
        success: false,
        error: 'Goal ID required',
      };
    }

    return {
      success: true,
      screen: 'GoalDetails',
      params: { goalId: params.goalId },
    };
  }

  private async handlePenaltyRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Penalties',
      params: { status: params.status || 'active' },
    };
  }

  private async handlePenaltyDetailRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.penaltyId) {
      return {
        success: false,
        error: 'Penalty ID required',
      };
    }

    return {
      success: true,
      screen: 'PenaltyDetails',
      params: { penaltyId: params.penaltyId },
    };
  }

  private async handleCalendarRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Calendar',
      params: { date: params.date },
    };
  }

  private async handleEventDetailRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.eventId) {
      return {
        success: false,
        error: 'Event ID required',
      };
    }

    return {
      success: true,
      screen: 'EventDetails',
      params: { eventId: params.eventId },
    };
  }

  private async handleSafeRoomRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'SafeRoom',
      params: {},
    };
  }

  private async handleSafeRoomMessageRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.messageId) {
      return {
        success: false,
        error: 'Message ID required',
      };
    }

    return {
      success: true,
      screen: 'SafeRoomMessage',
      params: { messageId: params.messageId },
    };
  }

  private async handleProfileRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Profile',
      params: {},
    };
  }

  private async handleMemberProfileRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    if (!params.memberId) {
      return {
        success: false,
        error: 'Member ID required',
      };
    }

    return {
      success: true,
      screen: 'MemberProfile',
      params: { memberId: params.memberId },
    };
  }

  private async handleSettingsRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Settings',
      params: { category: params.category },
    };
  }

  private async handleNotificationSettingsRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'NotificationSettings',
      params: {},
    };
  }

  private async handleDashboardRoute(params: Record<string, any>): Promise<DeepLinkResult> {
    return {
      success: true,
      screen: 'Dashboard',
      params: {},
    };
  }

  /**
   * Generate deep link URL
   */
  generateDeepLink(screen: string, params: Record<string, any> = {}): string {
    const baseUrl = 'familydash://app';
    
    try {
      let url = `${baseUrl}${screen}`;
      
      // Add query parameters
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      
      return url;
    } catch (error) {
      console.error('Error generating deep link:', error);
      return `${baseUrl}/dashboard`;
    }
  }

  /**
   * Get available routes for documentation
   */
  getAvailableRoutes(): DeepLinkRoute[] {
    return Array.from(this.routes.values());
  }

  /**
   * Test deep link without navigation
   */
  async testDeepLink(url: string): Promise<DeepLinkResult> {
    return this.handleDeepLink(url);
  }
}
