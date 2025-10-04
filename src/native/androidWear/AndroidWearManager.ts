/**
 * Android Wear Manager for FamilyDash
 * Manages Wear OS integration and companion app functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WearTile {
  id: string;
  title: string;
  content: string;
  category: 'family_status' | 'tasks' | 'goals' | 'calendar' | 'penalties';
  layout: 'single_content' | 'dual_content' | 'action_tile' | 'gauge_tile';
  data: Record<string, any>;
  priority: number;
  updateInterval: number; // seconds
  isActive: boolean;
}

const WearTileLayout = {
  SINGLE_CONTENT: 'single_content',
  DUAL_CONTENT: 'dual_content', 
  ACTION_TILE: 'action_tile',
  GAUGE_TILE: 'gauge_tile',
} as const;

export interface WearComplication {
  id: string;
  type: 'short_text' | 'long_text' | 'small_image' | 'large_image' | 'icon' | 'monochrome_image';
  watchFaceComplicationId: number;
  title: string;
  content: string;
  icon?: string;
  image?: string;
  timeline: Array<{
    timestamp: number;
    content: string;
    icon?: string;
  }>;
}

const WearComplicationType = {
  SHORT_TEXT: 'short_text',
  LONG_TEXT: 'long_text',
  SHORT_IMAGE: 'small_image', 
  LARGE_IMAGE: 'large_image',
  ICON: 'icon',
  MONOCHROME_IMAGE: 'monochrome_image',
} as const;

export interface WearNotificationAction {
  title: string;
  icon: string;
  pendingIntent: string;
  actionCode: string;
}

export interface WearNotification {
  id: string;
  familyId: string;
  memberId: string;
  title: string;
  message: string;
  category: 'task_reminder' | 'family_alert' | 'goal_milestone' | 'penalty_warning' | 'calendar_event';
  priority: 'low' | 'normal' | 'high';
  channelId: string;
  actions: WearNotificationAction[];
  wearableExtender: {
    background: string;
    contentIcon: string;
    contentIconGravity: 'start' | 'end' | 'top' | 'bottom';
    dismissible: boolean;
    hintHideIcon: boolean;
    startScrollBottom: boolean;
  };
  visibility: 'private' | 'public' | 'secret';
  timestamp: number;
}

export interface WearVoiceCommand {
  commandText: string;
  intent: string;
  parameters: Record<string, any>;
  confidence: number;
  response: string;
}

export interface WearHealthData {
  dataType: 'steps' | 'heart_rate' | 'exercise' | 'sleep';
  value: number;
  unit: string;
  timestamp: number;
  source: 'automatic' | 'manual';
}

export interface WearWatchFace {
  id: string;
  name: string;
  style: 'digital' | 'analog' | 'hybrid';
  complicationsEnabled: boolean;
  complications: string[];
  customizationOptions: Record<string, any>;
}

export interface WearSyncData {
  lastSyncTimestamp: number;
  dataType: string;
  familyId: string;
  syncStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  conflictResolution: 'manual' | 'automatic';
}

export class AndroidWearManager {
  private static instance: AndroidWearManager;
  private isWearConnected: boolean = false;
  private wearDevices: string[] = [];
  private activeTiles: WearTile[] = [];
  private complications: WearComplication[] = [];
  private watchFaces: WearWatchFace[] = [];
  private healthDataCache: WearHealthData[] = [];
  private syncQueue: WearSyncData[] = [];
  
  private constructor() {
    this.initializeWearManager();
  }

  static getInstance(): AndroidWearManager {
    if (!AndroidWearManager.instance) {
      AndroidWearManager.instance = new AndroidWearManager();
    }
    return AndroidWearManager.instance;
  }

  /**
   * Initialize Android Wear Manager
   */
  private async initializeWearManager(): Promise<void> {
    try {
      console.log('🤲 Initializing Android Wear Manager');
      
      // Check Wear OS connectivity
      await this.checkWearConnectivity();
      
      // Initialize tiles
      await this.initializeTiles();
      
      // Setup complications
      await this.setupComplications();
      
      // Setup watch faces
      await this.setupWatchFaces();
      
      // Register for voice commands
      this.registerVoiceCommands();
      
      // Start health data monitoring
      this.startHealthMonitoring();
      
      console.log('✅ Android Wear Manager initialized');
    } catch (error) {
      console.error('Error initializing Android Wear Manager:', error);
    }
  }

  /**
   * Check Wear OS connectivity
   */
  async checkWearConnectivity(): Promise<boolean> {
    try {
      console.log('📱 Checking Android Wear connectivity...');
      
      // Mock connectivity check
      this.isWearConnected = true; // Simulate connected state
      this.wearDevices = ['Galaxy Watch 4', 'Pixel Watch', 'Wear OS Device'];
      
      if (this.isWearConnected) {
        console.log(`✅ Connected to ${this.wearDevices.length} Wear OS devices`);
        
        // Start data sync
        await this.startDataSync();
        
        // Send tiles to devices
        await this.sendTilesToWear();
        
        // Send complications
        await this.sendComplicationsToWear();
      } else {
        console.log('❌ No Wear OS devices connected');
      }
      
      return this.isWearConnected;
    } catch (error) {
      console.error('Error checking Wear connectivity:', error);
      return false;
    }
  }

  /**
   * Send notification to Wear OS
   */
  async sendWearNotification(notification: WearNotification): Promise<boolean> {
    try {
      if (!this.isWearConnected) {
        console.log('⚠️ Wear OS not connected, notification queued');
        await this.queueNotification(notification);
        return false;
      }

      console.log(`📱 Sending notification to Wear OS: ${notification.title}`);

      // Convert to Wear OS notification format with WearableExtender
      const wearNotification = {
        ...notification,
        wearableExtender: {
          ...notification.wearableExtender,
          // Add Wear-specific enhancements
          hintScreenTimeout: notification.priority === 'high' ? 0 : 3000, // Auto-hide after 3s for normal priority
        },
      };

      // Send to all connected devices
      for (const device of this.wearDevices) {
        await this.sendToWearDevice(device, wearNotification);
      }

      // Save notification record
      await this.saveNotificationRecord(notification);

      return true;
    } catch (error) {
      console.error('Error sending Wear notification:', error);
      return false;
    }
  }

  /**
   * Create and deploy tile
   */
  async createTile(tile: WearTile): Promise<boolean> {
    try {
      console.log(`📱 Creating Wear OS tile: ${tile.title}`);

      // Validate tile data
      await this.validateTileData(tile);

      // Add to active tiles
      this.activeTiles.push(tile);

      // Send tile to devices
      if (this.isWearConnected) {
        await this.sendTileToWearDevices(tile);
      }

      // Schedule tile updates
      this.scheduleTileUpdate(tile);

      console.log(`✅ Tile created: ${tile.title}`);
      return true;
    } catch (error) {
      console.error('Error creating tile:', error);
      return false;
    }
  }

  /**
   * Update tile content
   */
  async updateTile(tileId: string, newData: Record<string, any>): Promise<void> {
    try {
      const tile = this.activeTiles.find(t => t.id === tileId);
      
      if (!tile) {
        throw new Error(`Tile not found: ${tileId}`);
      }

      console.log(`📱 Updating tile: ${tile.title}`);

      // Update tile data
      tile.data = { ...tile.data, ...newData };

      // Send update to devices
      if (this.isWearConnected) {
        await this.updateTileOnWearDevices(tile);
      }

      console.log(`✅ Tile updated: ${tile.title}`);
    } catch (error) {
      console.error('Error updating tile:', error);
    }
  }

  /**
   * Handle voice command from Wear OS
   */
  async handleVoiceCommand(commandText: string): Promise<WearVoiceCommand> {
    try {
      console.log(`🎤 Handling Wear OS voice command: ${commandText}`);

      // Parse voice command using Android's speech recognition
      const intent = await this.parseVoiceIntent(commandText);
      const parameters = await this.extractCommandParameters(commandText, intent);

      // Execute command
      const response = await this.executeVoiceCommand(intent, parameters);

      const voiceCommand: WearVoiceCommand = {
        commandText,
        intent,
        parameters,
        confidence: this.calculateConfidence(commandText, intent),
        response,
      };

      // Respond to Wear OS
      await this.sendVoiceResponse(voiceCommand);

      return voiceCommand;
    } catch (error) {
      console.error('Error handling voice command:', error);
      throw error;
    }
  }

  /**
   * Start fitness tracking
   */
  async startFitnessTracking(familyMemberId: string, exerciseType: string): Promise<void> {
    try {
      console.log(`💪 Starting fitness tracking: ${exerciseType} for ${familyMemberId}`);

      // Initialize fitness session
      const fitnessSession = {
        id: `fitness_${Date.now()}`,
        familyMemberId,
        exerciseType,
        startTime: Date.now(),
        status: 'active',
      };

      // Send to Wear OS for tracking
      if (this.isWearConnected) {
        await this.startWearFitnessSession(fitnessSession);
      }

      console.log(`✅ Fitness tracking started: ${exerciseType}`);
    } catch (error) {
      console.error('Error starting fitness tracking:', error);
    }
  }

  /**
   * Sync health data with Wear OS
   */
  async syncHealtheData(): Promise<WearHealthData[]> {
    try {
      console.log('📊 Syncing health data with Wear OS');

      const newHealthData: WearHealthData[] = [];

      // Sync steps data
      const stepsData = await this.getStepsData();
      newHealthData.push(...stepsData);

      // Sync heart rate data
      const heartRateData = await this.getHeartRateData();
      newHealthData.push(...heartRateData);

      // Sync exercise data
      const exerciseData = await this.getExerciseData();
      newHealthData.push(...exerciseData);

      // Update cache
      this.healthDataCache.push(...newHealthData);

      // Sync with cloud
      await this.syncHealthToCloud(newHealthData);

      console.log(`✅ Health data synced: ${newHealthData.length} records`);
      
      return newHealthData;
    } catch (error) {
      console.error('Error syncing health data:', error);
      return [];
    }
  }

  /**
   * Initialize default tiles
   */
  private async initializeTiles(): Promise<void> {
    try {
      const defaultTiles: WearTile[] = [
        {
          id: 'family_status_tile',
          title: 'Family Status',
          content: '3 Active Members',
          category: 'family_status',
          layout: 'single_content',
          data: { activeMembers: 3, totalMembers: 4 },
          priority: 1,
          updateInterval: 300, // 5 minutes
          isActive: true,
        },
        {
          id: 'tasks_tile',
          title: 'Today\'s Tasks',
          content: '5 Pending Tasks',
          category: 'tasks',
          layout: 'dual_content',
          data: { completed: 3, pending: 5 },
          priority: 2,
          updateInterval: 600, // 10 minutes
          isActive: true,
        },
        {
          id: 'goals_tile',
          title: 'Goal Progress',
          content: 'Daily Goals: 75%',
          category: 'goals',
          layout: 'gauge_tile',
          data: { progress: 75, target: 100 },
          priority: 3,
          updateInterval: 900, // 15 minutes
          isActive: true,
        },
      ];

      for (const tile of defaultTiles) {
        await this.createTile(tile);
      }

      console.log(`📱 Initialized ${defaultTiles.length} default tiles`);
    } catch (error) {
      console.error('Error initializing tiles:', error);
    }
  }

  /**
   * Setup complications
   */
  private async setupComplications(): Promise<void> {
    try {
      this.complications = [
        {
          id: 'family_member_count',
          type: 'short_text',
          watchFaceComplicationId: 1,
          title: 'Family Size',
          content: '4 members',
          icon: 'person.3',
          timeline: [
            { timestamp: Date.now(), content: '4 members', icon: 'person.3' },
          ],
        },
        {
          id: 'next_task',
          type: 'long_text',
          watchFaceComplicationId: 2,
          title: 'Next Task',
          content: 'Buy groceries at 5 PM',
          timeline: [
            { timestamp: Date.now(), content: 'Buy groceries at 5 PM' },
          ],
        },
        {
          id: 'daily_progress',
          type: 'gauge',
          watchFaceComplicationId: 3,
          title: 'Daily Progress',
          content: '75%',
          timeline: [
            { timestamp: Date.now(), content: '75%' },
          ],
        },
      ];

      console.log(`📊 Setup ${this.complications.length} complications`);
    } catch (error) {
      console.error('Error setting up complications:', error);
    }
  }

  /**
   * Setup watch faces
   */
  private async setupWatchFaces(): Promise<void> {
    try {
      this.watchFaces = [
        {
          id: 'family_dash_digital',
          name: 'FamilyDash Digital',
          style: 'digital',
          complicationsEnabled: true,
          complications: ['family_member_count', 'next_task'],
          customizationOptions: {
            colorScheme: 'blue',
            fontStyle: 'modern',
          },
        },
        {
          id: 'family_dash_analog',
          name: 'FamilyDash Analog',
          style: 'analog',
          complicationsEnabled: true,
          complications: ['daily_progress'],
          customizationOptions: {
            handStyle: 'bold',
            markers: 'dots',
          },
        },
      ];

      console.log(`🎨 Setup ${this.watchFaces.length} watch faces`);
    } catch (error) {
      console.error('Error setting up watch faces:', error);
    }
  }

  /**
   * Register voice commands
   */
  private registerVoiceCommands(): void {
    try {
      console.log('🎤 Registering Wear OS voice commands');
      
      // Mock voice command registration
      const commands = [
        'Hey FamilyDash',
        'Create task',
        'Add event',
        'Check family status',
        'Start workout',
      ];

      commands.forEach(command => {
        console.log(`🎤 Registered voice command: ${command}`);
      });
    } catch (error) {
      console.error('Error registering voice commands:', error);
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    try {
      console.log('📊 Starting health data monitoring');
      
      // Set up interval for health data collection
      setInterval(async () => {
        try {
          if (this.isWearConnected) {
            await this.syncHealthData();
          }
        } catch (error) {
          console.error('Error in health monitoring:', error);
        }
      }, 300000); // Monitor every 5 minutes
    } catch (error) {
      console.error('Error starting health monitoring:', error);
    }
  }

  /**
   * Validate tile data
   */
  private async validateTileData(tile: WearTile): Promise<void> {
    try {
      // Check required fields
      if (!tile.id || !tile.title || !tile.layout) {
        throw new Error('Tile data validation failed');
      }

      // Check layout compatibility
      if (!Object.values(WearTileLayout).includes(tile.layout)) {
        throw new Error(`Invalid tile layout: ${tile.layout}`);
      }

      console.log(`✅ Tile data validated: ${tile.title}`);
    } catch (error) {
      console.error('Tile validation error:', error);
      throw error;
    }
  }

  /**
   * Send tile to Wear devices
   */
  private async sendTileToWearDevices(tile: WearTile): Promise<void> {
    try {
      console.log(`📱 Sending tile to Wear devices: ${tile.title}`);
      
      for (const device of this.wearDevices) {
        console.log(`📱 Sending to ${device}: ${tile.title}`);
        await this.sendToWearDevice(device, { type: 'tile', data: tile });
      }
    } catch (error) {
      console.error('Error sending tile to Wear devices:', error);
    }
  }

  /**
   * Update tile on Wear devices
   */
  private async updateTileOnWearDevices(tile: WearTile): Promise<void> {
    try {
      console.log(`📱 Updating tile on Wear devices: ${tile.title}`);
      
      for (const device of this.wearDevices) {
        console.log(`📱 Updating on ${device}: ${tile.title}`);
        await this.sendToWearDevice(device, { type: 'tile_update', data: tile });
      }
    } catch (error) {
      console.error('Error updating tile on Wear devices:', error);
    }
  }

  /**
   * Schedule tile update
   */
  private scheduleTileUpdate(tile: WearTile): void {
    try {
      console.log(`⏰ Scheduling tile update: ${tile.title} every ${tile.updateInterval}s`);
      
      // Mock scheduling
      setInterval(() => {
        this.updateTile(tile.id, { lastUpdated: Date.now() });
      }, tile.updateInterval * 1000);
    } catch (error) {
      console.error('Error scheduling tile update:', error);
    }
  }

  /**
   * Parse voice intent
   */
  private async parseVoiceIntent(commandText: string): Promise<string> {
    try {
      // Mock voice parsing (in real app would use Android's SpeechRecognizer)
      const command = commandText.toLowerCase();
      
      if (command.includes('create') && command.includes('task')) {
        return 'create_task';
      } else if (command.includes('add') && command.includes('event')) {
        return 'add_event';
      } else if (command.includes('status') || command.includes('check')) {
        return 'check_status';
      } else if (command.includes('start') && command.includes('workout')) {
        return 'start_workout';
      } else {
        return 'general_query';
      }
    } catch (error) {
      console.error('Error parsing voice intent:', error);
      return 'general_query';
    }
  }

  /**
   * Extract command parameters
   */
  private async extractCommandParameters(commandText: string, intent: string): Promise<Record<string, any>> {
    try {
      const parameters: Record<string, any> = {};
      
      switch (intent) {
        case 'create_task':
          // Extract task description
          const taskMatch = commandText.match(/(?:create|add).*?(?:task for|to do)\s*(.+)/i);
          parameters.task = taskMatch ? taskMatch[1] : 'New task';
          break;
        case 'add_event':
          // Extract event details
          const eventMatch = commandText.match(/(?:add|create).*?(?:event|appointment)\s*(.+)/i);
          parameters.event = eventMatch ? eventMatch[1] : 'New event';
          break;
        case 'start_workout';
          // Extract exercise type
          const exerciseType = this.extractExerciseType(commandText);
          parameters.exerciseType = exerciseType;
          break;
      }
      
      return parameters;
    } catch (error) {
      console.error('Error extracting command parameters:', error);
      return {};
    }
  }

  /**
   * Extract exercise type from command
   */
  private extractExerciseType(commandText: string): string {
    const text = commandText.toLowerCase();
    
    if (text.includes('running') || text.includes('run')) {
      return 'running';
    } else if (text.includes('walking') || text.includes('walk')) {
      return 'walking';
    } else if (text.includes('cycling') || text.includes('bike')) {
      return 'cycling';
    } else {
      return 'general_exercise';
    }
  }

  /**
   * Execute voice command
   */
  private async executeVoiceCommand(intent: string, parameters: Record<string, any>): Promise<string> {
    try {
      console.log(`⚡ Executing Wear voice command: ${intent}`);
      
      switch (intent) {
        case 'create_task':
          return `Task "${parameters.task}" created successfully`;
        case 'add_event':
          return `Event "${parameters.event}" added to family calendar`;
        case 'check_status':
          return `Family status: 4 active members, 3 pending tasks`;
        case 'start_workout':
          await this.startFitnessTracking('current_user', parameters.exerciseType);
          return `Started ${parameters.exerciseType} workout`;
        default:
          return `Command received: ${intent}`;
      }
    } catch (error) {
      console.error('Error executing voice command:', error);
      return 'Sorry, I couldn\'t process that command';
    }
  }

  /**
   * Send voice response to Wear OS
   */
  private async sendVoiceResponse(voiceCommand: WearVoiceCommand): Promise<void> {
    try {
      console.log(`🎤 Sending voice response to Wear OS: ${voiceCommand.response}`);
      
      // Send response to all connected devices
      for (const device of this.wearDevices) {
        await this.sendToWearDevice(device, {
          type: 'voice_response',
          data: voiceCommand,
        });
      }
    } catch (error) {
      console.error('Error sending voice response:', error);
    }
  }

  /**
   * Send to Wear device
   */
  private async sendToWearDevice(device: string, data: any): Promise<void> {
    try {
      // Mock sending to Wear device
      console.log(`📱 Sending to ${device}:`, data.type);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error sending to ${device}:`, error);
    }
  }

  /**
   * Queue notification when Wear OS is disconnected
   */
  private async queueNotification(notification: WearNotification): Promise<void> {
    try {
      const queuedNotifications = await AsyncStorage.getItem('queued_wear_notifications') || '[]';
      const notifications = JSON.parse(queuedNotifications);
      notifications.push(notification);
      
      await AsyncStorage.setItem('queued_wear_notifications', JSON.stringify(notifications));
      
      console.log('📋 Notification queued for Wear OS');
    } catch (error) {
      console.error('Error queueing Wear notification:', error);
    }
  }

  /**
   * Save notification record
   */
  private async saveNotificationRecord(notification: WearNotification): Promise<void> {
    try {
      const records = await AsyncStorage.getItem('wear_notification_records') || '[]';
      const recordList = JSON.parse(records);
      
      recordList.push({
        ...notification,
        sentAt: Date.now(),
        wearConnected: this.isWearConnected,
      });
      
      // Keep only last 100 records
      if (recordList.length > 100) {
        recordList.splice(0, recordList.length - 100);
      }
      
      await AsyncStorage.setItem('wear_notification_records', JSON.stringify(recordList));
    } catch (error) {
      console.error('Error saving Wear notification record:', error);
    }
  }

  /**
   * Start Wear fitness session
   */
  private async startWearFitnessSession(session: any): Promise<void> {
    try {
      console.log(`💪 Starting Wear OS fitness session: ${session.exerciseType}`);
      
      for (const device of this.wearDevices) {
        await this.sendToWearDevice(device, {
          type: 'fitness_session_start',
          data: session,
        });
      }
    } catch (error) {
      console.error('Error starting Wear fitness session:', error);
    }
  }

  /**
   * Get steps data from Wear OS
   */
  private async getStepsData(): Promise<WearHealthData[]> {
    try {
      // Mock steps data
      return [
        {
          dataType: 'steps',
          value: Math.floor(Math.random() * 5000) + 1000,
          unit: 'steps',
          timestamp: Date.now(),
          source: 'automatic',
        },
      ];
    } catch (error) {
      console.error('Error getting steps data:', error);
      return [];
    }
  }

  /**
   * Get heart rate data from Wear OS
   */
  private async getHeartRateData(): Promise<WearHealthData[]> {
    try {
      // Mock heart rate data
      return [
        {
          dataType: 'heart_rate',
          value: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
          unit: 'bpm',
          timestamp: Date.now(),
          source: 'automatic',
        },
      ];
    } catch (error) {
      console.error('Error getting heart rate data:', error);
      return [];
    }
  }

  /**
   * Get exercise data from Wear OS
 */
  private async getExerciseData(): Promise<WearHealthData[]> {
    try {
      // Mock exercise data
      return [
        {
          dataType: 'exercise',
          value: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          unit: 'minutes',
          timestamp: Date.now(),
          source: 'automatic',
        },
      ];
    } catch (error) {
      console.error('Error getting exercise data:', error);
      return [];
    }
  }

  /**
   * Sync health data to cloud
   */
  private async syncHealthToCloud(healthData: WearHealthData[]): Promise<void> {
    try {
      console.log(`☁️ Syncing ${healthData.length} health records to cloud`);
      
      // Mock cloud sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Health data synced to cloud');
    } catch (error) {
      console.error('Error syncing health data to cloud:', error);
    }
  }

  /**
   * Calculate voice command confidence
   */
  private calculateConfidence(commandText: string, intent: string): number {
    try {
      // Mock confidence calculation
      const baseConfidence = 0.8;
      const textLengthBonus = Math.min(commandText.length / 50, 0.2);
      
      return Math.min(baseConfidence + textLengthBonus, 0.95);
    } catch (error) {
      console.error('Error calculating confidence:', error);
      return 0.5;
    }
  }

  /**
   * Start data sync
   */
  private async startDataSync(): Promise<void> {
    try {
      console.log('🔄 Starting Wear OS data sync');
      
      // Mock data sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Wear OS data sync completed');
    } catch (error) {
      console.error('Error starting data sync:', error);
    }
  }

  /**
   * Send tiles to Wear
   */
  private async sendTilesToWear(): Promise<void> {
    try {
      console.log(`📱 Sending ${this.activeTiles.length} tiles to Wear OS`);
      
      for (const tile of this.activeTiles) {
        await this.sendTileToWearDevices(tile);
      }
      
      console.log('✅ Tiles sent to Wear OS');
    } catch (error) {
      console.error('Error sending tiles to Wear:', error);
    }
  }

  /**
   * Send complications to Wear
   */
  private async sendComplicationsToWear(): Promise<void> {
    try {
      console.log(`📊 Sending ${this.complications.length} complications to Wear OS`);
      
      for (const device of this.wearDevices) {
        await this.sendToWearDevice(device, {
          type: 'complications',
          data: this.complications,
        });
      }
      
      console.log('✅ Complications sent to Wear OS');
    } catch (error) {
      console.error('Error sending complications to Wear:', error);
    }
  }

  /**
   * Public getters
   */
  get isConnected(): boolean {
    return this.isWearConnected;
  }

  get connectedDevices(): string[] {
    return this.wearDevices;
  }

  get activeTiles(): WearTile[] {
    return this.activeTiles;
  }

  get complications(): WearComplication[] {
    return this.complications;
  }

  get watchFaces(): WearWatchFace[] {
    return this.watchFaces;
  }

  get healthData(): WearHealthData[] {
    return this.healthDataCache;
  }
}
