import type { Graph, ChangeStatus } from '@ysk8hori/typescript-graph';
import type { Context } from '../utils/context';
import { convertToRelativePathsFromTsconfig } from '../utils/tsconfigPath';

export default function addStatus(
  {
    filesChanged: { modified, created, deleted },
    config,
  }: Pick<Context, 'filesChanged' | 'config'>,
  graph: Graph,
): Graph {
  const { nodes, relations } = graph;

  // Convert changed file paths to be relative to the tsconfig directory
  const deletedPaths = convertToRelativePathsFromTsconfig(
    deleted.map(({ filename }) => filename),
    config,
  );
  const createdPaths = convertToRelativePathsFromTsconfig(
    created.map(({ filename }) => filename),
    config,
  );
  const modifiedPaths = convertToRelativePathsFromTsconfig(
    modified.map(({ filename }) => filename),
    config,
  );

  const newNodes = nodes.map(node => {
    const changeStatus: ChangeStatus = (function () {
      if (deletedPaths.includes(node.path)) return 'deleted';
      if (createdPaths.includes(node.path)) return 'created';
      if (modifiedPaths.includes(node.path)) return 'modified';
      return 'not_modified';
    })();
    return {
      ...node,
      changeStatus,
    };
  });
  return {
    nodes: newNodes,
    relations,
  };
}
