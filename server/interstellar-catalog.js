import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8'));
}

export function loadInterstellarCatalog() {
  return {
    apps: readJson('catalog/interstellar-apps.json').items,
    games: readJson('catalog/interstellar-games.json').items,
    features: readJson('catalog/interstellar-features.json').items,
  };
}
