import fs from 'fs';
import { log } from '../utils/log';
import { createGraph } from '@ysk8hori/typescript-graph/dist/src/graph/createGraph';

export function getCreateGraphsArguments({
  tsconfigPath,
  tsconfigRoot,
}: {
  tsconfigPath?: string;
  tsconfigRoot?: string;
}): Parameters<typeof createGraph>[0] | undefined {
  // 基本、root も path もないことはない
  if (!tsconfigRoot && !tsconfigPath) return undefined;
  if (tsconfigPath) {
    if (!/\.json.?$/.test(tsconfigPath) || !fs.existsSync(tsconfigPath)) {
      log('Head: tsconfigPath does not exist');
      return undefined;
    }
    const tsconfigRelatedPath = tsconfigPath;
    return {
      tsconfig: tsconfigRelatedPath,
      dir: tsconfigRelatedPath.split('/').slice(0, -1).join('/') + '/',
    };
  }
  return {
    dir: tsconfigRoot,
  };
}
