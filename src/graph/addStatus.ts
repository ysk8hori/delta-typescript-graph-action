import type { Graph, ChangeStatus } from '@ysk8hori/typescript-graph';

export default function addStatus(
  {
    modified,
    created,
    deleted,
  }: {
    modified: string[];
    created: string[];
    deleted: string[];
  },
  graph: Graph,
): Graph {
  const { nodes, relations } = graph;
  const newNodes = nodes.map(node => {
    const changeStatus: ChangeStatus = (function () {
      if (deleted.includes(node.path)) return 'deleted';
      if (created.includes(node.path)) return 'created';
      if (modified.includes(node.path)) return 'modified';
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
