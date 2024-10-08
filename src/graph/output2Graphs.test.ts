import { Graph, Node } from '@ysk8hori/typescript-graph/dist/src/models';
import { output2Graphs } from './output2Graphs';
import GitHub from '../utils/github';

const commentToPR = jest.fn();
const deleteComment = jest.fn();
const getCommentTitle = jest
  .fn()
  .mockImplementation(
    () => `## Delta TypeScript Graph<!--test-workflow.yml-->`,
  );
jest.mock('../utils/github', () => {
  return jest.fn().mockImplementation(() => {
    return {
      commentToPR,
      deleteComment,
      getCommentTitle,
    };
  });
});
const GitHubMock = GitHub as jest.Mock;
beforeEach(() => {
  GitHubMock.mockClear();
  commentToPR.mockClear();
  deleteComment.mockClear();
  getCommentTitle.mockClear();
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
  await output2Graphs(base, head, meta, {
    created: [],
    deleted: [{ filename: b.path, previous_filename: undefined }],
    modified: [{ filename: a.path, previous_filename: undefined }],
    renamed: [],
  });
  expect((commentToPR as jest.Mock).mock.calls[0]).toMatchSnapshot();
});
