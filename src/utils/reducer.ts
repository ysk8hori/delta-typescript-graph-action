export function uniqueString(prev: string[], current: string) {
  if (!prev.includes(current)) {
    prev.push(current);
  }
  return prev;
}
