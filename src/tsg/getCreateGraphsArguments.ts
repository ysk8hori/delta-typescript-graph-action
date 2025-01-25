import fs from 'fs';
import { log } from '../utils/log';

export function getCreateGraphsArguments({
  tsconfig,
  tsconfigRoot,
}: {
  tsconfig?: string;
  tsconfigRoot?: string;
}):
  | {
      dir: string | undefined;
      tsconfig?: string;
    }
  | undefined {
  // 基本、root も path もないことはない
  if (!tsconfigRoot && !tsconfig) return undefined;
  if (tsconfig) {
    if (!/\.json.?$/.test(tsconfig) || !fs.existsSync(tsconfig)) {
      log('Head: tsconfig does not exist');
      return undefined;
    }
    const tsconfigRelatedPath = tsconfig;
    return {
      tsconfig: tsconfigRelatedPath,
      dir: tsconfigRelatedPath.split('/').slice(0, -1).join('/') + '/',
    };
  }
  return {
    dir: tsconfigRoot,
  };
}
