# Render Deploy Checklist

## Before deploy
- [ ] Repo is pushed to `main`
- [ ] `render.yaml` matches desired service settings
- [ ] `npm install` succeeds locally
- [ ] local server starts with `npm start`
- [ ] `/health` returns OK
- [ ] `/api/config` returns catalog payload
- [ ] `/api/proxy/status` returns runtime status payload

## After deploy
- [ ] Root page loads
- [ ] Home, Games, Apps, Proxy, Emulators, Settings all switch correctly
- [ ] Browser Workspace creates a saved session
- [ ] `/proxy/view/:id` opens a session view
- [ ] At least one game wrapper route opens
- [ ] Emulator wrapper route opens

## Known limitation
Iframe-hostile targets like now.gg or GeForce NOW may require direct-open fallback even when tracked inside the workspace shell.
