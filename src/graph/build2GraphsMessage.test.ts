import type { Graph, Node } from '@ysk8hori/typescript-graph';
import { getDummyContext } from '../utils/dummyContext';
import { build2GraphsMessage } from './build2GraphsMessage';

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

test('削除がある場合', () => {
  const base: Graph = {
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
  const head: Graph = {
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
  const context = getDummyContext();
  const result = build2GraphsMessage(base, head, {
    ...context,
    filesChanged: {
      created: [],
      deleted: [
        { filename: b.path, previous_filename: undefined, status: 'removed' },
      ],
      modified: [
        { filename: a.path, previous_filename: undefined, status: 'modified' },
      ],
      renamed: [],
    },
  });
  expect(result).toMatchSnapshot();
});
