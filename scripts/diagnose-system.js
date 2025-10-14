#!/usr/bin/env node

/**
 * 🔍 SYSTEM DIAGNOSTIC SCRIPT
 * Comprehensive system health check and problem detection
 * Run with: node scripts/diagnose-system.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SystemDiagnostic {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.recommendations = [];
    this.projectRoot = path.join(__dirname, '..');
  }

  log(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      check: '🔍'
    };
    console.log(`${icons[type]} ${message}`);
  }

  checkFileExists(filePath, description) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (fs.existsSync(fullPath)) {
      this.log(`${description} exists`, 'success');
      return true;
    } else {
      this.log(`${description} missing: ${filePath}`, 'error');
      this.issues.push({
        type: 'error',
        file: filePath,
        message: `${description} not found`,
        fix: `Create ${filePath} with proper configuration`
      });
      return false;
    }
  }

  checkFileContent(filePath, patterns, description) {
    const fullPath = path.join(this.projectRoot, filePath);
    if (!fs.existsSync(fullPath)) {
      this.log(`${description} file not found: ${filePath}`, 'error');
      return false;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      let hasIssues = false;

      patterns.forEach(pattern => {
        if (pattern.required && !pattern.regex.test(content)) {
          this.log(`${description}: Missing ${pattern.name}`, 'error');
          this.issues.push({
            type: 'error',
            file: filePath,
            message: `Missing ${pattern.name}`,
            fix: pattern.fix
          });
          hasIssues = true;
        } else if (pattern.forbidden && pattern.regex.test(content)) {
          this.log(`${description}: Found ${pattern.name}`, 'warning');
          this.warnings.push({
            type: 'warning',
            file: filePath,
            message: `Found ${pattern.name}`,
            fix: pattern.fix
          });
          hasIssues = true;
        }
      });

      if (!hasIssues) {
        this.log(`${description} content looks good`, 'success');
      }

      return !hasIssues;
    } catch (error) {
      this.log(`${description} read error: ${error.message}`, 'error');
      return false;
    }
  }

  checkDependencies() {
    this.log('Checking dependencies...', 'check');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.log('package.json not found', 'error');
      return false;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = [
        'expo',
        'react',
        'react-native',
        'firebase',
        'zustand',
        '@react-navigation/native',
        '@react-navigation/stack'
      ];

      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );

      if (missingDeps.length > 0) {
        this.log(`Missing dependencies: ${missingDeps.join(', ')}`, 'error');
        this.issues.push({
          type: 'error',
          message: 'Missing required dependencies',
          fix: `npm install ${missingDeps.join(' ')}`
        });
        return false;
      }

      this.log('All required dependencies found', 'success');
      return true;
    } catch (error) {
      this.log(`package.json parse error: ${error.message}`, 'error');
      return false;
    }
  }

  checkFirebaseConfig() {
    this.log('Checking Firebase configuration...', 'check');
    
    const firebaseConfigPath = 'src/config/firebase.ts';
    const patterns = [
      {
        name: 'Firebase configuration object',
        required: true,
        regex: /const firebaseConfig = \{/,
        fix: 'Add Firebase configuration object'
      },
      {
        name: 'API Key',
        required: true,
        regex: /apiKey:/,
        fix: 'Add Firebase API key'
      },
      {
        name: 'Project ID',
        required: true,
        regex: /projectId:/,
        fix: 'Add Firebase project ID'
      },
      {
        name: 'placeholder values',
        forbidden: true,
        regex: /xxxxx|placeholder/,
        fix: 'Replace placeholder values with real Firebase config'
      }
    ];

    return this.checkFileContent(firebaseConfigPath, patterns, 'Firebase config');
  }

  checkStoreConfiguration() {
    this.log('Checking store configuration...', 'check');
    
    const storePath = 'src/store/index.ts';
    const patterns = [
      {
        name: 'unified store',
        required: true,
        regex: /export const useAppStore/,
        fix: 'Create unified Zustand store'
      },
      {
        name: 'store slices',
        required: true,
        regex: /createAuthSlice|createFamilySlice/,
        fix: 'Add store slices for different modules'
      }
    ];

    return this.checkFileContent(storePath, patterns, 'Store config');
  }

  checkTypeScriptConfig() {
    this.log('Checking TypeScript configuration...', 'check');
    
    const tsconfigPath = 'tsconfig.json';
    const patterns = [
      {
        name: 'baseUrl',
        required: true,
        regex: /"baseUrl"/,
        fix: 'Add baseUrl to tsconfig.json'
      },
      {
        name: 'paths configuration',
        required: true,
        regex: /"paths"/,
        fix: 'Add paths configuration for absolute imports'
      }
    ];

    return this.checkFileContent(tsconfigPath, patterns, 'TypeScript config');
  }

  checkMetroConfig() {
    this.log('Checking Metro configuration...', 'check');
    
    const metroPath = 'metro.config.js';
    const patterns = [
      {
        name: 'alias configuration',
        required: true,
        regex: /alias:/,
        fix: 'Add alias configuration to metro.config.js'
      },
      {
        name: 'extraNodeModules',
        required: true,
        regex: /extraNodeModules:/,
        fix: 'Add extraNodeModules configuration'
      }
    ];

    return this.checkFileContent(metroPath, patterns, 'Metro config');
  }

  checkAppStructure() {
    this.log('Checking app structure...', 'check');
    
    const criticalFiles = [
      { path: 'App.tsx', description: 'Main app file' },
      { path: 'src/navigation/ConditionalNavigator.tsx', description: 'Conditional navigator' },
      { path: 'src/components/ErrorBoundary.tsx', description: 'Error boundary' },
      { path: 'src/utils/lazyLoading.ts', description: 'Lazy loading utility' }
    ];

    let allExist = true;
    criticalFiles.forEach(file => {
      if (!this.checkFileExists(file.path, file.description)) {
        allExist = false;
      }
    });

    return allExist;
  }

  checkImportIssues() {
    this.log('Checking for import issues...', 'check');
    
    const srcDir = path.join(this.projectRoot, 'src');
    if (!fs.existsSync(srcDir)) {
      this.log('src directory not found', 'error');
      return false;
    }

    let relativeImportCount = 0;
    let oldContextUsage = 0;

    function scanDirectory(dir) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Count relative imports
            const relativeImports = content.match(/import.*from\s+['"](\.\.\/)+/g);
            if (relativeImports) {
              relativeImportCount += relativeImports.length;
            }
            
            // Count old context usage
            const oldContexts = content.match(/useAuth\(\)|useFamily\(\)|useSettings\(\)/g);
            if (oldContexts && content.includes('contexts/')) {
              oldContextUsage += oldContexts.length;
            }
          } catch (error) {
            // Skip files that can't be read
          }
        }
      });
    }

    scanDirectory(srcDir);

    if (relativeImportCount > 0) {
      this.log(`Found ${relativeImportCount} relative imports`, 'warning');
      this.warnings.push({
        type: 'warning',
        message: `${relativeImportCount} relative imports found`,
        fix: 'Run migration script: node scripts/migrate-imports.js'
      });
    }

    if (oldContextUsage > 0) {
      this.log(`Found ${oldContextUsage} old context usages`, 'warning');
      this.warnings.push({
        type: 'warning',
        message: `${oldContextUsage} old context usages found`,
        fix: 'Migrate to unified store'
      });
    }

    if (relativeImportCount === 0 && oldContextUsage === 0) {
      this.log('No import issues found', 'success');
      return true;
    }

    return false;
  }

  generateReport() {
    this.log('\n📊 DIAGNOSTIC REPORT', 'check');
    this.log('=' * 50);
    
    const errorCount = this.issues.filter(i => i.type === 'error').length;
    const warningCount = this.warnings.length;
    
    this.log(`Errors: ${errorCount}`);
    this.log(`Warnings: ${warningCount}`);
    this.log(`Overall Status: ${errorCount === 0 ? '✅ Healthy' : '❌ Needs Attention'}\n`);
    
    if (this.issues.length > 0) {
      this.log('🚨 CRITICAL ISSUES:');
      this.issues.forEach(issue => {
        this.log(`   ${issue.file || 'General'}: ${issue.message}`, 'error');
        if (issue.fix) {
          this.log(`      Fix: ${issue.fix}`, 'info');
        }
      });
      this.log('');
    }
    
    if (this.warnings.length > 0) {
      this.log('⚠️  WARNINGS:');
      this.warnings.forEach(warning => {
        this.log(`   ${warning.file || 'General'}: ${warning.message}`, 'warning');
        if (warning.fix) {
          this.log(`      Fix: ${warning.fix}`, 'info');
        }
      });
      this.log('');
    }
    
    if (errorCount === 0 && warningCount === 0) {
      this.log('🎉 System looks healthy! No issues found.', 'success');
    } else {
      this.log('💡 RECOMMENDATIONS:', 'info');
      this.log('   1. Fix all errors before running the app');
      this.log('   2. Address warnings to improve stability');
      this.log('   3. Run tests after fixes');
      this.log('   4. Consider running: node scripts/migrate-imports.js');
    }
  }

  async run() {
    this.log('🔍 Starting comprehensive system diagnostic...\n');
    
    // Run all checks
    this.checkDependencies();
    this.checkFirebaseConfig();
    this.checkStoreConfiguration();
    this.checkTypeScriptConfig();
    this.checkMetroConfig();
    this.checkAppStructure();
    this.checkImportIssues();
    
    // Generate report
    this.generateReport();
    
    return {
      issues: this.issues,
      warnings: this.warnings,
      isHealthy: this.issues.filter(i => i.type === 'error').length === 0
    };
  }
}

// Run diagnostic if called directly
if (require.main === module) {
  const diagnostic = new SystemDiagnostic();
  diagnostic.run().catch(console.error);
}

module.exports = SystemDiagnostic;
