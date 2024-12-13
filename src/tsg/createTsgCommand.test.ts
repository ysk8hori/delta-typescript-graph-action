import { getDummyContext } from '../utils/dummyContext';
import { createTsgCommand } from './createTsgCommand';

test('何の指定もない場合は tsg を出力する', () => {
  expect(
    createTsgCommand({
      includes: [],
      abstractions: [],
      context: getDummyContext({ configExclude: [] }),
    }),
  ).toBe('tsg');
});

test('includes を指定した場合は `--include` と `--highlight` を出力する', () => {
  expect(
    createTsgCommand({
      includes: ['a.ts', 'b.tsx'],
      abstractions: [],
      context: getDummyContext({ configExclude: [] }),
    }),
  ).toBe('tsg --include a.ts b.tsx --highlight a.ts b.tsx');
});

test('abstractions を指定した場合は `--abstraction` を出力する', () => {
  expect(
    createTsgCommand({
      includes: [],
      abstractions: ['a', 'b'],
      context: getDummyContext({ configExclude: [] }),
    }),
  ).toBe('tsg --abstraction a b');
});

test('exclude を指定した場合は `--exclude` を出力する', () => {
  expect(
    createTsgCommand({
      includes: [],
      abstractions: [],
      context: getDummyContext({ configExclude: ['a.ts', 'b.tsx'] }),
    }),
  ).toBe('tsg --exclude a.ts b.tsx');
});

test('tsconfig を指定した場合は `--tsconfig` を出力する', () => {
  expect(
    createTsgCommand({
      includes: [],
      abstractions: [],
      context: getDummyContext({
        configTsconfig: './my-app/tsconfig.json',
        configExclude: [],
      }),
    }),
  ).toBe('tsg --tsconfig ./my-app/tsconfig.json');
});

test('tsconfig を指定した場合は include 等のパスを tsconfig からの相対パスに変換する', () => {
  expect(
    createTsgCommand({
      includes: ['my-app/src/a.ts'],
      abstractions: ['my-app/src/c.ts'],
      context: getDummyContext({
        configTsconfig: './my-app/tsconfig.json',
        configExclude: ['my-app/src/e.ts'],
      }),
    }),
  ).toBe(
    'tsg --include src/a.ts --highlight src/a.ts --exclude src/e.ts --abstraction src/c.ts --tsconfig ./my-app/tsconfig.json',
  );
});
