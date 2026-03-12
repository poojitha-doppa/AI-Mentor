const fs = require('fs');
const path = require('path');

console.log('🔄 Copying shared header assets to all frontend apps...');

const sourceDir = __dirname;
const sharedFiles = ['shared-header.js', 'shared-auth.js'];

const targetDirs = [
  path.join(sourceDir, 'landing-page', 'public'),
  path.join(sourceDir, 'course-generation', 'public'),
  path.join(sourceDir, 'roadmap', 'public'),
  path.join(sourceDir, 'test-generation', 'public')
];

// Create public directories if they don't exist
targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Copy shared files to each target directory
sharedFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  if (fs.existsSync(sourcePath)) {
    targetDirs.forEach(targetDir => {
      const targetPath = path.join(targetDir, file);
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${file} to ${targetDir}`);
    });
  } else {
    console.log(`⚠️  Source file not found: ${sourcePath}`);
  }
});

console.log('\n✨ All shared assets copied successfully!');
