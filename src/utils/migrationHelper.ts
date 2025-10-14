/**
 * 🔄 MIGRATION HELPER
 * Helps migrate from old relative imports to new absolute imports
 * This is a temporary utility to help with the migration process
 */

// Map of old relative imports to new absolute imports
export const importMappings = {
  // Auth related
  '@/contexts/AuthContext': '@/store',
  '@/contexts/AuthContext': '@/store',
  '@/contexts/AuthContext': '@/store',
  
  // Family related
  '@/contexts/FamilyContext': '@/store',
  '@/contexts/FamilyContext': '@/store',
  '@/contexts/FamilyContext': '@/store',
  
  // Settings related
  '@/contexts/SettingsContext': '@/store',
  '@/contexts/SettingsContext': '@/store',
  '@/contexts/SettingsContext': '@/store',
  
  // Role related
  '@/contexts/RoleContext': '@/store',
  '@/contexts/RoleContext': '@/store',
  '@/contexts/RoleContext': '@/store',
  
  // Firebase config
  '@/config/firebase': '@/config/firebase',
  '@/config/firebase': '@/config/firebase',
  '@/config/firebase': '@/config/firebase',
  
  // Theme
  '@/styles/simpleTheme': '@/styles/simpleTheme',
  '@/styles/simpleTheme': '@/styles/simpleTheme',
  '@/styles/simpleTheme': '@/styles/simpleTheme',
  
  // Components
  '@/components/ErrorBoundary': '@/components/ErrorBoundary',
  '@/components/ErrorBoundary': '@/components/ErrorBoundary',
  '@/components/ErrorBoundary': '@/components/ErrorBoundary',
};

// Function to check if an import needs migration
export const needsMigration = (importPath: string): boolean => {
  return importPath.includes('../') && !importPath.startsWith('@/');
};

// Function to get the new import path
export const getNewImportPath = (oldPath: string): string => {
  return importMappings[oldPath] || oldPath;
};

// Common migration patterns
export const migrationPatterns = [
  {
    from: /import.*from\s+['"](\.\.\/)+contexts\/AuthContext['"]/g,
    to: "import { useAuth } from '@/store'",
    description: "Migrate AuthContext to unified store"
  },
  {
    from: /import.*from\s+['"](\.\.\/)+contexts\/FamilyContext['"]/g,
    to: "import { useFamily } from '@/store'",
    description: "Migrate FamilyContext to unified store"
  },
  {
    from: /import.*from\s+['"](\.\.\/)+config\/firebase['"]/g,
    to: "import { auth, db } from '@/config/firebase'",
    description: "Migrate Firebase config imports"
  },
  {
    from: /import.*from\s+['"](\.\.\/)+styles\/simpleTheme['"]/g,
    to: "import { theme } from '@/styles/simpleTheme'",
    description: "Migrate theme imports"
  }
];

// Validation function to check for common issues
export const validateMigration = (fileContent: string): string[] => {
  const issues: string[] = [];
  
  // Check for remaining relative imports
  const relativeImports = fileContent.match(/import.*from\s+['"](\.\.\/)+/g);
  if (relativeImports) {
    issues.push(`Found ${relativeImports.length} relative imports that need migration`);
  }
  
  // Check for old context usage
  const oldContextUsage = fileContent.match(/useAuth\(\)|useFamily\(\)|useSettings\(\)/g);
  if (oldContextUsage && fileContent.includes('contexts/')) {
    issues.push('Found old context usage - should use unified store');
  }
  
  // Check for circular dependencies
  const circularDeps = fileContent.match(/import.*from\s+['"]\.\.['"]/g);
  if (circularDeps) {
    issues.push('Found potential circular dependency');
  }
  
  return issues;
};

// Function to generate migration report
export const generateMigrationReport = (files: string[]): any => {
  const report = {
    totalFiles: files.length,
    needsMigration: 0,
    migrated: 0,
    issues: [] as string[]
  };
  
  files.forEach(file => {
    // This would be implemented to analyze each file
    // For now, it's a placeholder
  });
  
  return report;
};
