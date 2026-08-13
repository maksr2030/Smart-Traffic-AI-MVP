function normalize(value) {
  if (value === null || typeof value !== 'object') {
    if (typeof value === 'number' && !Number.isFinite(value)) return String(value);
    return value;
  }
  if (Array.isArray(value)) return value.map(normalize);
  return Object.keys(value).sort().reduce((out, key) => {
    if (value[key] !== undefined) out[key] = normalize(value[key]);
    return out;
  }, {});
}

export function canonicalJson(value) {
  return JSON.stringify(normalize(value));
}

export async function sha256Fingerprint(value) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto SHA-256 is unavailable in this runtime');
  const bytes = new TextEncoder().encode(typeof value === 'string' ? value : canonicalJson(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function shortFingerprint(value, length = 12) {
  return String(value || '').slice(0, Math.max(4, Number(length) || 12));
}

export const auditHashEvidenceBoundary = Object.freeze({
  algorithm: 'SHA-256',
  cryptographicHash: true,
  digitalSignature: false,
  blockchainAnchored: false,
  nonRepudiation: false,
  productionAuditCertified: false
});
