#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path');
const { execSync } = require('child_process');

const scriptPath = path.join(__dirname, './docker-unlimited.sh');
const portConfig = process.argv.find((arg) => arg.startsWith('--port=')) ?? '--port=8000';
const port = portConfig.split('=')[1];

try {
  execSync(`sh ${scriptPath} ${port}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing script:', error);
  process.exit(1);
}
