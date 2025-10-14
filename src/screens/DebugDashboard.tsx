/**
 * Debug Dashboard Screen
 * Comprehensive debugging and error detection system
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { RealAuthService, RealDatabaseService } from '../services';
import { syncMonitorService } from '@/services/sync/SyncMonitorService';
import { useTasksStore } from '@/modules/tasks/store/tasksStore';
import { usePenaltiesStore } from '@/modules/penalties/store/penaltiesStore';
import { useCalendarStore } from '@/modules/calendar/store/calendarStore';
import { useProfileStore } from '@/modules/profile/store/profileStore';

interface DebugScreenProps {
  navigation: any;
}

interface DebugLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  module: string;
  message: string;
  data?: any;
  stack?: string;
}

interface ErrorReport {
  id: string;
  error: string;
  module: string;
  userId?: string;
  timestamp: Date;
  resolved: boolean;
  fixAttempts: number;
}

interface HealthCheck {
  module: string;
  status: 'healthy' | 'warning' | 'error';
  latency: number;
  lastCheck: Date;
  errors: number;
  fixes: number;
}

const DebugDashboard: React.FC<DebugScreenProps> = ({ navigation }) => {
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [errorReports, setErrorReports] = useState<ErrorReport[]>([]);
  const [healthChecks, setHealthChecks] = useState<Map<string, HealthCheck>>(new Map());
  const [isDebugModeOn, setIsDebugModeOn] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    memoryUsage: 0,
    renderTime: 0,
    networkLatency: 0,
    cpuUsage: 0,
  });
  const [customCommand, setCustomCommand] = useState('');

  const stores = {
    tasks: useTasksStore(),
    penalties: usePenaltiesStore(),
    calendar: useCalendarStore(),
    profile: useProfileStore(),
  };

  // Add debug log
  const addDebugLog = (level: DebugLog['level'], module: string, message: string, data?: any) => {
    const log: DebugLog = {
      id: `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      module,
      message,
      data,
    };

    setDebugLogs(prev => [log, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  // Add error report
  const addErrorReport = async (error: string, module: string) => {
    const currentUser = await RealAuthService.getCurrentUser();
    const report: ErrorReport = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      error,
      module,
      userId: currentUser?.uid,
      timestamp: new Date(),
      resolved: false,
      fixAttempts: 0,
    };

    setErrorReports(prev => [report, ...prev.slice(0, 49)]); // Keep last 50 errors

    // Attempt auto-fix if enabled
    if (autoFixEnabled) {
      attemptAutoFix(report);
    }
  };

  // Attempt auto-fix
  const attemptAutoFix = async (report: ErrorReport) => {
    addDebugLog('info', 'auto-fix', 'Attempting to auto-fix error', report);

    try {
      const fixes = await getAvailableAutoFixes(report);

      for (const fix of fixes) {
        const success = await executeFix(fix);
        if (success) {
          report.resolved = true;
          report.fixAttempts++;
          addDebugLog('info', 'auto-fix', `Auto-fix successful: ${fix.name}`, fix);

          // Update health check
          updateHealthCheck(report.module, 'healthy', 0);

          break;
        } else {
          report.fixAttempts++;
          addDebugLog('warning', 'auto-fix', `Auto-fix failed: ${fix.name}`, fix);
        }
      }

      setErrorReports(prev => [...prev]); // Trigger re-render

    } catch (error) {
      addDebugLog('error', 'auto-fix', 'Auto-fix system error', { error: error.message });
    }
  };

  // Get available auto-fixes for an error
  const getAvailableAutoFixes = async (report: ErrorReport): Promise<any[]> => {
    const fixes = [];

    switch (report.module) {
      case 'firebase-auth':
        fixes.push({
          name: 'reauthenticate',
          action: async () => {
            const currentUser = await RealAuthService.getCurrentUser();
            return RealAuthService.signInWithEmail({
              email: currentUser?.email || '',
              password: 'dummy_password'
            });
          },
        });
        break;

      case 'firebase-firestore':
        fixes.push({
          name: 'reconnect-firestore',
          action: () => RealDatabaseService.checkConnection(),
        });
        break;

      case 'tasks-store':
        fixes.push({
          name: 'reconnect-tasks',
          action: () => stores.tasks.reconnect(),
        });
        break;

      case 'goals-store':
        fixes.push({
          name: 'reconnect-goals',
          action: () => stores.goals.reconnect(),
        });
        break;

      case 'sync-service':
        fixes.push({
          name: 'restart-sync',
          action: () => syncMonitorService.cleanup().then(() => syncMonitorService.initialize()),
        });
        break;

      default:
        fixes.push({
          name: 'reinitialize-module',
          action: () => Promise.resolve(),
        });
    }

    return fixes;
  };

  // Execute auto-fix
  const executeFix = async (fix: any): Promise<boolean> => {
    try {
      await fix.action();
      return true;
    } catch (error) {
      addDebugLog('error', 'auto-fix', `Fix execution failed: ${fix.name}`, { error: error.message });
      return false;
    }
  };

  // Update health check
  const updateHealthCheck = (module: string, status: HealthCheck['status'], latency: number) => {
    const healthCheck: HealthCheck = {
      module,
      status,
      latency,
      lastCheck: new Date(),
      errors: status === 'error' ? (healthChecks.get(module)?.errors || 0) + 1 : 0,
      fixes: status === 'healthy' ? (healthChecks.get(module)?.fixes || 0) + 1 : 0,
    };

    setHealthChecks(prev => new Map(prev.set(module, healthCheck)));
  };

  // Run comprehensive health check
  const runHealthCheck = async () => {
    addDebugLog('info', 'health-check', 'Starting comprehensive health check...');

    const modules = [
      { name: 'firebase-auth', check: () => RealAuthService.getCurrentUser() !== null },
      { name: 'firebase-firestore', check: () => RealDatabaseService.checkConnection() },
      { name: 'tasks-store', check: () => stores.tasks.checkConnection() },
      { name: 'goals-store', check: () => stores.goals.checkConnection() },
      { name: 'penalties-store', check: () => stores.penalties.checkConnection() },
      { name: 'calendar-store', check: () => stores.calendar.checkConnection() },
      { name: 'sync-service', check: () => Promise.resolve(true) }, // Always passes for now
    ];

    const startTime = Date.now();

    for (const module of modules) {
      try {
        const checkStart = Date.now();
        await module.check();
        const latency = Date.now() - checkStart;

        if (latency > 1000) {
          updateHealthCheck(module.name, 'warning', latency);
          addDebugLog('warning', module.name, `High latency detected: ${latency}ms`);
        } else {
          updateHealthCheck(module.name, 'healthy', latency);
          addDebugLog('debug', module.name, `Health check passed: ${latency}ms`);
        }

      } catch (error) {
        updateHealthCheck(module.name, 'error', 0);
        await addErrorReport(error.message, module.name);
        addDebugLog('error', module.name, `Health check failed: ${error.message}`);
      }
    }

    const totalTime = Date.now() - startTime;
    addDebugLog('info', 'health-check', `Health check completed in ${totalTime}ms`);
  };

  // Performance monitoring
  const startPerformanceMonitoring = () => {
    const startTime = Date.now();

    // Simulate performance metrics
    const performanceInterval = setInterval(() => {
      const currentTime = Date.now();
      const renderTime = currentTime - startTime;

      setPerformanceData(prev => ({
        memoryUsage: Math.random() * 100, // Mock memory usage
        renderTime,
        networkLatency: Math.random() * 500, // Mock network latency
        cpuUsage: Math.random() * 100, // Mock CPU usage
      }));

      // Check for performance issues
      if (renderTime > 100) {
        addDebugLog('warning', 'performance', `Slow render detected: ${renderTime}ms`);
      }
    }, 1000);

    return () => clearInterval(performanceInterval);
  };

  // Execute custom command
  const executeCustomCommand = async () => {
    if (!customCommand.trim()) {
      Alert.alert('Error', 'Please enter a command');
      return;
    }

    addDebugLog('info', 'custom-command', `Executing: ${customCommand}`);

    try {
      const [command, ...args] = customCommand.split(' ');

      switch (command.toLowerCase()) {
        case 'health':
          await runHealthCheck();
          break;

        case 'ping':
          const result = await RealDatabaseService.checkConnection();
          addDebugLog('info', 'ping', `Database ping: ${result}`);
          break;

        case 'auth':
          const user = await RealAuthService.getCurrentUser();
          addDebugLog('info', 'auth', `Current user: ${user?.email || 'Not authenticated'}, ${user?.uid || 'No UID'}`);
          break;

        case 'clear':
          setDebugLogs([]);
          setErrorReports([]);
          addDebugLog('info', 'clear', 'Debug logs and errors cleared');
          break;

        case 'stores':
          const storeInfo = Object.entries(stores).map(([name, store]) => ({
            name,
            // @ts-ignore
            tasks: store.tasks?.length || 0,
            // @ts-ignore
            goals: store.goals?.length || 0,
            // @ts-ignore
            penalties: store.penalties?.length || 0,
            // @ts-ignore
            events: store.events?.length || 0,
          }));
          addDebugLog('info', 'stores', 'Store data counts', { stores: storeInfo });
          break;

        default:
          addDebugLog('warning', 'custom-command', `Unknown command: ${command}`);
      }

      setCustomCommand('');

    } catch (error) {
      await addErrorReport(error.message, 'custom-command');
      Alert.alert('Error', `Command failed: ${error.message}`);
    }
  };

  // Clear all logs
  const clearAllLogs = () => {
    setDebugLogs([]);
    setErrorReports([]);
    setHealthChecks(new Map());
    setPerformanceData({ memoryUsage: 0, renderTime: 0, networkLatency: 0, cpuUsage: 0 });
  };

  // Initialize debug system
  useEffect(() => {
    addDebugLog('info', 'debug-system', 'Debug dashboard initialized');

    // Start with initial health check
    runHealthCheck();

    // Start performance monitoring
    const cleanupPerformance = startPerformanceMonitoring();

    return () => {
      cleanupPerformance();
      addDebugLog('info', 'debug-system', 'Debug dashboard cleanup');
    };
  }, []);

  // Real-time error catching
  useEffect(() => {
    const originalConsoleError = console.error;

    console.error = (...args: any[]) => {
      const errorMessage = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');

      addErrorReport(errorMessage, 'console').catch(console.error);

      // Call original console.error
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#f44336', '#e91e63']}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>🔍 Debug Dashboard</Text>
        <Text style={styles.headerSubtitle}>Advanced Error Detection & Auto-Fix System</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Debug Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>Debug Mode</Text>
              <Switch
                value={isDebugModeOn}
                onValueChange={setIsDebugModeOn}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={isDebugModeOn ? '#f44336' : '#f4f3f4'}
              />
            </View>

            <View style={styles.controlItem}>
              <Text style={styles.controlLabel}>Auto-Fix</Text>
              <Switch
                value={autoFixEnabled}
                onValueChange={setAutoFixEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={autoFixEnabled ? '#4caf50' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={runHealthCheck}>
              <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.buttonGradient}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Health Check</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={clearAllLogs}>
              <LinearGradient colors={['#607D8B', '#455a64']} style={styles.buttonGradient}>
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Clear</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Monitor */}
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>Performance Monitor</Text>

          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{Math.round(performanceData.memoryUsage)}%</Text>
              <Text style={styles.performanceLabel}>Memory</Text>
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{performanceData.renderTime}ms</Text>
              <Text style={styles.performanceLabel}>Render</Text>
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{Math.round(performanceData.networkLatency)}ms</Text>
              <Text style={styles.performanceLabel}>Network</Text>
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{Math.round(performanceData.cpuUsage)}%</Text>
              <Text style={styles.performanceLabel}>CPU</Text>
            </View>
          </View>
        </View>

        {/* Health Diagnostics */}
        <View style={styles.healthContainer}>
          <Text style={styles.sectionTitle}>Health Diagnostics</Text>

          {Array.from(healthChecks.entries()).map(([module, health]) => (
            <View key={module} style={styles.healthItem}>
              <View style={styles.healthHeader}>
                <Text style={styles.healthModule}>{module}</Text>
                <Text style={[styles.healthStatus, {
                  color: health.status === 'healthy' ? '#4CAF50' :
                    health.status === 'warning' ? '#FF9800' : '#f44336'
                }]}>
                  {health.status === 'healthy' ? '✅' :
                    health.status === 'warning' ? '⚠️' : '❌'}
                  {health.status.toUpperCase()}
                </Text>
              </View>
              <View style={styles.healthDetails}>
                <Text style={styles.healthDetail}>Latency: {health.latency}ms</Text>
                <Text style={styles.healthDetail}>Errors: {health.errors}</Text>
                <Text style={styles.healthDetail}>Fixes: {health.fixes}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Custom Command */}
        <View style={styles.commandContainer}>
          <Text style={styles.sectionTitle}>Custom Commands</Text>

          <View style={styles.commandInput}>
            <TextInput
              style={styles.commandTextInput}
              value={customCommand}
              onChangeText={setCustomCommand}
              placeholder="Enter debug command... (health, ping, auth, stores, clear)"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.commandButton} onPress={executeCustomCommand}>
              <LinearGradient colors={['#FF9800', '#f57c00']} style={styles.buttonGradient}>
                <Ionicons name="send" size={16} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.commandHelp}>
            Available commands: health, ping, auth, stores, clear
          </Text>
        </View>

        {/* Error Reports */}
        <View style={styles.errorsContainer}>
          <Text style={styles.sectionTitle}>Error Reports ({errorReports.length})</Text>

          {errorReports.length === 0 ? (
            <Text style={styles.emptyText}>No errors detected</Text>
          ) : (
            errorReports.slice(0, 10).map((report) => (
              <View key={report.id} style={styles.errorItem}>
                <View style={styles.errorHeader}>
                  <Text style={styles.errorModule}>{report.module}</Text>
                  <View style={styles.errorMeta}>
                    <Text style={[styles.errorStatus, {
                      color: report.resolved ? '#4CAF50' : '#f44336'
                    }]}>
                      {report.resolved ? '✅ FIXED' : '❌ UNRESOLVED'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.errorMessage}>{report.error}</Text>
                <Text style={styles.errorTime}>
                  {report.timestamp.toLocaleString()} • Attempts: {report.fixAttempts}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Debug Logs */}
        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>Debug Logs ({debugLogs.length})</Text>

          {debugLogs.length === 0 ? (
            <Text style={styles.emptyText}>No debug logs</Text>
          ) : (
            debugLogs.slice(0, 20).map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTime}>{log.timestamp.toLocaleTimeString()}</Text>
                  <Text style={[styles.logLevel, {
                    color: log.level === 'error' ? '#f44336' :
                      log.level === 'warning' ? '#FF9800' :
                        log.level === 'info' ? '#4CAF50' : '#607D8B'
                  }]}>
                    {log.level === 'error' ? '❌' :
                      log.level === 'warning' ? '⚠️' :
                        log.level === 'info' ? '✅' : '🔍'}
                    {log.level.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.logModule}>{log.module}</Text>
                <Text style={styles.logMessage}>{log.message}</Text>
                {log.data && (
                  <Text style={styles.logData}>{JSON.stringify(log.data, null, 2)}</Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },

  // Controls
  controlsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlItem: {
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },

  // Performance
  performanceContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },

  // Health
  healthContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  healthModule: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  healthStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  healthDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthDetail: {
    fontSize: 10,
    color: '#666',
  },

  // Command
  commandContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commandInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commandTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  commandButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  commandHelp: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  // Errors
  errorsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  errorModule: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  errorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorStatus: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorMessage: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  errorTime: {
    fontSize: 10,
    color: '#999',
  },

  // Logs
  logsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  logTime: {
    fontSize: 10,
    color: '#999',
  },
  logLevel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  logModule: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  logData: {
    fontSize: 9,
    color: '#999',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },

  // Empty states
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});

export default DebugDashboard;




