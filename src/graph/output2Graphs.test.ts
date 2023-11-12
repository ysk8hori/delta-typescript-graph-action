import { Graph, Node } from '@ysk8hori/typescript-graph/dist/src/models';
import { output2Graphs } from './output2Graphs';

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

test('削除がある場合', async () => {
  const base: Graph = {
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
  const head: Graph = {
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
  const meta = {
    rootDir: '',
  };
  const renamed = undefined;
  global.danger = {
    github: { pr: { title: '' } },
    git: {
      modified_files: [a.path],
      created_files: [],
      deleted_files: [b.path],
    },
  };
  await output2Graphs(base, head, meta, renamed);
  expect((global.markdown as jest.Mock).mock.calls[0]).toMatchInlineSnapshot(`
    [
      "
    ## TypeScript Graph - Diff



    \`\`\`bash
    tsg  --include src/B.tsx src/A.tsx --highlight src/B.tsx src/A.tsx --exclude node_modules --abstraction src/1
    \`\`\`

    ### Base Branch

    \`\`\`mermaid
    flowchart
        classDef modified fill:yellow,stroke:#999,color:black
        classDef deleted fill:dimgray,stroke:#999,color:black,stroke-dasharray: 4 4,stroke-width:2px;
        subgraph src["src"]
            src/A.tsx["A"]:::modified
            src/B.tsx["B"]:::deleted
            src/C.tsx["C"]
            src/1["/1"]:::dir
        end
        src/A.tsx-->src/B.tsx
        src/A.tsx-->src/C.tsx
        src/A.tsx-->src/1

    \`\`\`

    ### Head Branch

    \`\`\`mermaid
    flowchart
        classDef modified fill:yellow,stroke:#999,color:black
        subgraph src["src"]
            src/A.tsx["A"]:::modified
            src/C.tsx["C"]
            src/1["/1"]:::dir
        end
        src/A.tsx-->src/C.tsx
        src/A.tsx-->src/1

    \`\`\`


    ",
    ]
  `);
});
