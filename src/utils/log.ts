import { isDebugEnabled } from './config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function log(message?: any, ...optionalParams: any[]): void {
  if (!isDebugEnabled()) return;
  console.log(stringifyObject(message), ...optionalParams.map(stringifyObject));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringifyObject(message: any) {
  // message がオブジェクトの場合は JSON.stringify で文字列化する
  if (message !== null && typeof message === 'object') {
    return JSON.stringify(message, null, 2);
  }
  return message;
}
