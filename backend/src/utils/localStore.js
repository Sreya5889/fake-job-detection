import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../.data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }
}

export function readLocalJson(fileName, defaultValue) {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export function writeLocalJson(fileName, data) {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}
