import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const integrations = JSON.parse(readFileSync(resolve(root, 'catalog/integrations.json'), 'utf8'));

for (const item of integrations.integrations || []) {
  console.log(`${item.type}\t${item.status}\t${item.title}\t${item.source}`);
}
