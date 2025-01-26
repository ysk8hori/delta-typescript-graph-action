import type { Graph, ChangeStatus } from '@ysk8hori/typescript-graph';
import type { Context } from '../utils/context';

export default function addStatus(
  {
    filesChanged: { modified, created, deleted },
  }: Pick<Context, 'filesChanged'>,
  graph: Graph,
): Graph {
  const { nodes, relations } = graph;
  const newNodes = nodes.map(node => {
    const changeStatus: ChangeStatus = (function () {
      if (deleted.map(({ filename }) => filename).includes(node.path))
        return 'deleted';
      if (created.map(({ filename }) => filename).includes(node.path))
        return 'created';
      if (modified.map(({ filename }) => filename).includes(node.path))
        return 'modified';
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
