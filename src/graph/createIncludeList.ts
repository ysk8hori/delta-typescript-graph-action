import path from 'node:path';
import type { Graph } from '@ysk8hori/typescript-graph';
import { isIncludeIndexFileDependencies } from '../utils/config';
import type { Context } from '../utils/context';
import { extractIndexFileDependencies } from './extractIndexFileDependencies';

export function createIncludeList({
  context: {
    filesChanged: { created, deleted, modified, renamed },
    config: { tsconfigRoot, tsconfig },
  },
  graphs,
}: {
  context: Pick<Context, 'filesChanged' | 'config'>;
  graphs: Graph[];
}) {
  const baseDir = tsconfig ? path.dirname(tsconfig) : tsconfigRoot;
  const tmp = [
    ...created.map(({ filename }) => filename),
    ...deleted.map(({ filename }) => filename),
    ...modified.map(({ filename }) => filename),
    ...(renamed
      ?.flatMap(diff => [diff.previous_filename, diff.filename])
      .filter(Boolean) ?? []),
  ]
    .map(filename => path.relative(baseDir, filename))
    .filter(filename => filename && !filename.startsWith('..'));
  return isIncludeIndexFileDependencies()
    ? [
        ...tmp,
        ...extractIndexFileDependencies({ graphs, includeFilePaths: tmp }),
      ]
    : tmp;
}
