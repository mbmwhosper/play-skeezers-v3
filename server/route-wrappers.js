const GAME_WRAPPERS = {
  '/games/slope': {
    kind: 'game',
    title: 'Slope',
    launchUrl: 'https://slopegame.com/',
    description: 'Fast-launch arcade wrapper with external-open fallback.'
  },
  '/games/sandboxels': {
    kind: 'game',
    title: 'Sandboxels',
    launchUrl: 'https://sandboxels.r74n.com/',
    description: 'Physics sandbox wrapper target, ready for local hosting later.'
  },
  '/games/ovo': {
    kind: 'game',
    title: 'OvO',
    launchUrl: 'https://ovo-game.com/',
    description: 'Precision platformer wrapper slot.'
  },
  '/games/bitlife': {
    kind: 'game',
    title: 'BitLife',
    launchUrl: 'https://bitlifeonline.github.io/',
    description: 'Long-session life sim wrapper target.'
  },
  '/games/retro-bowl': {
    kind: 'game',
    title: 'Retro Bowl',
    launchUrl: 'https://retro-bowl.me/',
    description: 'Sports wrapper target with quick-open support.'
  },
  '/games/minecraft-classic': {
    kind: 'game',
    title: 'Minecraft Classic',
    launchUrl: 'https://classic.minecraft.net/',
    description: 'Browser classic wrapper target.'
  }
};

const APP_WRAPPERS = {
  '/apps/cloud-launchers': {
    kind: 'app',
    title: 'Cloud Launchers',
    launchUrl: 'https://now.gg/',
    description: 'Custom app lane for cloud gaming launch surfaces like Now.gg and GeForce NOW.'
  },
  '/apps/import-manager': {
    kind: 'app',
    title: 'Import Manager',
    launchUrl: '',
    description: 'Admin wrapper for integration status, provenance, and future import tooling.'
  },
  '/apps/now-gg': {
    kind: 'app',
    title: 'Now.gg Launcher',
    launchUrl: 'https://now.gg/',
    description: 'Quick launcher wrapper for now.gg.'
  },
  '/apps/geforce-now': {
    kind: 'app',
    title: 'GeForce NOW Launcher',
    launchUrl: 'https://play.geforcenow.com/',
    description: 'Quick launcher wrapper for GeForce NOW.'
  },
  '/apps/inspect': {
    kind: 'app',
    title: 'Inspect Tool',
    launchUrl: '',
    description: 'Reserved utility wrapper for future power-user tooling.'
  }
};

const EMULATOR_WRAPPERS = {
  '/emulators/gb': {
    kind: 'emulator',
    title: 'Game Boy Lane',
    launchUrl: '',
    description: 'First emulator wrapper slot for a lightweight handheld lane.'
  }
};

export function getRouteWrapper(route) {
  return GAME_WRAPPERS[route] || APP_WRAPPERS[route] || EMULATOR_WRAPPERS[route] || null;
}

export function renderRouteWrapper(route) {
  const wrapper = getRouteWrapper(route);
  if (!wrapper) return null;

  const action = wrapper.launchUrl
    ? `<div class="lane-actions"><a href="${wrapper.launchUrl}" target="_blank" rel="noopener"><button>Open ${wrapper.kind}</button></a></div>`
    : '<div class="lane-actions"><button disabled>Coming soon</button></div>';

  return {
    status: 200,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${wrapper.title}</title>
  <style>
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #07111f; color: #edf4ff; }
    .shell { min-height: 100vh; display: grid; place-items: center; padding: 2rem; }
    .card { width: min(760px, 100%); border-radius: 24px; border: 1px solid rgba(120,164,255,.18); background: linear-gradient(180deg, rgba(18,35,61,.92), rgba(10,18,31,.95)); padding: 1.5rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: .08em; color: #77b2ff; font-size: .75rem; }
    .muted { color: #9fb3d9; }
    button { border: 1px solid rgba(120,164,255,.18); background: rgba(255,255,255,.03); color: #edf4ff; border-radius: 14px; padding: .8rem 1rem; }
    a { color: inherit; text-decoration: none; }
    .lane-actions { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: 1rem; }
  </style>
</head>
<body>
  <div class="shell">
    <div class="card">
      <p class="eyebrow">${wrapper.kind}</p>
      <h1>${wrapper.title}</h1>
      <p class="muted">${wrapper.description}</p>
      <p class="muted">Route: ${route}</p>
      ${action}
    </div>
  </div>
</body>
</html>`
  };
}
