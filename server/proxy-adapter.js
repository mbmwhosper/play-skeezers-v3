export class ProxyAdapter {
  constructor() {
    this.provider = 'planned';
    this.ready = false;
  }

  status() {
    return {
      provider: this.provider,
      ready: this.ready,
      message: 'Proxy adapter placeholder. Replace with real Interstellar-compatible runtime integration.'
    };
  }
}
