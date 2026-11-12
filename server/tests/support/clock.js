// Sets the server's "today" for the scenarios that depend on it, such as Mark Lease Ended, which
// only works on the lease's scheduled end date. Only Date is faked: timers, ticks and I/O stay real,
// so supertest and Express keep working.
import { jest } from '@jest/globals';

const REAL_TIMERS = [
  'hrtime',
  'nextTick',
  'performance',
  'queueMicrotask',
  'setImmediate',
  'clearImmediate',
  'setInterval',
  'clearInterval',
  'setTimeout',
  'clearTimeout'
];

// Runs action with today set to day ('YYYY-MM-DD', at noon UTC), then puts the real clock back.
export async function onDay(day, action) {
  jest.useFakeTimers({ now: new Date(`${day}T12:00:00.000Z`), doNotFake: REAL_TIMERS });
  try {
    return await action();
  } finally {
    jest.useRealTimers();
  }
}
