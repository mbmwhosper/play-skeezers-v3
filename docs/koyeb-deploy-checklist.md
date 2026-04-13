# Koyeb deploy checklist for play-skeezers-v3

## Service type
- Web service

## Runtime
- Dockerfile deploy

## Health check
- `/health`

## Port
- `3000`

## Required env vars
- `PORT=3000`
- `V3_PASSWORD_ENABLED=false`
- `V3_PROXY_ENABLED=false`

## First deploy goal
Get the V3 shell reachable publicly on Koyeb before wiring the real proxy runtime.

## After first successful deploy
- enable password gate if wanted
- begin real proxy runtime integration
- connect custom domain later
