import type { Graph } from '@ysk8hori/typescript-graph';
import { isIncludeIndexFileDependencies } from '../utils/config';
import type { Context } from '../utils/context';
import { convertToRelativePathsFromTsconfig } from '../utils/tsconfigPath';
import { extractIndexFileDependencies } from './extractIndexFileDependencies';

export function createIncludeList({
  context: {
    filesChanged: { created, deleted, modified, renamed },
    config,
  },
  graphs,
}: {
  context: Pick<Context, 'filesChanged' | 'config'>;
  graphs: Graph[];
}) {
  const allChangedFiles = [
    ...created.map(({ filename }) => filename),
    ...deleted.map(({ filename }) => filename),
    ...modified.map(({ filename }) => filename),
    ...(renamed
      ?.flatMap(diff => [diff.previous_filename, diff.filename])
      .filter(Boolean) ?? []),
  ];

  const relativePaths = convertToRelativePathsFromTsconfig(
    allChangedFiles,
    config,
  );

  return isIncludeIndexFileDependencies()
    ? [
        ...relativePaths,
        ...extractIndexFileDependencies({
          graphs,
          includeFilePaths: relativePaths,
        }),
      ]
    : relativePaths;
}
