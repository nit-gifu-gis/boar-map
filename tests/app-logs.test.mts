import assert from 'node:assert/strict';
import test from 'node:test';

import { captureConsole } from '../src/utils/app-logs.ts';

import type { CapturedLog } from '../src/utils/app-logs.ts';

test('console capture survives the Strict Mode setup/cleanup/setup cycle once per message', async (t) => {
  const original = t.mock.method(console, 'log', () => undefined);
  const abandonedLogs: CapturedLog[] = [];
  const logs: CapturedLog[] = [];

  const firstCleanup = captureConsole((entry) => abandonedLogs.push(entry));
  console.log('abandoned');
  firstCleanup();
  assert.equal(console.log, original);

  const secondCleanup = captureConsole((entry) => logs.push(entry));
  console.log('one message', 42);
  await Promise.resolve();
  assert.deepEqual(abandonedLogs, []);
  assert.deepEqual(logs, [{ type: 'log', message: 'one message', optionalParams: [42] }]);
  secondCleanup();
  assert.equal(console.log, original);
  assert.equal(original.mock.callCount(), 2);
});

test('cleanup does not replace a handler installed afterwards', (t) => {
  t.mock.method(console, 'log', () => undefined);
  const cleanup = captureConsole(() => undefined);
  const newerHandler = () => undefined;
  console.log = newerHandler;
  cleanup();
  assert.equal(console.log, newerHandler);
});
