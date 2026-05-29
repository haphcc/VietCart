import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const isWindows = process.platform === 'win32';
const mysqlCmd = isWindows && existsSync('C:\\xampp\\mysql\\bin\\mysql.exe')
  ? 'C:\\xampp\\mysql\\bin\\mysql.exe'
  : 'mysql';

const result = spawnSync(mysqlCmd, [
  '--protocol=TCP',
  '-h',
  '127.0.0.1',
  '-P',
  '3306',
  '--default-character-set=utf8mb4',
  '-u',
  'root',
  '-e',
  'SOURCE database/init.sql;'
], {
  cwd: rootDir,
  encoding: 'utf8',
  shell: false
});

if (result.status !== 0) {
  console.error('[db:init] Could not initialize MySQL database.');
  console.error('[db:init] Start MySQL in XAMPP, then run npm run db:init again.');
  if (result.stderr) console.error(result.stderr.trim());
  process.exit(result.status || 1);
}

console.log('[db:init] Database has been reset and seeded from database/init.sql.');
