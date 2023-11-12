import {
  clearRuntimeConfig,
  getMaxSize,
  getOrientation,
  getTsconfigRoot,
  isIncludeIndexFileDependencies,
  isDebugEnabled,
  isInDetails,
  readRuntimeConfig,
} from './config';

let ENV_ORG: NodeJS.ProcessEnv;

beforeAll(() => {
  ENV_ORG = process.env;
});

afterEach(() => {
  process.env = ENV_ORG;
  clearRuntimeConfig();
  jest.resetModules();
});

test('getTsconfigRoot は環境変数もRuntimeConfigも設定されていない場合は "./"を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(getTsconfigRoot()).toEqual('./');
});

test('getTsconfigRoot は .danger-tsgrc.json の tsconfigRoot より環境変数 TSG_TSCONFIG_ROOT を優先して返す', () => {
  process.env.TSG_TSCONFIG_ROOT = 'foo';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getTsconfigRoot()).toEqual('foo');
});

test('getTsconfigRoot は環境変数 TSG_TSCONFIG_ROOT が設定されていない場合、.danger-tsgrc.json の tsconfigRoot を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getTsconfigRoot()).toEqual('./test/tsconfig.json');
});

test('getMaxSize は環境変数もRuntimeConfigも設定されていない場合は 30 を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(getMaxSize()).toBe(30);
});

test('getMaxSize は .danger-tsgrc.json の tsconfigRoot より環境変数 TSG_MAX_SIZE を優先して返す', () => {
  process.env.TSG_MAX_SIZE = '50';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getMaxSize()).toBe(50);
});

test('getMaxSize は環境変数 TSG_MAX_SIZE が設定されていない場合、.danger-tsgrc.json の maxSize を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getMaxSize()).toBe(999);
});

test('getOrientation は環境変数もRuntimeConfigも設定されていない場合は {} を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(getOrientation()).toEqual({});
});

test('getOrientation は .danger-tsgrc.json の orientation より環境変数 TSG_ORIENTATION を優先して返す', () => {
  process.env.TSG_ORIENTATION = 'TB';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getOrientation()).toEqual({ TB: true });
});

test('getOrientation は環境変数 TSG_ORIENTATION が設定されていない場合、.danger-tsgrc.json の orientation を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(getOrientation()).toEqual({ LR: true });
});

test('isDebugEnabled は環境変数もRuntimeConfigも設定されていない場合は false を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(isDebugEnabled()).toBeFalsy();
});

test('isDebugEnabled は .danger-tsgrc.json の debug より環境変数 TSG_DEBUG を優先して返す', () => {
  process.env.TSG_DEBUG = 'false';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isDebugEnabled()).toBeFalsy();
});

test('isDebugEnabled は環境変数 TSG_DEBUG が設定されていない場合、.danger-tsgrc.json の debug を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isDebugEnabled()).toBeTruthy();
});

test('isInDetails は環境変数もRuntimeConfigも設定されていない場合は false を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(isInDetails()).toBeFalsy();
});

test('isInDetails は .danger-tsgrc.json の debug より環境変数 TSG_IN_DETAILS を優先して返す', () => {
  process.env.TSG_IN_DETAILS = 'false';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isInDetails()).toBeFalsy();
});

test('isInDetails は環境変数 TSG_IN_DETAILS が設定されていない場合、.danger-tsgrc.json の debug を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isInDetails()).toBeTruthy();
});

test('includeIndexFileDependencies は環境変数もRuntimeConfigも設定されていない場合は false を 返す', () => {
  process.env = {};
  clearRuntimeConfig();
  expect(isIncludeIndexFileDependencies()).toBeFalsy();
});

test('includeIndexFileDependencies は .danger-tsgrc.json の debug より環境変数 TSG_INCLUDE_INDEX_FILE_DEPENDENCIES を優先して返す', () => {
  process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES = 'false';
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isIncludeIndexFileDependencies()).toBeFalsy();
});

test('includeIndexFileDependencies は環境変数 TSG_INCLUDE_INDEX_FILE_DEPENDENCIES が設定されていない場合、.danger-tsgrc.json の debug を返す', () => {
  process.env = {};
  readRuntimeConfig('./src/utils/.test-danger-tsgrc.json');
  expect(isIncludeIndexFileDependencies()).toBeTruthy();
});
