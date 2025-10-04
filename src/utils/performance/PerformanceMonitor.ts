/**
 * Performance Monitoring Utilities for FamilyDash
 * Provides comprehensive performance tracking and optimization insights
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    component?: string;
    context?: Record<string, any>;
}

interface PerformanceReport {
    sessionId: string;
    startTime: number;
    endTime: number;
    metrics: PerformanceMetric[];
    summary: {
        slowestComponent: string;
        averageRenderTime: number;
        memoryPeak: number;
        errors: number;
    };
}

export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: PerformanceMetric[] = [];
    private sessionId: string;
    private startTime: number;
    private observers: Array<(metric: PerformanceMetric) => void> = [];

    private constructor() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.startTime = Date.now();
        this.initializeMonitoring();
    }

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    private initializeMonitoring() {
        // Monitor memory usage
        this.startMemoryMonitoring();

        // Monitor frame rate
        this.startFrameRateMonitoring();

        // Monitor screen transitions
        this.startNavigationMonitoring();
    }

    /**
     * Track component render time
     */
    trackRenderTime(
        componentName: string,
        renderTime: number,
        context?: Record<string, any>
    ) {
        const metric: PerformanceMetric = {
            name: 'render_time',
            value: renderTime,
            unit: 'ms',
            timestamp: Date.now(),
            component: componentName,
            context: { ...context, sessionId: this.sessionId },
        };

        this.addMetric(metric);

        // Warn about slow renders
        if (renderTime > 16) {
            console.warn(`Slow render detected in ${componentName}: ${renderTime}ms`);
        }
    }

    /**
     * Track network requests
     */
    trackNetworkRequest(
        url: string,
        method: string,
        duration: number,
        status: number,
        size?: number
    ) {
        const metric: PerformanceMetric = {
            name: 'network_request',
            value: duration,
            unit: 'ms',
            timestamp: Date.now(),
            context: {
                url,
                method,
                status,
                size,
                sessionId: this.sessionId,
            },
        };

        this.addMetric(metric);

        // Warn about slow requests
        if (duration > 3000) {
            console.warn(`Slow network request: ${method} ${url} took ${duration}ms`);
        }
    }

    /**
     * Track async operations
     */
    trackAsyncOperation(
        operationName: string,
        duration: number,
        success: boolean,
        context?: Record<string, any>
    ) {
        const metric: PerformanceMetric = {
            name: 'async_operation',
            value: duration,
            unit: 'ms',
            timestamp: Date.now(),
            context: {
                operationName,
                success,
                ...context,
                sessionId: this.sessionId,
            },
        };

        this.addMetric(metric);

        // Warn about failed operations
        if (!success && duration > 1000) {
            console.warn(`Failed async operation: ${operationName} failed after ${duration}ms`);
        }
    }

    /**
     * Track battery usage
     */
    trackBatteryUsage(batteryLevel: number) {
        const metric: PerformanceMetric = {
            name: 'battery_usage',
            value: batteryLevel,
            unit: 'percentage',
            timestamp: Date.now(),
            context: { sessionId: this.sessionId },
        };

        this.addMetric(metric);
    }

    /**
     * Track storage usage
     */
    trackStorageUsage(usedBytes: number, totalBytes?: number) {
        const metric: PerformanceMetric = {
            name: 'storage_usage',
            value: usedBytes,
            unit: 'bytes',
            timestamp: Date.now(),
            context: {
                totalBytes,
                usagePercentage: totalBytes ? (usedBytes / totalBytes) * 100 : undefined,
                sessionId: this.sessionId,
            },
        };

        this.addMetric(metric);
    }

    private addMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);

        // Notify observers
        this.observers.forEach(observer => {
            try {
                observer(metric);
            } catch (error) {
                console.error('Error in performance observer:', error);
            }
        });

        // Keep only last 1000 metrics to manage memory
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
    }

    private startMemoryMonitoring() {
        const memoryCheckInterval = setInterval(() => {
            try {
                // Get memory info if available
                if ((performance as any).memory) {
                    const memory = (performance as any).memory;

                    this.addMetric({
                        name: 'memory_used',
                        value: memory.usedJSHeapSize,
                        unit: 'bytes',
                        timestamp: Date.now(),
                        context: {
                            totalHeap: memory.totalJSHeapSize,
                            heapLimit: memory.jsHeapSizeLimit,
                            sessionId: this.sessionId,
                        },
                    });
                }
            } catch (error) {
                console.error('Error monitoring memory:', error);
            }
        }, 10000); // Check every 10 seconds

        // Store interval for cleanup
        (this as any).memoryInterval = memoryCheckInterval;
    }

    private startFrameRateMonitoring() {
        let lastFrameTime = Date.now();

        const checkFrameRate = () => {
            const currentTime = Date.now();
            const frameTime = currentTime - lastFrameTime;
            lastFrameTime = currentTime;

            // Calculate FPS
            const fps = 1000 / frameTime;

            this.addMetric({
                name: 'frame_rate',
                value: fps,
                unit: 'fps',
                timestamp: Date.now(),
                context: {
                    frameTime,
                    sessionId: this.sessionId,
                },
            });

            // Warn about low frame rate
            if (fps < 50) {
                console.warn(`Low frame rate detected: ${fps.toFixed(1)} FPS`);
            }
        };

        // Use requestAnimationFrame for accurate frame rate measurement
        const frameRateLoop = () => {
            checkFrameRate();
            requestAnimationFrame(frameRateLoop);
        };

        requestAnimationFrame(frameRateLoop);
    }

    private startNavigationMonitoring() {
        // This would integrate with React Navigation
        // For now, we'll simulate navigation tracking
    }

    /**
     * Generate performance report
     */
    generateReport(): PerformanceReport {
        const endTime = Date.now();
        const sessionMetrics = this.metrics.filter(m =>
            m.context?.sessionId === this.sessionId
        );

        // Find slowest component
        const renderMetrics = sessionMetrics.filter(m => m.name === 'render_time');
        const slowestRender = renderMetrics.reduce((max, current) =>
            current.value > max.value ? current : max,
            { value: 0, component: 'unknown' as string }
        );

        // Calculate average render time
        const averageRenderTime = renderMetrics.length > 0
            ? renderMetrics.reduce((sum, metric) => sum + metric.value, 0) / renderMetrics.length
            : 0;

        // Find memory peak
        const memoryMetrics = sessionMetrics.filter(m => m.name === 'memory_used');
        const memoryPeak = memoryMetrics.length > 0
            ? Math.max(...memoryMetrics.map(m => m.value))
            : 0;

        // Count errors
        const errorCount = sessionMetrics.filter(m =>
            m.context?.success === false ||
            (m.context?.status && m.context.status >= 400)
        ).length;

        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            endTime,
            metrics: sessionMetrics,
            summary: {
                slowestComponent: slowestRender.component || 'unknown',
                averageRenderTime: Math.round(averageRenderTime * 100) / 100,
                memoryPeak,
                errors: errorCount,
            },
        };
    }

    /**
     * Save report to storage
     */
    async saveReport(): Promise<void> {
        try {
            const report = this.generateReport();
            const reportKey = `performance_report_${this.sessionId}`;

            await AsyncStorage.setItem(reportKey, JSON.stringify(report));

            // Also save summary to reports list
            const reportsKey = 'performance_reports_list';
            const existingReports = await AsyncStorage.getItem(reportsKey);
            const reportsList = existingReports ? JSON.parse(existingReports) : [];

            reportsList.push({
                sessionId: this.sessionId,
                startTime: this.startTime,
                endTime: report.endTime,
                summary: report.summary,
            });

            // Keep only last 20 reports
            if (reportsList.length > 20) {
                reportsList.splice(0, reportsList.length - 20);
            }

            await AsyncStorage.setItem(reportsKey, JSON.stringify(reportsList));
        } catch (error) {
            console.error('Error saving performance report:', error);
        }
    }

    /**
     * Get recent reports
     */
    async getRecentReports(limit: number = 10): Promise<any[]> {
        try {
            const reportsKey = 'performance_reports_list';
            const existingReports = await AsyncStorage.getItem(reportsKey);
            const reportsList = existingReports ? JSON.parse(existingReports) : [];

            return reportsList.slice(-limit);
        } catch (error) {
            console.error('Error loading performance reports:', error);
            return [];
        }
    }

    /**
     * Add observer for metrics
     */
    addObserver(observer: (metric: PerformanceMetric) => void): () => void {
        this.observers.push(observer);

        return () => {
            const index = this.observers.indexOf(observer);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    /**
     * Clear all metrics
     */
    clearMetrics(): void {
        this.metrics = [];
    }

    /**
     * Get current session metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Start tracking for a component
     */
    startTracking(componentName: string): () => void {
        const startTime = performance.now();

        return () => {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.trackRenderTime(componentName, duration);
        };
    }

    /**
     * End session and generate final report
     */
    async endSession(): Promise<PerformanceReport> {
        const report = this.generateReport();
        await this.saveReport();

        // Cleanup
        if ((this as any).memoryInterval) {
            clearInterval((this as any).memoryInterval);
        }

        return report;
    }
}

// React hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
    const monitor = PerformanceMonitor.getInstance();

    const trackRender = React.useCallback((duration: number) => {
        monitor.trackRenderTime(componentName, duration);
    }, [componentName, monitor]);

    const trackAsync = React.useCallback((
        operationName: string,
        duration: number,
        success: boolean,
        context?: Record<string, any>
    ) => {
        monitor.trackAsyncOperation(operationName, duration, success, context);
    }, [monitor]);

    const trackNetwork = React.useCallback((
        url: string,
        method: string,
        duration: number,
        status: number,
        size?: number
    ) => {
        monitor.trackNetworkRequest(url, method, duration, status, size);
    }, [monitor]);

    return {
        trackRender,
        trackAsync,
        trackNetwork,
    };
};

// Import React
import React from 'react';
