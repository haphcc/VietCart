import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const dockerCmd = isWindows ? 'docker.exe' : 'docker';

const children = [];

function spawnChild(name, command, args) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: isWindows
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  children.push(child);
}

function stopChild(child) {
  if (child.killed || !child.pid) return;

  if (isWindows) {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
      stdio: 'ignore',
      shell: false
    });
    return;
  }

  child.kill('SIGINT');
}

function shutdown() {
  for (const child of children) {
    stopChild(child);
  }

  spawn(dockerCmd, ['compose', 'down'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: isWindows
  }).on('exit', () => process.exit(0));
}

spawnChild('docker-compose', dockerCmd, ['compose', 'up', '--build']);
spawnChild('frontend', npmCmd, ['run', 'dev:frontend']);

console.log('[dev:scale] Started Docker backend and local frontend.');
console.log('[dev:scale] Backend: http://127.0.0.1:3000/');
console.log('[dev:scale] Frontend: http://127.0.0.1:5173/');
console.log('[dev:scale] Press Ctrl+C to stop frontend and Docker backend.');

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
