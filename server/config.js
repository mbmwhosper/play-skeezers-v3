import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadInterstellarCatalog } from './interstellar-catalog.js';

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(here, '..');

function readJson(path) {
  return JSON.parse(readFileSync(resolve(rootDir, path), 'utf8'));
}

export function loadConfig() {
  return {
    games: readJson('catalog/games.json').items,
    apps: readJson('catalog/apps.json').items,
    proxy: readJson('catalog/proxy.json').items,
    themes: readJson('catalog/themes.json').themes,
    integrations: readJson('catalog/integrations.json').integrations,
    interstellar: loadInterstellarCatalog(),
    passwordProtection: false,
    passwordHint: '',
    proxyEnabled: process.env.V3_PROXY_ENABLED === 'true',
  };
}
