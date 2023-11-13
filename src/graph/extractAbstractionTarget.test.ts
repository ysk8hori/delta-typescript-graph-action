// extractAbstractionTarget のテスト
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';

it('グラフと、抽象化してはいけないファイルのパスから、抽象化して良いディレクトリのパスを取得する', () => {
  expect(
    extractAbstractionTarget(
      [
        '.github',
        '.github/workflows',
        'src',
        'src/components',
        'src/components/game',
        'src/components/game/cell',
      ],
      {
        nodes: [
          {
            path: 'src/components/game/cell/Hoge.ts',
            name: 'Hoge.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.tsx',
            name: 'Cell.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/utils/answers/getAnswerClass.ts',
            name: 'getAnswerClass.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/MemoLayer.tsx',
            name: 'MemoLayer.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/atoms.ts',
            name: 'atoms.ts',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/GameBoard.tsx',
            name: 'GameBoard.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.stories.tsx',
            name: 'Cell.stories.tsx',
            changeStatus: 'not_modified',
          },
          {
            path: 'src/components/game/cell/Cell.test.tsx',
            name: 'Cell.test.tsx',
            changeStatus: 'not_modified',
          },
        ],
        relations: [
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/utils/answers/getAnswerClass.ts',
              name: 'getAnswerClass.ts',
              changeStatus: 'not_modified',
            },
            fullText: 'getAnswerClass',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/MemoLayer.tsx',
              name: 'MemoLayer.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'MemoLayer, { Props as MemoLayerProps }',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/atoms.ts',
              name: 'atoms.ts',
              changeStatus: 'not_modified',
            },
            fullText: '{ AnswerImageVariant }',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Hoge.ts',
              name: 'Hoge.ts',
              changeStatus: 'not_modified',
            },
            fullText: 'hoge',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/GameBoard.tsx',
              name: 'GameBoard.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.stories.tsx',
              name: 'Cell.stories.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
          {
            kind: 'depends_on',
            from: {
              path: 'src/components/game/cell/Cell.test.tsx',
              name: 'Cell.test.tsx',
              changeStatus: 'not_modified',
            },
            to: {
              path: 'src/components/game/cell/Cell.tsx',
              name: 'Cell.tsx',
              changeStatus: 'not_modified',
            },
            fullText: 'Cell',
            changeStatus: 'not_modified',
          },
        ],
      },
    ),
  ).toEqual(['src/components/game/utils/answers']);
});

it('深い階層のディレクトリが可能な限り浅い階層で抽象化されること', () => {
  expect(
    extractAbstractionTarget(extractNoAbstractionDirs(['src/a/a.ts']), {
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
    }),
  ).toMatchInlineSnapshot(`
    [
      "src/a/b",
      "src/a/b/c",
      "src/a/b/c/d",
    ]
  `);
});
