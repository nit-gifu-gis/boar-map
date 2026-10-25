// Decode only: token signatures are still verified by /Auth/VerifyToken.
export const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || !parts[1]) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
    const decoded: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded)) return null;
    return decoded as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const isJwtExpired = (
  payload: Record<string, unknown> | null,
  now = Math.floor(Date.now() / 1000),
) => {
  const expires = payload?.exp;
  return typeof expires !== 'number' || !Number.isFinite(expires) || expires <= now;
};
