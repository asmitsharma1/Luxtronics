import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const tsxCli = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const entryFile = path.join(rootDir, 'backend', 'server', 'index.ts');

console.log('🚀 Luxtronics server.js bootstrap');
console.log('📁 Root directory:', rootDir);
console.log('📄 Entry file:', entryFile);
console.log('🔧 Node version:', process.version);
console.log('🌍 PORT:', process.env.PORT || '(default)');
console.log('🧪 MONGODB_URI set:', !!process.env.MONGODB_URI);

const child = spawn(process.execPath, [tsxCli, entryFile], {
  stdio: ['inherit', 'inherit', 'inherit'],
  env: process.env,
});

child.on('error', (error) => {
  console.error('❌ Failed to launch backend process:', error);
});

child.on('exit', (code, signal) => {
  console.log('🧾 Backend process exited', { code, signal });

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception in server.js wrapper:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection in server.js wrapper:', reason);
});