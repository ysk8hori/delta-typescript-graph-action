import { Node, Relation } from '@ysk8hori/typescript-graph/dist/src/models';
import { createIncludeList } from './createIncludeList';

let ENV_ORG: NodeJS.ProcessEnv;

beforeAll(() => {
  ENV_ORG = process.env;
});

afterEach(() => {
  process.env = ENV_ORG;
});

test('新規作成、更新、削除、リネーム前後のファイルが include 対象となる', () => {
  process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES = 'false';
  expect(
    createIncludeList({
      created: ['created.ts'],
      deleted: ['deleted.ts'],
      modified: ['modified.ts'],
      renamed: [{ previous_filename: 'before.ts', filename: 'after.ts' }],
      graphs: [],
    }),
  ).toEqual([
    'created.ts',
    'deleted.ts',
    'modified.ts',
    'before.ts',
    'after.ts',
  ]);
});

test('TSG_INCLUDE_INDEX_FILE_DEPENDENCIES が false の場合は include 対象となるファイルを参照している index.ts を含めない', () => {
  process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES = 'false';
  expect(
    createIncludeList({
      created: [],
      deleted: [],
      modified: ['src/a.ts'],
      renamed: [],
      graphs: [
        {
          nodes: [
            {
              changeStatus: 'not_modified',
              name: 'a.ts',
              path: 'src/a.ts',
            } satisfies Node,
          ],
          relations: [
            {
              from: {
                changeStatus: 'not_modified',
                name: 'index.ts',
                path: 'src/index.ts',
              } satisfies Node,
              to: {
                changeStatus: 'not_modified',
                name: 'a.ts',
                path: 'src/a.ts',
              } satisfies Node,
              changeStatus: 'not_modified',
              fullText: '',
              kind: 'depends_on',
            } satisfies Relation,
          ],
        },
      ],
    }),
  ).toEqual(['src/a.ts']);
});

test('TSG_INCLUDE_INDEX_FILE_DEPENDENCIES が false の場合は include 対象となるファイルを参照している index.ts を含める', () => {
  process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES = 'true';
  expect(
    createIncludeList({
      created: [],
      deleted: [],
      modified: ['src/a.ts'],
      renamed: [],
      graphs: [
        {
          nodes: [
            {
              changeStatus: 'not_modified',
              name: 'a.ts',
              path: 'src/a.ts',
            } satisfies Node,
          ],
          relations: [
            {
              from: {
                changeStatus: 'not_modified',
                name: 'index.ts',
                path: 'src/index.ts',
              } satisfies Node,
              to: {
                changeStatus: 'not_modified',
                name: 'a.ts',
                path: 'src/a.ts',
              } satisfies Node,
              changeStatus: 'not_modified',
              fullText: '',
              kind: 'depends_on',
            } satisfies Relation,
          ],
        },
      ],
    }),
  ).toEqual(['src/a.ts', 'src/index.ts']);
});
