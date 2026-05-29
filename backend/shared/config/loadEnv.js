import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

export function loadEnv(baseDir = process.cwd()) {
  const envPath = resolve(baseDir, '.env');
  const examplePath = resolve(baseDir, '.env.example');

  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }

  if (existsSync(examplePath)) {
    dotenv.config({ path: examplePath, override: false });
  }
}
