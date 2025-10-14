#!/usr/bin/env node

/**
 * 🔄 AUTOMATIC IMPORT MIGRATION SCRIPT
 * Migrates relative imports to absolute imports automatically
 * Run with: node scripts/migrate-imports.js
 */

const fs = require('fs');
const path = require('path');

// Migration mappings
const mappings = {
  // Auth context to unified store
  "'../contexts/AuthContext'": "'@/store'",
  "'../../contexts/AuthContext'": "'@/store'",
  "'../../../contexts/AuthContext'": "'@/store'",
  '"../contexts/AuthContext"': '"@/store"',
  '"../../contexts/AuthContext"': '"@/store"',
  '"../../../contexts/AuthContext"': '"@/store"',
  
  // Family context to unified store
  "'../contexts/FamilyContext'": "'@/store'",
  "'../../contexts/FamilyContext'": "'@/store'",
  "'../../../contexts/FamilyContext'": "'@/store'",
  '"../contexts/FamilyContext"': '"@/store"',
  '"../../contexts/FamilyContext"': '"@/store"',
  '"../../../contexts/FamilyContext"': '"@/store"',
  
  // Settings context to unified store
  "'../contexts/SettingsContext'": "'@/store'",
  "'../../contexts/SettingsContext'": "'@/store'",
  "'../../../contexts/SettingsContext'": "'@/store'",
  '"../contexts/SettingsContext"': '"@/store"',
  '"../../contexts/SettingsContext"': '"@/store"',
  '"../../../contexts/SettingsContext"': '"@/store"',
  
  // Firebase config
  "'../config/firebase'": "'@/config/firebase'",
  "'../../config/firebase'": "'@/config/firebase'",
  "'../../../config/firebase'": "'@/config/firebase'",
  '"../config/firebase"': '"@/config/firebase"',
  '"../../config/firebase"': '"@/config/firebase"',
  '"../../../config/firebase"': '"@/config/firebase"',
  
  // Theme
  "'../styles/simpleTheme'": "'@/styles/simpleTheme'",
  "'../../styles/simpleTheme'": "'@/styles/simpleTheme'",
  "'../../../styles/simpleTheme'": "'@/styles/simpleTheme'",
  '"../styles/simpleTheme"': '"@/styles/simpleTheme"',
  '"../../styles/simpleTheme"': '"@/styles/simpleTheme"',
  '"../../../styles/simpleTheme"': '"@/styles/simpleTheme"',
};

// Function to migrate a single file
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply mappings
    Object.entries(mappings).forEach(([oldImport, newImport]) => {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
        modified = true;
      }
    });
    
    // Additional pattern replacements
    content = content.replace(
      /import\s*{\s*useAuth\s*}\s*from\s*['"]@\/store['"]/g,
      "import { useAuth } from '@/store'"
    );
    
    content = content.replace(
      /import\s*{\s*useFamily\s*}\s*from\s*['"]@\/store['"]/g,
      "import { useFamily } from '@/store'"
    );
    
    content = content.replace(
      /import\s*{\s*useSettings\s*}\s*from\s*['"]@\/store['"]/g,
      "import { useSettings } from '@/store'"
    );
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}:`, error.message);
    return false;
  }
}

// Function to find all TypeScript/JavaScript files
function findSourceFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

// Main migration function
function migrateProject() {
  console.log('🔄 Starting automatic import migration...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findSourceFiles(srcDir);
  
  let migratedCount = 0;
  let errorCount = 0;
  
  files.forEach(file => {
    try {
      if (migrateFile(file)) {
        migratedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
      errorCount++;
    }
  });
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files migrated: ${migratedCount}`);
  console.log(`   Errors: ${errorCount}`);
  
  if (migratedCount > 0) {
    console.log('\n✅ Migration completed! Please run the app to test.');
  } else {
    console.log('\n⚠️  No files needed migration.');
  }
}

// Run migration
if (require.main === module) {
  migrateProject();
}

module.exports = { migrateFile, migrateProject };
