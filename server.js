import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const tsxCli = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const entryFile = path.join(rootDir, 'backend', 'server', 'index.ts');

const child = spawn(process.execPath, [tsxCli, entryFile], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});