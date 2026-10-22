/**
 * CredentialRegistry — module-level singleton.
 * Stores issued credentials by credId so the /verify page can look them up
 * without requiring the student to be logged in (employer scans while student portal
 * may be on a different device).
 */

import type { CredentialPayload } from './StudentContext';

interface RegistryEntry {
  credential: CredentialPayload;
  revoked: boolean;
  revokedAt?: string;
}

// In a real system this would be a server-side lookup.
// Here it's a module-level Map that persists for the browser session.
const registry = new Map<string, RegistryEntry>();

/** Called when a credential is issued */
export function registerCredential(cred: CredentialPayload) {
  registry.set(cred.credId, { credential: cred, revoked: false });
}

/** Called when the student revokes */
export function revokeRegisteredCredential(credId: string) {
  const entry = registry.get(credId);
  if (entry) {
    registry.set(credId, { ...entry, revoked: true, revokedAt: new Date().toISOString() });
  }
}

/** Employer lookup — the /verify page calls this */
export type VerifyResult =
  | { status: 'VALID';    credential: CredentialPayload }
  | { status: 'REVOKED';  revokedAt: string }
  | { status: 'EXPIRED';  expiredAt: string }
  | { status: 'NOT_FOUND' };

export function lookupCredential(credId: string): VerifyResult {
  const entry = registry.get(credId);
  if (!entry) return { status: 'NOT_FOUND' };
  if (entry.revoked) return { status: 'REVOKED', revokedAt: entry.revokedAt ?? '' };
  const now = Math.floor(Date.now() / 1000);
  if (now > entry.credential.exp) {
    return { status: 'EXPIRED', expiredAt: new Date(entry.credential.exp * 1000).toISOString() };
  }
  return { status: 'VALID', credential: entry.credential };
}

/** Pre-seed a demo credential so /verify?token=DEMO works without generating one */
export function seedDemoCredential() {
  const now = Math.floor(Date.now() / 1000);
  const demo: CredentialPayload = {
    sub:     'STU-***-4821',
    iss:     'pramaan.aicte.gov.in',
    iat:     now,
    exp:     now + 300,   // 5 min for demo
    purpose: 'EMPLOYMENT',
    credId:  'DEMO',
    claims: {
      degree:      'B.Tech Computer Science & Engineering',
      institution: 'Shri Institute of Engineering & Technology, Mumbai',
      year:        '2026-27',
      status:      'ENROLLED',
    },
  };
  registry.set('DEMO', { credential: demo, revoked: false });
}

// Seed on module load
seedDemoCredential();
