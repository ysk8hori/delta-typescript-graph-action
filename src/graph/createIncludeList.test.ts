import type { Node, Relation } from '@ysk8hori/typescript-graph';
import { isIncludeIndexFileDependencies } from '../utils/config';
import { createIncludeList } from './createIncludeList';

jest.mock('../utils/config', () => ({
  isIncludeIndexFileDependencies: jest.fn(),
}));

test('新規作成、更新、削除、リネーム前後のファイルが include 対象となる', () => {
  expect(
    createIncludeList({
      context: {
        filesChanged: {
          created: [
            {
              filename: 'created.ts',
              status: 'added',
              previous_filename: undefined,
            },
          ],
          deleted: [
            {
              filename: 'deleted.ts',
              status: 'removed',
              previous_filename: undefined,
            },
          ],
          modified: [
            {
              filename: 'modified.ts',
              status: 'modified',
              previous_filename: undefined,
            },
          ],
          renamed: [
            {
              previous_filename: 'before.ts',
              filename: 'after.ts',
              status: 'renamed',
            },
          ],
        },
      },
      // created: ['created.ts'],
      // deleted: ['deleted.ts'],
      // modified: ['modified.ts'],
      // renamed: [{ previous_filename: 'before.ts', filename: 'after.ts' }],
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
  (isIncludeIndexFileDependencies as jest.Mock).mockImplementation(() => false);
  expect(
    createIncludeList({
      context: {
        filesChanged: {
          created: [],
          deleted: [],
          modified: [
            {
              filename: 'src/a.ts',
              status: 'modified',
              previous_filename: undefined,
            },
          ],
          renamed: [],
        },
      },
      // created: [],
      // deleted: [],
      // modified: ['src/a.ts'],
      // renamed: [],
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
              kind: 'depends_on',
            } satisfies Relation,
          ],
        },
      ],
    }),
  ).toEqual(['src/a.ts']);
});

test('TSG_INCLUDE_INDEX_FILE_DEPENDENCIES が true の場合は include 対象となるファイルを参照している index.ts を含める', () => {
  (isIncludeIndexFileDependencies as jest.Mock).mockImplementation(() => true);
  expect(
    createIncludeList({
      context: {
        filesChanged: {
          created: [],
          deleted: [],
          modified: [
            {
              filename: 'src/a.ts',
              status: 'modified',
              previous_filename: undefined,
            },
          ],
          renamed: [],
        },
      },
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
              kind: 'depends_on',
            } satisfies Relation,
          ],
        },
      ],
    }),
  ).toEqual(['src/a.ts', 'src/index.ts']);
});
