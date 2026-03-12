// Orchestrates all modules with one command: npm run developer
// Starts: landing (4173), course (3000), roadmap (5173), skill backend (5000), skill frontend (3001)
// Uses child_process to avoid shell-quoting issues on Windows paths with spaces.

const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;

const processes = [
  {
    name: 'landing',
    cwd: root,
    cmd: 'npm',
    args: ['run', 'start:landing'],
  },
  {
    name: 'course',
    cwd: path.join(root, '..', 'course generation', 'frontend'),
    cmd: 'npm',
    args: ['run', 'dev', '--', '--port', '3000'],
  },
  {
    name: 'roadmap',
    cwd: path.join(root, '..', 'roadmap_module'),
    cmd: 'npm',
    args: ['run', 'dev', '--', '--host', '--port', '5173'],
  },
  {
    name: 'skill-backend',
    cwd: path.join(root, '..', 'test generation', 'backend'),
    cmd: 'npm',
    args: ['start'],
  },
  {
    name: 'skill-frontend',
    cwd: path.join(root, '..', 'test generation'),
    cmd: 'node',
    args: ['serve.js'],
    env: { PORT: '3001' },
  },
];

const running = new Map();

function start(proc) {
  const child = spawn(proc.cmd, proc.args, {
    cwd: proc.cwd,
    env: { ...process.env, ...(proc.env || {}) },
    stdio: 'pipe',
    shell: false,
  });

  running.set(proc.name, child);

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${proc.name}] ${data}`);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${proc.name}][err] ${data}`);
  });

  child.on('exit', (code) => {
    console.error(`[${proc.name}] exited with code ${code}`);
  });
}

function ensureDependencies() {
  // Soft check: if node_modules missing in a module, nudge the user to run bootstrap
  const missing = processes
    .filter(p => p.name !== 'landing')
    .filter(p => {
      const nm = path.join(p.cwd, 'node_modules');
      try {
        require('fs').accessSync(nm);
        return false;
      } catch (e) {
        return true;
      }
    });

  if (missing.length) {
    console.log('\nSome modules appear to be missing node_modules. Run:');
    console.log('  npm run bootstrap');
    console.log('Then re-run:');
    console.log('  npm run developer\n');
  }
}

ensureDependencies();
processes.forEach(start);

process.on('SIGINT', () => {
  console.log('\nShutting down all processes...');
  running.forEach((child) => {
    if (child && !child.killed) {
      child.kill('SIGINT');
    }
  });
  setTimeout(() => process.exit(0), 500);
});
