export function checkPasswordGate(req) {
  const enabled = process.env.V3_PASSWORD_ENABLED === 'true';
  const password = process.env.V3_PASSWORD || '';
  if (!enabled) return { ok: true };

  const header = req.headers['x-v3-password'];
  if (header && header === password) return { ok: true };
  return { ok: false, status: 401, body: { error: 'Password required' } };
}
