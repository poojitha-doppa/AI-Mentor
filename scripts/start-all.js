#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = os.platform() === 'win32';
const projectRoot = path.join(__dirname, '..');

// Start all services in background but DON'T auto-open them
const modules = [
  {
    name: '🏠 Landing Page',
    path: 'frontend/landing-page',
    command: isWindows ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    delay: 0,
    port: 'http://localhost:4173',
    autoStart: true
  },
  {
    name: '📚 Course Generation',
    path: 'frontend/course-generation',
    command: isWindows ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    delay: 1000,
    port: 'http://localhost:3005',
    autoStart: false
  },
  {
    name: '🗺️  Roadmap Module',
    path: 'frontend/roadmap',
    command: isWindows ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    delay: 2000,
    port: 'http://localhost:5173',
    autoStart: false
  },
  {
    name: '✏️  Test Generation',
    path: 'frontend/test-generation',
    command: isWindows ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    delay: 3000,
    port: 'http://localhost:3000',
    autoStart: false
  },
  {
    name: '⚙️  Main Backend',
    path: 'backend/main-app',
    command: isWindows ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    delay: 4000,
    port: 'http://localhost:3000',
    autoStart: false
  }
];

const processes = [];

console.clear();
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║  🚀 PROJECT EXPO - ALL SERVICES RUNNING (NO AUTO-OPEN)    ║');
console.log('║     Click buttons on Landing Page to open modules          ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\n');

console.log('📋 Startup Queue (Background Services):');
modules.forEach((module, index) => {
  console.log(`   ${index + 1}. ${module.name} (starts in ${module.delay / 1000}s) - Auto-Open: ${module.autoStart ? 'YES' : 'NO'}`);
});

console.log('\n' + '═'.repeat(62) + '\n');

modules.forEach((module, index) => {
  setTimeout(() => {
    const modulePath = path.join(projectRoot, module.path);

    console.log(`\n▶️  [${index + 1}/${modules.length}] Starting ${module.name}`);
    console.log(`    📁 Path: ${module.path}`);
    console.log(`    🌐 Access: ${module.port}`);

    const proc = spawn(module.command, module.args, {
      cwd: modulePath,
      stdio: 'inherit',
      shell: isWindows ? true : false,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
        TERM: 'xterm-256color'
      }
    });

    proc.on('error', (err) => {
      console.error(`\n❌ Error starting ${module.name}:`, err.message);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`\n⚠️  ${module.name} exited with code ${code}`);
      }
    });

    processes.push({ name: module.name, process: proc });
  }, module.delay);
});

console.log('⏳ All services launching with staggered startup for stability...\n');

setTimeout(() => {
  console.log('\n' + '═'.repeat(62));
  console.log('\n✅ All Services Running in Background!\n');
  modules.forEach((module) => {
    const status = module.autoStart ? '(Opening in browser)' : '(Click from home page)';
    console.log(`   ${module.name.padEnd(25)} → ${module.port} ${status}`);
  });
  console.log('\n' + '═'.repeat(62));
  console.log('\n🌐 Primary Access Point:');
  console.log('   🏠 Landing Page: http://localhost:4173');
  console.log('\n💡 Tips:');
  console.log('   • Click buttons/links on Landing Page to open modules');
  console.log('   • Modules run in background (no auto-open except landing page)');
  console.log('   • All services available once started');
  console.log('   • Press Ctrl+C to shut down all services\n');
}, 2000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n' + '═'.repeat(62));
  console.log('🛑 Shutting down all services gracefully...\n');

  processes.forEach(({ name, process: proc }) => {
    console.log(`   • Stopping ${name}...`);
    proc.kill('SIGTERM');
  });

  setTimeout(() => {
    console.log('\n✅ All services stopped.\n');
    process.exit(0);
  }, 2000);
});
