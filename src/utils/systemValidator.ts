/**
 * 🔍 SYSTEM VALIDATOR
 * Validates the entire system for common issues and problems
 * Run this to check system health
 */

import { validateMigration } from './migrationHelper';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  file?: string;
  line?: number;
  fix?: string;
}

export interface ValidationWarning {
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

/**
 * Validates Firebase configuration
 */
export function validateFirebaseConfig(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    // Check if Firebase config exists
    const config = require('@/config/firebase');
    
    if (!config.firebaseConfig) {
      issues.push({
        type: 'error',
        category: 'firebase',
        message: 'Firebase configuration not found',
        fix: 'Ensure firebase.ts has proper configuration'
      });
    }
    
    // Check for placeholder values
    const configStr = JSON.stringify(config.firebaseConfig || {});
    if (configStr.includes('xxxxx') || configStr.includes('placeholder')) {
      issues.push({
        type: 'error',
        category: 'firebase',
        message: 'Firebase configuration contains placeholder values',
        fix: 'Update firebase.ts with real configuration values'
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'firebase',
      message: `Firebase config validation failed: ${error.message}`,
      fix: 'Check firebase.ts file exists and is properly configured'
    });
  }
  
  return issues;
}

/**
 * Validates store configuration
 */
export function validateStoreConfiguration(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    // Check if unified store exists
    const store = require('@/store');
    
    if (!store.useAppStore) {
      issues.push({
        type: 'error',
        category: 'store',
        message: 'Unified store not found',
        fix: 'Ensure src/store/index.ts exists and exports useAppStore'
      });
    }
    
    // Check for old store usage
    const oldStores = ['useAchievementsStore', 'useTasksStore', 'usePenaltiesStore'];
    oldStores.forEach(storeName => {
      if (store[storeName]) {
        issues.push({
          type: 'warning',
          category: 'store',
          message: `Old store ${storeName} still exists`,
          fix: `Migrate to unified store: useAppStore().${storeName.toLowerCase()}`
        });
      }
    });
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'store',
      message: `Store validation failed: ${error.message}`,
      fix: 'Check src/store/index.ts file exists and is properly configured'
    });
  }
  
  return issues;
}

/**
 * Validates navigation configuration
 */
export function validateNavigation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    // Check if ConditionalNavigator exists
    const navigator = require('@/navigation/ConditionalNavigator');
    
    if (!navigator.default) {
      issues.push({
        type: 'error',
        category: 'navigation',
        message: 'ConditionalNavigator not found',
        fix: 'Ensure ConditionalNavigator.tsx exists and has default export'
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'navigation',
      message: `Navigation validation failed: ${error.message}`,
      fix: 'Check navigation files exist and are properly configured'
    });
  }
  
  return issues;
}

/**
 * Validates error handling
 */
export function validateErrorHandling(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    // Check if ErrorBoundary exists
    const errorBoundary = require('@/components/ErrorBoundary');
    
    if (!errorBoundary.default) {
      issues.push({
        type: 'error',
        category: 'error-handling',
        message: 'ErrorBoundary not found',
        fix: 'Ensure ErrorBoundary.tsx exists and has default export'
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'error-handling',
      message: `Error handling validation failed: ${error.message}`,
      fix: 'Check ErrorBoundary.tsx file exists and is properly configured'
    });
  }
  
  return issues;
}

/**
 * Validates TypeScript configuration
 */
export function validateTypeScriptConfig(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if tsconfig.json exists
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (!fs.existsSync(tsconfigPath)) {
      issues.push({
        type: 'error',
        category: 'typescript',
        message: 'tsconfig.json not found',
        fix: 'Create tsconfig.json with proper configuration'
      });
      return issues;
    }
    
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Check for baseUrl
    if (!tsconfig.compilerOptions?.baseUrl) {
      issues.push({
        type: 'warning',
        category: 'typescript',
        message: 'baseUrl not configured in tsconfig.json',
        fix: 'Add "baseUrl": "." to compilerOptions'
      });
    }
    
    // Check for paths
    if (!tsconfig.compilerOptions?.paths) {
      issues.push({
        type: 'warning',
        category: 'typescript',
        message: 'paths not configured in tsconfig.json',
        fix: 'Add paths configuration for absolute imports'
      });
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'typescript',
      message: `TypeScript config validation failed: ${error.message}`,
      fix: 'Check tsconfig.json file exists and is valid JSON'
    });
  }
  
  return issues;
}

/**
 * Validates Metro configuration
 */
export function validateMetroConfig(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check if metro.config.js exists
    const metroPath = path.join(process.cwd(), 'metro.config.js');
    if (!fs.existsSync(metroPath)) {
      issues.push({
        type: 'error',
        category: 'metro',
        message: 'metro.config.js not found',
        fix: 'Create metro.config.js with proper configuration'
      });
      return issues;
    }
    
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'metro',
      message: `Metro config validation failed: ${error.message}`,
      fix: 'Check metro.config.js file exists and is properly configured'
    });
  }
  
  return issues;
}

/**
 * Runs complete system validation
 */
export async function validateSystem(): Promise<ValidationResult> {
  console.log('🔍 Starting system validation...\n');
  
  const issues: ValidationIssue[] = [];
  const warnings: ValidationWarning[] = [];
  const recommendations: string[] = [];
  
  // Run all validations
  issues.push(...validateFirebaseConfig());
  issues.push(...validateStoreConfiguration());
  issues.push(...validateNavigation());
  issues.push(...validateErrorHandling());
  issues.push(...validateTypeScriptConfig());
  issues.push(...validateMetroConfig());
  
  // Generate recommendations
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  
  if (errorCount > 0) {
    recommendations.push('Fix all errors before running the app');
  }
  
  if (warningCount > 0) {
    recommendations.push('Address warnings to improve system stability');
  }
  
  if (errorCount === 0 && warningCount === 0) {
    recommendations.push('System looks healthy! Consider running tests');
  }
  
  const result: ValidationResult = {
    isValid: errorCount === 0,
    issues,
    warnings,
    recommendations
  };
  
  // Log results
  console.log(`📊 Validation Results:`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Warnings: ${warningCount}`);
  console.log(`   System Status: ${result.isValid ? '✅ Healthy' : '❌ Needs Attention'}\n`);
  
  if (issues.length > 0) {
    console.log('🚨 Issues Found:');
    issues.forEach(issue => {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} ${issue.category}: ${issue.message}`);
      if (issue.fix) {
        console.log(`      Fix: ${issue.fix}`);
      }
    });
    console.log('');
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Recommendations:');
    recommendations.forEach(rec => {
      console.log(`   • ${rec}`);
    });
    console.log('');
  }
  
  return result;
}





