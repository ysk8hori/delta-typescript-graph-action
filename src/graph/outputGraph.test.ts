import { Graph, Node } from '@ysk8hori/typescript-graph/dist/src/models';
import { outputGraph } from './outputGraph';

beforeEach(() => {
  global.markdown = jest.fn();
});

afterEach(() => {
  global.markdown = undefined;
});

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
  const renamed = undefined;
  global.danger = {
    github: { pr: { title: 'My Test Title' } },
    git: {
      modified_files: [],
      created_files: [],
      deleted_files: [],
    },
  };
  outputGraph(graph, graph, meta, renamed);
  expect(global.markdown).not.toHaveBeenCalled();
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
  const renamed = undefined;
  global.danger = {
    github: { pr: { title: '' } },
    git: {
      modified_files: [a.path],
      created_files: [b.path],
      deleted_files: [],
    },
  };
  outputGraph(graphA, graphB, meta, renamed);
  expect((global.markdown as jest.Mock).mock.calls[0][0])
    .toMatchInlineSnapshot(`
    "
    ## TypeScript Graph - Diff



    \`\`\`bash
    tsg  --include src/B.tsx src/A.tsx --highlight src/B.tsx src/A.tsx --exclude node_modules --abstraction src/1
    \`\`\`

    \`\`\`mermaid
    flowchart
        classDef created fill:cyan,stroke:#999,color:black
        classDef modified fill:yellow,stroke:#999,color:black
        subgraph src["src"]
            src/A.tsx["A"]:::modified
            src/B.tsx["B"]:::created
            src/1["/1"]:::dir
            src/C.tsx["C"]
        end
        src/A.tsx-->src/B.tsx
        src/A.tsx-->src/1
        src/A.tsx-.->src/C.tsx

    \`\`\`


    "
  `);
});
