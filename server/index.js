import http from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';

const here = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(here, '..');
const port = Number(process.env.PORT || 3000);

const server = http.createServer(createApp(rootDir));

server.listen(port, () => {
  console.log(`play-skeezers-v3 listening on :${port}`);
});
