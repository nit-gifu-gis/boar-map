import assert from 'node:assert/strict';
import test from 'node:test';

import { decodeJwtPayload, isJwtExpired } from '../src/utils/jwt.ts';

const tokenFor = (payload: unknown) =>
  `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

test('JWT payload decoding accepts unpadded Base64URL and preserves UTF-8', () => {
  const payload = { exp: 2000, user: '日本語🦊', token: 'gis-token' };
  assert.deepEqual(decodeJwtPayload(tokenFor(payload)), payload);
});

test('malformed or non-object JWT payloads fail without throwing', () => {
  for (const token of ['', 'one.two', 'e30.%%%.sig', 'e30..sig', tokenFor(null), tokenFor([])]) {
    assert.equal(decodeJwtPayload(token), null);
  }
});

test('expiry includes the boundary and rejects missing or invalid expiry', () => {
  assert.equal(isJwtExpired({ exp: 1001 }, 1000), false);
  assert.equal(isJwtExpired({ exp: 1000 }, 1000), true);
  assert.equal(isJwtExpired({ exp: 999 }, 1000), true);
  for (const payload of [null, {}, { exp: '2000' }, { exp: NaN }, { exp: Infinity }]) {
    assert.equal(isJwtExpired(payload, 1000), true);
  }
});
