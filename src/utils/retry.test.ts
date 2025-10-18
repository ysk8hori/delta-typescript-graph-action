import { vi, beforeAll, afterAll } from 'vitest';
import { retry } from './retry';

const warn = global.console.warn;

beforeAll(() => {
  vi.useFakeTimers();
  global.console.warn = vi.fn();
});

afterAll(() => {
  vi.useRealTimers();
  global.console.warn = warn;
});

async function runTimersAndNextTick(times: number) {
  if (times <= 0) return;
  await new Promise(process.nextTick);
  vi.runAllTimers();
  await runTimersAndNextTick(times - 1);
}

test('成功時には値を返す', async () => {
  const result = await retry(() => Promise.resolve('success'));

  expect(result).toBe('success');
});

test('成功後はコールバックを実行しない', async () => {
  const fn = vi.fn();

  const result = retry<'success'>(
    () =>
      new Promise(resolve => {
        fn();
        resolve('success');
      }),
  );
  await runTimersAndNextTick(5);

  expect(fn).toHaveBeenCalledTimes(1);
  expect(await result).toBe('success');
});

test('失敗時にはundefinedを返す', async () => {
  const fn = vi.fn();
  fn.mockRejectedValue(new Error('fail'));

  const result = retry(fn);
  await runTimersAndNextTick(5);

  expect(await result).toBeUndefined();
});

test('コールバック関数を最初の1回＋リトライ回数分実行する', async () => {
  const fn = vi.fn();

  const result = retry<true>(
    () =>
      new Promise((_, reject) => {
        fn();
        reject(new Error('fail'));
      }),
    5,
  );
  await runTimersAndNextTick(7);

  expect(fn).toHaveBeenCalledTimes(6);
  expect(await result).toBeUndefined();
});

test('指定した回数だけリトライし成功できる', async () => {
  const fn = vi.fn();
  fn.mockRejectedValueOnce(new Error('fail'))
    .mockRejectedValueOnce(new Error('fail'))
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValueOnce('success');

  const result = retry(fn, 3);
  await runTimersAndNextTick(5);

  expect(fn).toHaveBeenCalledTimes(4);
  expect(await result).toBe('success');
});
