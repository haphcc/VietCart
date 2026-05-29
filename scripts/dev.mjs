import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const services = [
  ['api-gateway', 'dev:api-gateway', 3000],
  ['product-service', 'dev:product-service', 3001],
  ['cart-service', 'dev:cart-service', 3002],
  ['order-service', 'dev:order-service', 3003],
  ['payment-service', 'dev:payment-service', 3004],
  ['notification-service', 'dev:notification-service', 3005],
  ['user-service', 'dev:user-service', 3006],
  ['frontend', 'dev:frontend', 5173]
];

function isPortFree(port) {
  return new Promise((resolvePort) => {
    const server = net.createServer();
    server.once('error', () => resolvePort(false));
    server.once('listening', () => {
      server.close(() => resolvePort(true));
    });
    server.listen(port);
  });
}

async function assertPortsAreFree() {
  const busyServices = [];

  for (const [name, _script, port] of services) {
    if (!(await isPortFree(port))) {
      busyServices.push(`${name}:${port}`);
    }
  }

  if (busyServices.length > 0) {
    console.error(`[dev] These ports are already in use: ${busyServices.join(', ')}`);
    console.error('[dev] Stop old dev servers first, then run npm run dev again.');
    process.exit(1);
  }
}

await assertPortsAreFree();

const children = services.map(([name, script]) => {
  const child = spawn(npmCmd, ['run', script], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  return child;
});

console.log('[dev] Started frontend and backend services.');
console.log('[dev] Open http://127.0.0.1:5173/');
console.log('[dev] Press Ctrl+C to stop all services.');

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
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
