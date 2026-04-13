export function loadProxyConfig() {
  return {
    enabled: process.env.V3_PROXY_ENABLED === 'true',
    provider: process.env.V3_PROXY_PROVIDER || 'planned',
    upstream: process.env.V3_PROXY_UPSTREAM || '',
    barePath: process.env.V3_PROXY_BARE_PATH || '/service/bare',
    proxyPath: process.env.V3_PROXY_PATH || '/service/proxy'
  };
}
