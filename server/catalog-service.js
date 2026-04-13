import { loadConfig } from './config.js';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

export function getCatalog() {
  return loadConfig();
}

export function getLane(route) {
  const config = loadConfig();
  if (route === 'games') return config.games;
  if (route === 'apps') return config.apps;
  if (route === 'proxy') return config.proxy;
  if (route === 'emulators') return config.integrations.filter((item) => item.type === 'emulator');
  if (route === 'integrations') return config.integrations;
  if (route === 'featured') {
    const featured = readJson('catalog/featured.json').sections;
    const byId = new Map([...config.games, ...config.apps, ...config.proxy].map((item) => [item.id, item]));
    return featured.map((section) => ({
      ...section,
      items: (section.items || []).map((id) => byId.get(id)).filter(Boolean)
    }));
  }
  return [];
}
