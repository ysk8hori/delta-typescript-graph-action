import type { Graph, ChangeStatus } from '@ysk8hori/typescript-graph';
import type { Context } from '../utils/context';
import {
  getRelativePathFromTsconfig,
  isInTsconfigScope,
} from '../utils/tsconfigPath';

export default function addStatus(
  {
    filesChanged: { modified, created, deleted },
    config,
  }: Pick<Context, 'filesChanged' | 'config'>,
  graph: Graph,
): Graph {
  const { nodes, relations } = graph;

  // Convert changed file paths to be relative to the tsconfig directory
  const deletedPaths = deleted
    .map(({ filename }) => filename)
    .filter(filename => isInTsconfigScope(filename, config))
    .map(filename => getRelativePathFromTsconfig(filename, config));
  const createdPaths = created
    .map(({ filename }) => filename)
    .filter(filename => isInTsconfigScope(filename, config))
    .map(filename => getRelativePathFromTsconfig(filename, config));
  const modifiedPaths = modified
    .map(({ filename }) => filename)
    .filter(filename => isInTsconfigScope(filename, config))
    .map(filename => getRelativePathFromTsconfig(filename, config));

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
