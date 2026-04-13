export function proxyStatus() {
  return {
    ready: false,
    mode: 'planned',
    message: 'Proxy backend integration target is prepared, but the real Interstellar-compatible server runtime is not wired yet.',
    nextStep: 'Integrate server-side proxy runtime and upstream routing on Koyeb.'
  };
}
