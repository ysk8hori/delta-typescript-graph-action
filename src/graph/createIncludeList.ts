import type { Graph } from '@ysk8hori/typescript-graph';
import { isIncludeIndexFileDependencies } from '../utils/config';
import type { Context } from '../utils/context';
import { extractIndexFileDependencies } from './extractIndexFileDependencies';

export function createIncludeList({
  context: {
    filesChanged: { created, deleted, modified, renamed },
  },
  graphs,
}: {
  context: Pick<Context, 'filesChanged'>;
  graphs: Graph[];
}) {
  const tmp = [
    ...created.map(({ filename }) => filename),
    ...deleted.map(({ filename }) => filename),
    ...modified.map(({ filename }) => filename),
    ...(renamed
      ?.flatMap(diff => [diff.previous_filename, diff.filename])
      .filter(Boolean) ?? []),
  ];
  return isIncludeIndexFileDependencies()
    ? [
        ...tmp,
        ...extractIndexFileDependencies({ graphs, includeFilePaths: tmp }),
      ]
    : tmp;
}
