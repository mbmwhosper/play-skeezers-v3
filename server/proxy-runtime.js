import { loadProxyConfig } from './proxy-config.js';

export function createProxyRuntime() {
  const config = loadProxyConfig();
  return {
    ready: false,
    provider: config.provider,
    mountPath: config.proxyPath,
    upstream: config.upstream,
    message: config.enabled
      ? 'Runtime config is present. Real upstream proxy wiring is the next integration step.'
      : 'Proxy runtime adapter placeholder. Replace this with the real server-side integration during Interstellar-compatible wiring.'
  };
}
