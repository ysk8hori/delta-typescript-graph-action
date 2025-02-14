import type { CodeMetrics } from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import type { FlattenMatericsWithDiff } from './createScoreDiff';
import { createScoreDiff } from './createScoreDiff';

test('差分がない場合', () => {
  const baseFileData = [
    {
      filePath: 'a.ts',
      name: '-',
      scope: 'file',
      scores: [
        { name: '1', betterDirection: 'none', state: 'normal', value: 50 },
      ],
    },
  ] satisfies CodeMetrics[];
  const headFileData = [
    {
      filePath: 'a.ts',
      name: '-',
      scope: 'file',
      scores: [
        { name: '1', betterDirection: 'none', state: 'normal', value: 50 },
      ],
    },
  ] satisfies CodeMetrics[];
  const { metricsMap, sortedKeys } = createScoreDiff(
    headFileData,
    baseFileData,
  );
  expect(sortedKeys).toEqual(['a.ts']);
  expect(metricsMap.get('a.ts')).toEqual([
    {
      filePath: 'a.ts',
      key: 'a.ts-',
      name: '-',
      scope: 'file',
      scores: [
        {
          name: '1',
          betterDirection: 'none',
          state: 'normal',
          value: 50,
          diff: 0,
          diffStr: undefined,
        },
      ],
      status: 'updated',
    },
  ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
});

test('追加された場合', () => {
  const baseFileData = [] satisfies CodeMetrics[];
  const headFileData = [
    {
      filePath: 'a.ts',
      name: '-',
      scope: 'file',
      scores: [
        { name: '1', betterDirection: 'none', state: 'normal', value: 50 },
      ],
    },
  ] satisfies CodeMetrics[];
  const { metricsMap, sortedKeys } = createScoreDiff(
    headFileData,
    baseFileData,
  );
  expect(sortedKeys).toEqual(['a.ts']);
  expect(metricsMap.get('a.ts')).toEqual([
    {
      filePath: 'a.ts',
      key: 'a.ts-',
      name: '-',
      scope: 'file',
      scores: [
        {
          name: '1',
          betterDirection: 'none',
          state: 'normal',
          value: 50,
          diff: undefined,
          diffStr: undefined,
        },
      ],
      status: 'added',
    },
  ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
});

test('削除された場合', () => {
  const baseFileData = [
    {
      filePath: 'a.ts',
      name: '-',
      scope: 'file',
      scores: [
        { name: '1', betterDirection: 'none', state: 'normal', value: 50 },
      ],
    },
  ] satisfies CodeMetrics[];
  const headFileData = [] satisfies CodeMetrics[];
  const { metricsMap, sortedKeys } = createScoreDiff(
    headFileData,
    baseFileData,
  );
  expect(sortedKeys).toEqual(['a.ts']);
  expect(metricsMap.get('a.ts')).toEqual([
    {
      filePath: 'a.ts',
      key: 'a.ts-',
      name: '-',
      scope: 'file',
      scores: [
        {
          name: '1',
          betterDirection: 'none',
          state: 'normal',
          value: 50,
          diff: undefined,
          diffStr: undefined,
        },
      ],
      status: 'deleted',
    },
  ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
});

describe('更新された場合', () => {
  test('betterDirection が none の場合は diffStr なし', () => {
    const baseFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'none', state: 'normal', value: 40 },
        ],
      },
    ] satisfies CodeMetrics[];
    const headFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'none', state: 'normal', value: 50 },
        ],
      },
    ] satisfies CodeMetrics[];
    const { metricsMap, sortedKeys } = createScoreDiff(
      headFileData,
      baseFileData,
    );
    expect(sortedKeys).toEqual(['a.ts']);
    expect(metricsMap.get('a.ts')).toEqual([
      {
        filePath: 'a.ts',
        key: 'a.ts-',
        name: '-',
        scope: 'file',
        scores: [
          {
            name: '1',
            betterDirection: 'none',
            state: 'normal',
            value: 50,
            diff: 10,
            diffStr: undefined,
          },
        ],
        status: 'updated',
      },
    ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
  });

  test('betterDirection が higher かつ value が上昇の場合は +10', () => {
    const baseFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'higher', state: 'normal', value: 40 },
        ],
      },
    ] satisfies CodeMetrics[];
    const headFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'higher', state: 'normal', value: 50 },
        ],
      },
    ] satisfies CodeMetrics[];
    const { metricsMap, sortedKeys } = createScoreDiff(
      headFileData,
      baseFileData,
    );
    expect(sortedKeys).toEqual(['a.ts']);
    expect(metricsMap.get('a.ts')).toEqual([
      {
        filePath: 'a.ts',
        key: 'a.ts-',
        name: '-',
        scope: 'file',
        scores: [
          {
            name: '1',
            betterDirection: 'higher',
            state: 'normal',
            value: 50,
            diff: 10,
            diffStr: '+10',
          },
        ],
        status: 'updated',
      },
    ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
  });

  test('betterDirection が higher かつ value が下降の場合は 🔻-10', () => {
    const baseFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'higher', state: 'normal', value: 50 },
        ],
      },
    ] satisfies CodeMetrics[];
    const headFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'higher', state: 'normal', value: 40 },
        ],
      },
    ] satisfies CodeMetrics[];
    const { metricsMap, sortedKeys } = createScoreDiff(
      headFileData,
      baseFileData,
    );
    expect(sortedKeys).toEqual(['a.ts']);
    expect(metricsMap.get('a.ts')).toEqual([
      {
        filePath: 'a.ts',
        key: 'a.ts-',
        name: '-',
        scope: 'file',
        scores: [
          {
            name: '1',
            betterDirection: 'higher',
            state: 'normal',
            value: 40,
            diff: -10,
            diffStr: '🔻-10',
          },
        ],
        status: 'updated',
      },
    ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
  });

  test('betterDirection が lower かつ value が上昇の場合は 🔺+10', () => {
    const baseFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'lower', state: 'normal', value: 40 },
        ],
      },
    ] satisfies CodeMetrics[];
    const headFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'lower', state: 'normal', value: 50 },
        ],
      },
    ] satisfies CodeMetrics[];
    const { metricsMap, sortedKeys } = createScoreDiff(
      headFileData,
      baseFileData,
    );
    expect(sortedKeys).toEqual(['a.ts']);
    expect(metricsMap.get('a.ts')).toEqual([
      {
        filePath: 'a.ts',
        key: 'a.ts-',
        name: '-',
        scope: 'file',
        scores: [
          {
            name: '1',
            betterDirection: 'lower',
            state: 'normal',
            value: 50,
            diff: 10,
            diffStr: '🔺+10',
          },
        ],
        status: 'updated',
      },
    ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
  });

  test('betterDirection が lower かつ value が下降の場合は -10', () => {
    const baseFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'lower', state: 'normal', value: 50 },
        ],
      },
    ] satisfies CodeMetrics[];
    const headFileData = [
      {
        filePath: 'a.ts',
        name: '-',
        scope: 'file',
        scores: [
          { name: '1', betterDirection: 'lower', state: 'normal', value: 40 },
        ],
      },
    ] satisfies CodeMetrics[];
    const { metricsMap, sortedKeys } = createScoreDiff(
      headFileData,
      baseFileData,
    );
    expect(sortedKeys).toEqual(['a.ts']);
    expect(metricsMap.get('a.ts')).toEqual([
      {
        filePath: 'a.ts',
        key: 'a.ts-',
        name: '-',
        scope: 'file',
        scores: [
          {
            name: '1',
            betterDirection: 'lower',
            state: 'normal',
            value: 40,
            diff: -10,
            diffStr: '-10',
          },
        ],
        status: 'updated',
      },
    ] satisfies (FlattenMatericsWithDiff & { key: string })[]);
  });
});
