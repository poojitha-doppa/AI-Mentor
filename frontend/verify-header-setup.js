#!/usr/bin/env node

/**
 * Header Cleanup Verification Script
 * Verifies that all modules have proper header configuration
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend');
const modules = {
  'landing-page': { path: path.join(baseDir, 'landing-page'), files: ['index.html'] },
  'course-generation': { path: path.join(baseDir, 'course-generation'), files: ['app/layout.tsx'] },
  'roadmap': { path: path.join(baseDir, 'roadmap'), files: ['index.html', 'public/shared-header.js'] },
  'test-generation': { path: path.join(baseDir, 'test-generation'), files: ['public/index.html', 'public/shared-header.js'] }
};

console.log('\n🔍 HEADER SYSTEM VERIFICATION\n');
console.log('=' .repeat(60));

let allGood = true;

Object.entries(modules).forEach(([name, config]) => {
  console.log(`\n📦 ${name.toUpperCase()}`);
  console.log('-'.repeat(60));
  
  config.files.forEach(file => {
    const filePath = path.join(config.path, file);
    const exists = fs.existsSync(filePath);
    
    if (file.includes('.html') || file.includes('.tsx')) {
      if (exists) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasSharedHeader = content.includes('shared-header.js');
        const hasDuplicateHeader = content.includes('<header') && content.includes('Header') && file.includes('html');
        
        console.log(`✅ ${file}`);
        if (hasSharedHeader) {
          console.log(`   ✓ Loads shared-header.js`);
        } else {
          console.log(`   ⚠️  Missing shared-header.js`);
          allGood = false;
        }
        
        if (hasDuplicateHeader && file.includes('html')) {
          console.log(`   ❌ Has duplicate header HTML`);
          allGood = false;
        }
      } else {
        console.log(`❌ ${file} - NOT FOUND`);
        allGood = false;
      }
    } else if (file.includes('shared-header.js')) {
      if (exists) {
        console.log(`✅ ${file} - Shared asset copied`);
      } else {
        console.log(`❌ ${file} - NOT COPIED`);
        allGood = false;
      }
    }
  });
});

console.log('\n' + '='.repeat(60));
console.log('\n📊 VERIFICATION SUMMARY\n');

if (allGood) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\n✨ Your header system is properly configured:');
  console.log('  • Shared header loaded in all modules');
  console.log('  • No duplicate headers detected');
  console.log('  • All shared assets distributed');
  console.log('\n🚀 Ready to start the application!');
} else {
  console.log('⚠️  SOME ISSUES DETECTED');
  console.log('\nPlease check the items marked with ❌ or ⚠️');
}

console.log('\n' + '='.repeat(60) + '\n');
