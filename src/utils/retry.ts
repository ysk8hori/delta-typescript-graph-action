export function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  interval = 1000,
): Promise<T | undefined> {
  return fn().catch(async (error: Error) => {
    console.warn('\n', error);
    if (maxRetries <= 0) return undefined;

    await new Promise(resolve => setTimeout(resolve, interval));
    return retry(fn, maxRetries - 1);
  });
}
