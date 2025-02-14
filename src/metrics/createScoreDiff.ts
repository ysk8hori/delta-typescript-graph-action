import type {
  CodeMetrics,
  Score,
} from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import { zip } from 'remeda';
import { round } from './round';

type ScoreWithDiff = Score & {
  diff?: number;
  diffStr?: string;
};

/** visible for testing */
export type FlattenMatericsWithDiff = Omit<CodeMetrics, 'scores'> & {
  scores: ScoreWithDiff[];
  status: 'added' | 'deleted' | 'updated';
};
export function createScoreDiff(
  headFileData: CodeMetrics[],
  baseFileData: CodeMetrics[],
): {
  metricsMap: Map<string, FlattenMatericsWithDiff[]>;
  sortedKeys: string[];
} {
  const headFileDataWithKey = headFileData.map(data => ({
    ...data,
    key: data.filePath + data.name,
  }));
  const baseFileDataWithKey = baseFileData.map(data => ({
    ...data,
    key: data.filePath + data.name,
  }));

  const scoresWithDiffMap = new Map<string, FlattenMatericsWithDiff>();
  for (const headData of headFileDataWithKey) {
    const baseData = baseFileDataWithKey.find(
      data => data.key === headData.key,
    );

    if (!baseData) {
      scoresWithDiffMap.set(headData.key, { ...headData, status: 'added' });
      continue;
    }

    // scores の中身は同じ順番であることが前提
    const scores = calculateScoreDifferences(headData, baseData);

    scoresWithDiffMap.set(headData.key, {
      ...headData,
      scores,
      status: 'updated',
    });
  }

  for (const baseData of baseFileDataWithKey) {
    if (!scoresWithDiffMap.has(baseData.key)) {
      scoresWithDiffMap.set(baseData.key, { ...baseData, status: 'deleted' });
    }
  }

  const array = Array.from(scoresWithDiffMap.values());
  const metricsMap = array.reduce((map, currentValue) => {
    const filePath = currentValue.filePath;
    if (!map.has(filePath)) {
      map.set(filePath, []);
    }
    map.get(filePath)?.push(currentValue);
    return map;
  }, new Map<string, FlattenMatericsWithDiff[]>());
  const sortedKeys = getSortedKeys(metricsMap);
  return { metricsMap, sortedKeys };
}

function calculateScoreDifferences(
  headData: CodeMetrics,
  baseData: CodeMetrics,
): ScoreWithDiff[] {
  const zipped = zip(headData.scores, baseData.scores);
  const scores = zipped.map(([headScore, baseScore]) => {
    const diff = round(round(headScore.value) - round(baseScore.value));
    return {
      ...headScore,
      diff,
      diffStr: getChalkedDiff(headScore.betterDirection, diff),
    };
  });
  return scores;
}
function getChalkedDiff(
  betterDirection: Score['betterDirection'],
  diff: number | undefined,
): string | undefined {
  if (diff === undefined) return '';
  if (betterDirection === 'lower' && diff < 0) return `${diff}`;
  if (betterDirection === 'lower' && 0 < diff) return `🔺+${diff}`;
  if (betterDirection === 'higher' && diff < 0) return `🔻${diff}`;
  if (betterDirection === 'higher' && 0 < diff) return `+${diff}`;
  return undefined;
}

function getSortedKeys(map: Map<string, FlattenMatericsWithDiff[]>) {
  const keys = Array.from(map.keys());
  const sortedKeys = keys
    .map(key => map.get(key))
    .filter(Boolean)
    .map(fileGroupedMetrics => fileGroupedMetrics.find(m => m.scope === 'file'))
    .filter(Boolean)
    .toSorted((a, b) => (a.scores[0]?.value ?? 0) - (b.scores[0]?.value ?? 0))
    .map(m => m?.filePath);
  return sortedKeys;
}
