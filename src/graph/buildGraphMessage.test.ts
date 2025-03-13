import type { Graph, Node } from '@ysk8hori/typescript-graph';
import { getDummyContext } from '../utils/dummyContext';
import { buildGraphMessage } from './buildGraphMessage';

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

test('出力可能なグラフがない場合は何も出力しない', () => {
  const graph = {
    nodes: [],
    relations: [],
  };
  const context = getDummyContext();
  const message = buildGraphMessage(graph, graph, context);
  expect(message).toBe('The graph is empty.\n\n');
});

test('グラフが大きすぎる場合はその旨を出力する', () => {
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
  const message = buildGraphMessage(graphA, graphB, {
    ...context,
    config: { ...context.config, maxSize: 1 },
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
  expect(message).toMatchSnapshot();
});

test('追加や依存の削除がある場合', () => {
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
  const message = buildGraphMessage(graphA, graphB, {
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
  expect(message).toMatchSnapshot();
});
