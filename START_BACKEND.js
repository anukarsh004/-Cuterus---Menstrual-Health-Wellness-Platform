#!/usr/bin/env node

/**
 * Cuterus Backend Startup Script
 * Run: node START_BACKEND.js
 */

const { spawn } = require('child_process');
const path = require('path');

console.log(`
╔════════════════════════════════════════╗
║     CUTERUS BACKEND STARTUP SCRIPT     ║
╚════════════════════════════════════════╝

Starting backend server...
Port: 5000
API: http://localhost:5000

`);

const backendPath = path.join(__dirname, 'backend');

// Start backend
const backend = spawn('npm', ['start'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
});

backend.on('error', (error) => {
  console.error('❌ Failed to start backend:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`\nBackend process exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down backend...');
  backend.kill('SIGINT');
  process.exit(0);
});
