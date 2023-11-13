import extractNoAbstractionDirs from './extractNoAbstractionDirs';

it('ファイルのパスのリストから重複のないディレクトリのリストを抽出する', () => {
  expect(
    extractNoAbstractionDirs([
      '.github/workflows/pre-workflow.yml',
      'src/components/game/cell/Cell.tsx',
      'src/components/game/cell/Hoge.ts',
    ]),
  ).toEqual([
    '.github',
    '.github/workflows',
    'src',
    'src/components',
    'src/components/game',
    'src/components/game/cell',
  ]);
});
