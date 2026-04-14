# Render deploy notes for play-skeezers-v3

## Goal
Get V3 live quickly on Render so the shell, lanes, browser workspace, and proxy scaffolding can be tested under a real hosted app runtime.

## Current Render shape
The repo includes `render.yaml` with:
- service name: `play-skeezers-v3`
- runtime: Node
- plan: free
- build command: `npm install`
- start command: `npm start`
- health check: `/health`

## Recommended first deploy
Create a Render Web Service from the GitHub repo:
- repo: `mbmwhosper/play-skeezers-v3`
- branch: `main`
- runtime: Node
- plan: free

Use the defaults from `render.yaml`.

## Initial environment variables
- `PORT=3000`
- `V3_PASSWORD_ENABLED=false`
- `V3_PROXY_ENABLED=false`

Optional later:
- `V3_PASSWORD=true`
- `V3_PASSWORD_HINT=...`
- `V3_PROXY_PROVIDER=interstellar-compatible`
- `V3_PROXY_UPSTREAM=...`
- `V3_PROXY_PATH=/service/proxy`
- `V3_BARE_PATH=/service/bare`

## What to verify after first deploy
1. `/health` returns OK
2. `/api/config` returns catalog data
3. `/api/proxy/status` returns the scaffolded proxy state
4. the UI loads on the Render URL
5. route switching works
6. the browser workspace can create and reopen proxy sessions

## Important note
This first Render deploy is for the product shell and app runtime, not for promising full `now.gg` compatibility yet. Harder proxy targets may still require a stronger backend or a home-server runtime later.
