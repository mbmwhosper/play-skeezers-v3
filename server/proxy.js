import { loadProxyConfig } from './proxy-config.js';

export function proxyStatus() {
  const config = loadProxyConfig();
  return {
    ready: false,
    mode: config.enabled ? 'configured-not-wired' : 'planned',
    message: config.enabled
      ? 'Proxy env is configured, but the real runtime adapter is not wired yet.'
      : 'Proxy backend integration target is prepared, but the real Interstellar-compatible server runtime is not wired yet.',
    nextStep: 'Integrate server-side proxy runtime and upstream routing on Render.',
    config,
  };
}
