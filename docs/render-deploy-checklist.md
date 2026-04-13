# Render deploy checklist for play-skeezers-v3

## Connect repo
- repo: `mbmwhosper/play-skeezers-v3`
- branch: `main`

## Service settings
- type: Web Service
- runtime: Node
- plan: Free
- build command: `npm install`
- start command: `npm start`
- health check path: `/health`

## Environment variables
- `PORT=3000`
- `V3_PASSWORD_ENABLED=false`
- `V3_PROXY_ENABLED=false`

## First deploy goal
- get the V3 shell online successfully
- verify `/health`
- verify the UI loads
- then continue backend/proxy integration
