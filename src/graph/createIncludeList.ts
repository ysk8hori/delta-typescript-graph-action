import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { isIncludeIndexFileDependencies } from '../utils/config';
import { extractIndexFileDependencies } from './extractIndexFileDependencies';

export function createIncludeList({
  created,
  deleted,
  modified,
  renamed,
  graphs,
}: {
  created: string[];
  deleted: string[];
  modified: string[];
  renamed:
    | { filename: string; previous_filename: string | undefined }[]
    | undefined;
  graphs: Graph[];
}) {
  const tmp = [
    ...created,
    ...deleted,
    ...modified,
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
