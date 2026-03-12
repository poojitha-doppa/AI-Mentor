#!/usr/bin/env node

/**
 * Database Setup Helper
 * This script helps set up your Supabase connection and deploy the schema
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

function updateEnv(databaseUrl, directUrl) {
  let envContent = fs.readFileSync(envPath, 'utf-8');
  
  // Update DATABASE_URL
  if (envContent.includes('DATABASE_URL=')) {
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL="${databaseUrl}"`
    );
  } else {
    envContent += `\nDATABASE_URL="${databaseUrl}"`;
  }
  
  // Update DIRECT_URL
  if (envContent.includes('DIRECT_URL=')) {
    envContent = envContent.replace(
      /DIRECT_URL=.*/,
      `DIRECT_URL="${directUrl}"`
    );
  } else {
    envContent += `\nDIRECT_URL="${directUrl}"`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local');
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║          Database Setup Helper                             ║
╚════════════════════════════════════════════════════════════╝

Ready to set up your Supabase database!

Usage:
  node scripts/setup-db.js <DATABASE_URL> <DIRECT_URL>

Example:
  node scripts/setup-db.js "postgresql://..." "postgresql://..."

After updating .env.local, run:
  npx prisma db push
`);

if (process.argv.length >= 4) {
  const databaseUrl = process.argv[2];
  const directUrl = process.argv[3];
  
  if (!databaseUrl.includes('postgresql') || !directUrl.includes('postgresql')) {
    console.error('❌ Invalid PostgreSQL URLs');
    process.exit(1);
  }
  
  updateEnv(databaseUrl, directUrl);
  console.log('\n✨ Run this command next:\n');
  console.log('   npx prisma db push\n');
}
