# play-skeezers-v3

V3 of `play.skeezers.org`, designed as a Render-ready full-stack arcade, app, proxy, and emulator platform.

## Goals
- Interstellar-style UX with your own structure
- Real backend/proxy support
- Clean apps, games, proxy, and emulator lanes
- Render-friendly deployment
- Clean integration path for third-party GitHub repos without turning the codebase into a mess

## Current direction
This is the preferred foundation for the next generation of `play.skeezers.org`.

The current trial plan is:
- use V3 as the main product shell
- polish the UI and workspace flow
- bring in the apps and games you want from the Interstellar-style ecosystem
- test first on Render before deciding whether a home-server proxy runtime is needed for harder targets like `now.gg`

## Local development
```bash
npm install
npm run dev
```

Then open:
- `http://localhost:3000`
- health check: `http://localhost:3000/health`
- proxy status: `http://localhost:3000/api/proxy/status`

## Render deployment
This repo already includes `render.yaml` for a free-tier web-service trial.

Default service shape:
- runtime: Node
- build command: `npm install`
- start command: `npm start`
- health check: `/health`

Environment flags currently used:
- `V3_PASSWORD_ENABLED=false`
- `V3_PROXY_ENABLED=false`

## Status
Scaffolded architecture with working server, UI shell, lane APIs, and proxy session scaffolding. Real proxy runtime wiring and UI polish are the next major steps.
