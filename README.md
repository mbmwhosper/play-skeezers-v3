# play-skeezers-v3

V3 of `play.skeezers.org`, designed as a Render-ready full-stack arcade, app, proxy, and emulator platform.

## Goals
- Interstellar-style UX with your own structure
- Real backend/proxy support
- Clean apps, games, proxy, and emulator lanes
- Render-friendly deployment
- Clean integration path for third-party GitHub repos without turning the codebase into a mess

## Current direction
This repo is the active foundation for the next generation of `play.skeezers.org`.

What now exists:
- customizable shell and theme system
- search, lane routing, and closable tabs
- persistent browser workspace sessions
- wrapper routes for games, apps, and emulator surfaces
- Render/Koyeb deploy configs

## Local development
```bash
npm install
npm run dev
```

Then open:
- `http://localhost:3000`
- health check: `http://localhost:3000/health`
- proxy status: `http://localhost:3000/api/proxy/status`

## Important routes
- `/proxy/view/:id` → dedicated proxy session view
- `/games/...` → game wrappers
- `/apps/...` → app wrappers
- `/emulators/gb` → first emulator wrapper lane

## Render deployment
This repo includes `render.yaml` for a web-service deployment.

Default service shape:
- runtime: Node
- build command: `npm install`
- start command: `npm start`
- health check: `/health`

Environment flags currently used:
- `V3_PASSWORD_ENABLED=false`
- `V3_PROXY_ENABLED=false`

## Status
The shell, route wrappers, and persistent proxy workspace are in place. Full upstream-grade proxy runtime compatibility for hard targets is still a future enhancement, but the product shell itself is now deployable and testable end to end.
