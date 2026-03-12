/**
 * Auto-configure Database Connection
 * This script will help you add the database connection URLs
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env.local');

console.log(`
╔════════════════════════════════════════════════════════════╗
║        Supabase Database Auto-Configuration                ║
╚════════════════════════════════════════════════════════════╝

Your Supabase project: ynyjhfldcjwsgfmhrbqy

To complete setup, you need your database password.

📍 How to get your password:
1. Go to: https://app.supabase.com/project/ynyjhfldcjwsgfmhrbqy/settings/database
2. Scroll to "Database Password"
3. Click "Reset Database Password" if you don't remember it
4. Copy the new password

`);

rl.question('Enter your database password: ', (password) => {
  if (!password || password.trim() === '') {
    console.error('\n❌ Password cannot be empty!');
    rl.close();
    process.exit(1);
  }

  // Construct connection URLs using the project ID
  const projectId = 'ynyjhfldcjwsgfmhrbqy';
  const region = 'ap-southeast-1'; // Default, may vary
  
  const databaseUrl = `postgresql://postgres.${projectId}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
  const directUrl = `postgresql://postgres.${projectId}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;

  // Read current .env.local
  let envContent = fs.readFileSync(envPath, 'utf-8');

  // Remove commented lines
  envContent = envContent.replace(/# DATABASE_URL=.*/g, '');
  envContent = envContent.replace(/# DIRECT_URL=.*/g, '');

  // Add new URLs
  if (!envContent.includes('DATABASE_URL=')) {
    envContent += `\nDATABASE_URL="${databaseUrl}"`;
  } else {
    envContent = envContent.replace(/DATABASE_URL=.*/g, `DATABASE_URL="${databaseUrl}"`);
  }

  if (!envContent.includes('DIRECT_URL=')) {
    envContent += `\nDIRECT_URL="${directUrl}"`;
  } else {
    envContent = envContent.replace(/DIRECT_URL=.*/g, `DIRECT_URL="${directUrl}"`);
  }

  // Write back
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Database URLs configured!');
  console.log('\n📋 Added to .env.local:');
  console.log(`   DATABASE_URL="${databaseUrl}"`);
  console.log(`   DIRECT_URL="${directUrl}"`);
  console.log('\n🚀 Next step: Run this command to create your database tables:');
  console.log('\n   npx prisma db push\n');

  rl.close();
});
