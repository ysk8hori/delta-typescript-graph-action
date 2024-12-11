import fs from 'fs';
import { getCreateGraphsArguments } from './getCreateGraphsArguments';

jest.mock('fs');
jest.mock('../utils/config', () => {
  return {
    isDebugEnabled: () => false,
  };
});

test('root も path も 未指定の場合は undefined', () => {
  const mockExistsSync = jest.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({})).toBeUndefined();
});

test('tsconfigRoot を指定するとそれが dir に設定される', () => {
  const mockExistsSync = jest.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({ tsconfigRoot: './' })).toStrictEqual({
    dir: './',
  });
});

test.each([
  {
    tsconfigPath: './tsconfig.json',
    expected: {
      tsconfig: './tsconfig.json',
      dir: './',
    },
  },
  {
    tsconfigPath: './tsconfig.json5',
    expected: {
      tsconfig: './tsconfig.json5',
      dir: './',
    },
  },
  {
    tsconfigPath: './my_app/tsconfig.json',
    expected: {
      tsconfig: './my_app/tsconfig.json',
      dir: './my_app/',
    },
  },
])(
  'tsconfigPath を指定するとそれが tsconfig に、tsconfig のあるディレクトリが dir に設定される',
  ({ tsconfigPath, expected }) => {
    const mockExistsSync = jest.fn();
    mockExistsSync.mockReturnValueOnce(true);
    fs.existsSync = mockExistsSync;

    expect(getCreateGraphsArguments({ tsconfigPath })).toStrictEqual(expected);
  },
);

test('tsconfigPath が存在しない場合は undefined を返す', () => {
  const mockExistsSync = jest.fn();
  mockExistsSync.mockReturnValueOnce(false);
  fs.existsSync = mockExistsSync;

  expect(
    getCreateGraphsArguments({ tsconfigPath: './tsconfig.json' }),
  ).toBeUndefined();
});

test.each([
  { tsconfigPath: './tsconfig' },
  { tsconfigPath: './tsconfig/' },
  { tsconfigPath: './tsconfig.yaml' },
  { tsconfigPath: './tsconfig.json.js' },
])('json でない場合は undefined を返す', ({ tsconfigPath }) => {
  const mockExistsSync = jest.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(getCreateGraphsArguments({ tsconfigPath })).toBeUndefined();
});

test('tsconfigRoot と tsconfigPath を指定すると tsconfigRoot は無視される', () => {
  const mockExistsSync = jest.fn();
  mockExistsSync.mockReturnValueOnce(true);
  fs.existsSync = mockExistsSync;

  expect(
    getCreateGraphsArguments({
      tsconfigRoot: './',
      tsconfigPath: './my_app/tsconfig.json',
    }),
  ).toStrictEqual({
    tsconfig: './my_app/tsconfig.json',
    dir: './my_app/',
  });
});
