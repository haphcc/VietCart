import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

export function loadEnv(baseDir = process.cwd()) {
  const candidates = [
    resolve(baseDir, '.env'),
    resolve(baseDir, '..', '.env'),
    resolve(baseDir, '..', '..', '.env')
  ];

  const exampleCandidates = [
    resolve(baseDir, '.env.example'),
    resolve(baseDir, '..', '.env.example'),
    resolve(baseDir, '..', '..', '.env.example')
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      dotenv.config({ path, override: false });
    }
  }

  for (const path of exampleCandidates) {
    if (existsSync(path)) {
      dotenv.config({ path, override: false });
    }
  }
}
