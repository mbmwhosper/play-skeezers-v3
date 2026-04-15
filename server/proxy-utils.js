export function normalizeTargetUrl(value = '') {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isAllowedTarget(value = '') {
  try {
    const url = new URL(normalizeTargetUrl(value));
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function getTargetMeta(value = '') {
  try {
    const url = new URL(normalizeTargetUrl(value));
    const hostname = url.hostname.replace(/^www\./, '');
    const blockedByIframe = [
      'now.gg',
      'play.geforcenow.com',
      'xbox.com',
      'youtube.com'
    ].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

    return {
      hostname,
      protocol: url.protocol,
      blockedByIframe,
      recommendedMode: blockedByIframe ? 'external-tab' : 'embedded-preview'
    };
  } catch {
    return {
      hostname: '',
      protocol: '',
      blockedByIframe: false,
      recommendedMode: 'embedded-preview'
    };
  }
}
