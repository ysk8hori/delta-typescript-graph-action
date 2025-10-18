import fs from 'fs';
import { vi } from 'vitest';
import { getCreateGraphsArguments } from './getCreateGraphsArguments';

vi.mock('fs');
vi.mock('../utils/config', () => {
  return {
    isDebugEnabled: () => false,
  };
});

test('root も path も 未指定の場合は undefined', () => {
  const mockExistsSync = vi.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({})).toBeUndefined();
});

test('tsconfigRoot を指定するとそれが dir に設定される', () => {
  const mockExistsSync = vi.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({ tsconfigRoot: './' })).toStrictEqual({
    dir: './',
  });
});

test.each([
  {
    tsconfig: './tsconfig.json',
    expected: {
      tsconfig: './tsconfig.json',
      dir: './',
    },
  },
  {
    tsconfig: './tsconfig.json5',
    expected: {
      tsconfig: './tsconfig.json5',
      dir: './',
    },
  },
  {
    tsconfig: './my_app/tsconfig.json',
    expected: {
      tsconfig: './my_app/tsconfig.json',
      dir: './my_app/',
    },
  },
])(
  'tsconfig を指定するとそれが tsconfig に、tsconfig のあるディレクトリが dir に設定される',
  ({ tsconfig, expected }) => {
    const mockExistsSync = vi.fn();
    mockExistsSync.mockReturnValueOnce(true);
    fs.existsSync = mockExistsSync;

    expect(getCreateGraphsArguments({ tsconfig })).toStrictEqual(expected);
  },
);

test('tsconfig が存在しない場合は undefined を返す', () => {
  const mockExistsSync = vi.fn();
  mockExistsSync.mockReturnValueOnce(false);
  fs.existsSync = mockExistsSync;

  expect(
    getCreateGraphsArguments({ tsconfig: './tsconfig.json' }),
  ).toBeUndefined();
});

test.each([
  { tsconfig: './tsconfig' },
  { tsconfig: './tsconfig/' },
  { tsconfig: './tsconfig.yaml' },
  { tsconfig: './tsconfig.json.js' },
])('json でない場合は undefined を返す', ({ tsconfig }) => {
  const mockExistsSync = vi.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({ tsconfig })).toBeUndefined();
});

test('tsconfigRoot と tsconfig を指定すると tsconfigRoot は無視される', () => {
  const mockExistsSync = vi.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(
    getCreateGraphsArguments({
      tsconfigRoot: './',
      tsconfig: './my_app/tsconfig.json',
    }),
  ).toStrictEqual({
    tsconfig: './my_app/tsconfig.json',
    dir: './my_app/',
  });
});
