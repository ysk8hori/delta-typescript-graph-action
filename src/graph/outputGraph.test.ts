import type { Graph, Node } from '@ysk8hori/typescript-graph';
import { getDummyContext } from '../utils/dummyContext';
import { outputGraph } from './outputGraph';

const a: Node = {
  path: 'src/A.tsx',
  name: 'A',
  changeStatus: 'not_modified',
};
const b: Node = {
  path: 'src/B.tsx',
  name: 'B',
  changeStatus: 'not_modified',
};
const c: Node = {
  path: 'src/C.tsx',
  name: 'C',
  changeStatus: 'not_modified',
};

const d: Node = {
  path: 'src/1/D.tsx',
  name: 'D',
  changeStatus: 'not_modified',
};

const e: Node = {
  path: 'src/1/E.tsx',
  name: 'E',
  changeStatus: 'not_modified',
};

test('出力可能なグラフがない場合は何も出力しない', async () => {
  const graph = {
    nodes: [],
    relations: [],
  };
  const context = getDummyContext();
  await outputGraph(graph, graph, context);
  expect(context.github.commentToPR).not.toHaveBeenCalled();
});

test('追加や依存の削除がある場合', async () => {
  const graphA: Graph = {
    nodes: [a, c, d, e],
    relations: [
      {
        from: a,
        to: c,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
      {
        from: a,
        to: d,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
      {
        from: d,
        to: e,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
    ],
  };
  const graphB: Graph = {
    nodes: [a, b, c, d, e],
    relations: [
      {
        from: a,
        to: b,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
      {
        from: a,
        to: d,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
      {
        from: d,
        to: e,
        kind: 'depends_on',
        changeStatus: 'not_modified',
      },
    ],
  };
  const context = getDummyContext();
  await outputGraph(graphA, graphB, {
    ...context,
    filesChanged: {
      created: [
        { filename: b.path, previous_filename: undefined, status: 'added' },
      ],
      deleted: [],
      modified: [
        { filename: a.path, previous_filename: undefined, status: 'modified' },
      ],
      renamed: [],
    },
  });
  expect(
    (context.github.commentToPR as jest.Mock).mock.calls[0][1],
  ).toMatchSnapshot();
});
