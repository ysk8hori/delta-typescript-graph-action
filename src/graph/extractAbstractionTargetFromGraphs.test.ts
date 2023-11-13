import { extractAbstractionTargetFromGraphs } from './extractAbstractionTargetFromGraphs';

test('グラフにディレクトリノードが含まれない場合はから配列を返す', () => {
  expect(
    extractAbstractionTargetFromGraphs(
      {
        nodes: [
          {
            path: 'src/a/a.ts',
            name: 'a.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/b.ts',
            name: 'b.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/c.ts',
            name: 'c.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/d/d.ts',
            name: 'd.ts',
            changeStatus: 'not_modified',
          },
        ],

        relations: [],
      },
      {
        nodes: [
          {
            path: 'src/a/a.ts',
            name: 'a.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/b.ts',
            name: 'b.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/c.ts',
            name: 'c.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/d/d.ts',
            name: 'd.ts',
            changeStatus: 'not_modified',
          },
        ],

        relations: [],
      },
    ),
  ).toEqual([]);
});

test('グラフにディレクトリノードが含まれる場合は、そのノードのパスのリストを返す', () => {
  expect(
    extractAbstractionTargetFromGraphs(
      {
        nodes: [
          {
            path: 'src/a/a.ts',
            name: 'a.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/b.ts',
            name: 'b.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/c.ts',
            name: 'c.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/a/b/c/d',
            name: 'd',
            changeStatus: 'not_modified',
            isDirectory: true,
          },
        ],
        relations: [],
      },
      {
        nodes: [
          {
            path: 'src/1/2/3',
            name: '3',
            changeStatus: 'not_modified',
            isDirectory: true,
          },
        ],

        relations: [],
      },
    ),
  ).toEqual(['src/1/2/3', 'src/a/b/c/d']);
});
