import { Graph, Node } from '@ysk8hori/typescript-graph/dist/src/models';
import { outputGraph } from './outputGraph';
import github from '../github';

github.commentToPR = jest.fn();
github.deleteComment = jest.fn();
github.getCommentTitle = jest.fn();
(github.getCommentTitle as jest.Mock).mockImplementation(
  () => `## Delta TypeScript Graph<!--test-workflow.yml-->`,
);

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
  const meta = {
    rootDir: '',
  };
  outputGraph(graph, graph, meta, {
    created: [],
    deleted: [],
    modified: [],
    renamed: [],
  });
  expect(github.commentToPR).not.toHaveBeenCalled();
});

test('追加や依存の削除がある場合', () => {
  const graphA: Graph = {
    nodes: [a, c, d, e],
    relations: [
      {
        from: a,
        to: c,
        kind: 'depends_on',
        fullText: '',
        changeStatus: 'not_modified',
      },
      {
        from: a,
        to: d,
        kind: 'depends_on',
        fullText: '',
        changeStatus: 'not_modified',
      },
      {
        from: d,
        to: e,
        kind: 'depends_on',
        fullText: '',
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
        fullText: '',
        changeStatus: 'not_modified',
      },
      {
        from: a,
        to: d,
        kind: 'depends_on',
        fullText: '',
        changeStatus: 'not_modified',
      },
      {
        from: d,
        to: e,
        kind: 'depends_on',
        fullText: '',
        changeStatus: 'not_modified',
      },
    ],
  };
  const meta = {
    rootDir: '',
  };
  outputGraph(graphA, graphB, meta, {
    created: [{ filename: b.path, previous_filename: undefined }],
    deleted: [],
    modified: [{ filename: a.path, previous_filename: undefined }],
    renamed: [],
  });
  expect((github.commentToPR as jest.Mock).mock.calls[0][0]).toMatchSnapshot();
});
