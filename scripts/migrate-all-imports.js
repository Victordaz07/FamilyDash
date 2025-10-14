/**
 * 🔄 COMPREHENSIVE IMPORT MIGRATION SCRIPT
 * Migrates ALL relative imports to absolute "@/" imports
 */

const fs = require('fs');
const path = require('path');

// Common mappings for relative imports
const relativePatterns = [
  // One level up
  { from: "'../components/", to: "'@/components/" },
  { from: '"../components/', to: '"@/components/' },
  { from: "'../screens/", to: "'@/screens/" },
  { from: '"../screens/', to: '"@/screens/' },
  { from: "'../services/", to: "'@/services/" },
  { from: '"../services/', to: '"@/services/' },
  { from: "'../hooks/", to: "'@/hooks/" },
  { from: '"../hooks/', to: '"@/hooks/' },
  { from: "'../contexts/", to: "'@/contexts/" },
  { from: '"../contexts/', to: '"@/contexts/' },
  { from: "'../utils/", to: "'@/utils/" },
  { from: '"../utils/', to: '"@/utils/' },
  { from: "'../types/", to: "'@/types/" },
  { from: '"../types/', to: '"@/types/' },
  { from: "'../modules/", to: "'@/modules/" },
  { from: '"../modules/', to: '"@/modules/' },
  { from: "'../store/", to: "'@/store/" },
  { from: '"../store/', to: '"@/store/' },
  { from: "'../state/", to: "'@/state/" },
  { from: '"../state/', to: '"@/state/' },
  { from: "'../styles/", to: "'@/styles/" },
  { from: '"../styles/', to: '"@/styles/' },
  { from: "'../locales/", to: "'@/locales/" },
  { from: '"../locales/', to: '"@/locales/' },
  { from: "'../navigation/", to: "'@/navigation/" },
  { from: '"../navigation/', to: '"@/navigation/' },
  { from: "'../data/", to: "'@/data/" },
  { from: '"../data/', to: '"@/data/' },
  { from: "'../config/", to: "'@/config/" },
  { from: '"../config/', to: '"@/config/' },
  
  // Two levels up
  { from: "'../../components/", to: "'@/components/" },
  { from: '"../../components/', to: '"@/components/' },
  { from: "'../../screens/", to: "'@/screens/" },
  { from: '"../../screens/', to: '"@/screens/' },
  { from: "'../../services/", to: "'@/services/" },
  { from: '"../../services/', to: '"@/services/' },
  { from: "'../../hooks/", to: "'@/hooks/" },
  { from: '"../../hooks/', to: '"@/hooks/' },
  { from: "'../../contexts/", to: "'@/contexts/" },
  { from: '"../../contexts/', to: '"@/contexts/' },
  { from: "'../../utils/", to: "'@/utils/" },
  { from: '"../../utils/', to: '"@/utils/' },
  { from: "'../../types/", to: "'@/types/" },
  { from: '"../../types/', to: '"@/types/' },
  { from: "'../../modules/", to: "'@/modules/" },
  { from: '"../../modules/', to: '"@/modules/' },
  { from: "'../../store/", to: "'@/store/" },
  { from: '"../../store/', to: '"@/store/' },
  { from: "'../../state/", to: "'@/state/" },
  { from: '"../../state/', to: '"@/state/' },
  { from: "'../../styles/", to: "'@/styles/" },
  { from: '"../../styles/', to: '"@/styles/' },
  { from: "'../../locales/", to: "'@/locales/" },
  { from: '"../../locales/', to: '"@/locales/' },
  { from: "'../../navigation/", to: "'@/navigation/" },
  { from: '"../../navigation/', to: '"@/navigation/' },
  { from: "'../../data/", to: "'@/data/" },
  { from: '"../../data/', to: '"@/data/' },
  { from: "'../../config/", to: "'@/config/" },
  { from: '"../../config/', to: '"@/config/' },
  
  // Three levels up
  { from: "'../../../components/", to: "'@/components/" },
  { from: '"../../../components/', to: '"@/components/' },
  { from: "'../../../screens/", to: "'@/screens/" },
  { from: '"../../../screens/', to: '"@/screens/' },
  { from: "'../../../services/", to: "'@/services/" },
  { from: '"../../../services/', to: '"@/services/' },
  { from: "'../../../hooks/", to: "'@/hooks/" },
  { from: '"../../../hooks/', to: '"@/hooks/' },
  { from: "'../../../contexts/", to: "'@/contexts/" },
  { from: '"../../../contexts/', to: '"@/contexts/' },
  { from: "'../../../utils/", to: "'@/utils/" },
  { from: '"../../../utils/', to: '"@/utils/' },
  { from: "'../../../types/", to: "'@/types/" },
  { from: '"../../../types/', to: '"@/types/' },
  { from: "'../../../modules/", to: "'@/modules/" },
  { from: '"../../../modules/', to: '"@/modules/' },
  { from: "'../../../store/", to: "'@/store/" },
  { from: '"../../../store/', to: '"@/store/' },
  { from: "'../../../state/", to: "'@/state/" },
  { from: '"../../../state/', to: '"@/state/' },
  { from: "'../../../styles/", to: "'@/styles/" },
  { from: '"../../../styles/', to: '"@/styles/' },
  { from: "'../../../locales/", to: "'@/locales/" },
  { from: '"../../../locales/', to: '"@/locales/' },
  { from: "'../../../navigation/", to: "'@/navigation/" },
  { from: '"../../../navigation/', to: '"@/navigation/' },
  { from: "'../../../data/", to: "'@/data/" },
  { from: '"../../../data/', to: '"@/data/' },
  { from: "'../../../config/", to: "'@/config/" },
  { from: '"../../../config/', to: '"@/config/' },
  
  // Four levels up (rare but exists)
  { from: "'../../../../services", to: "'@/services" },
  { from: '"../../../../services', to: '"@/services' },
  { from: "'../../../services", to: "'@/services" },
  { from: '"../../../services', to: '"@/services' },
  { from: "'../../../lib/", to: "'@/lib/" },
  { from: '"../../../lib/', to: '"@/lib/' },
  
  // Module-relative imports (within same module)
  { from: "'../mock/", to: "'@/modules/" },
  { from: '"../mock/', to: '"@/modules/' },
  { from: "'../store/", to: "'@/modules/" },
  { from: '"../store/', to: '"@/modules/' },
];

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    relativePatterns.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.split(from).join(to);
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Migrated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error migrating ${filePath}: ${error.message}`);
    return false;
  }
}

function scanAndMigrate(dir) {
  let filesProcessed = 0;
  let filesMigrated = 0;

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== '_graveyard') {
        const { processed, migrated } = scanAndMigrate(filePath);
        filesProcessed += processed;
        filesMigrated += migrated;
      } else if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
        filesProcessed++;
        if (migrateFile(filePath)) {
          filesMigrated++;
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning ${dir}: ${error.message}`);
  }

  return { processed: filesProcessed, migrated: filesMigrated };
}

console.log('🔄 Starting comprehensive import migration...\n');
const { processed, migrated } = scanAndMigrate(path.join(__dirname, '../src'));
console.log('\n📊 Migration Summary:');
console.log(`   Files processed: ${processed}`);
console.log(`   Files migrated: ${migrated}`);
console.log(`   Files unchanged: ${processed - migrated}`);
console.log('\n✅ Migration completed! Run "npm run lint" to verify.');
