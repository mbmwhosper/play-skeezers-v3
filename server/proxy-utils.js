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
