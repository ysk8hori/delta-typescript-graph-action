import type { ProjectTraverser } from '@ysk8hori/typescript-graph';
import { calculateCodeMetrics } from '@ysk8hori/typescript-graph/feature/metric/calculateCodeMetrics.js';
import type {
  CodeMetrics,
  Score,
} from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import { pipe } from 'remeda';
import { unTree } from '@ysk8hori/typescript-graph/utils/Tree.js';
import type { PullRequestFileInfo } from '../utils/github';
import type { Context } from '../utils/context';
import { createScoreDiff } from './createScoreDiff';
import { round } from './round';
import { formatAndOutputMetrics } from './formatAndOutputMetrics';

export function buildMetricsMessage({
  context,
  traverserForHead,
  traverserForBase,
  allModifiedFiles,
  write,
}: {
  context: Context;
  traverserForHead: ProjectTraverser | undefined;
  traverserForBase: ProjectTraverser | undefined;
  allModifiedFiles: PullRequestFileInfo[];
  write: (str: string) => void;
}): void {
  if (
    !context.config.showMetrics ||
    !traverserForHead ||
    !traverserForBase ||
    allModifiedFiles.length === 0
  ) {
    return;
  }

  write('## Metrics\n\n');
  const baseMetrics = generateScoreMetrics(traverserForBase, allModifiedFiles);
  const headMetrics = generateScoreMetrics(traverserForHead, allModifiedFiles);

  // メトリクスの差分を計算
  const { metricsMap, sortedKeys } = createScoreDiff(headMetrics, baseMetrics);

  // メトリクスの差分をファイルごとに書き込む
  formatAndOutputMetrics(sortedKeys, metricsMap, write);
  return;
}

function generateScoreMetrics(
  traverserForBase: ProjectTraverser,
  allModifiedFiles: PullRequestFileInfo[],
) {
  return pipe(
    calculateCodeMetrics({ metrics: true }, traverserForBase, filePath =>
      allModifiedFiles.map(v => v.filename).includes(filePath),
    ),
    unTree,
    toScoreFilteredMetrics,
    toScoreRoundedMetrics,
  );
}

function toScoreFilteredMetrics(metrics: CodeMetrics[]): CodeMetrics[] {
  return metrics.map(metric => ({
    ...metric,
    scores: metric.scores.filter(score =>
      [
        'Maintainability Index',
        'Cognitive Complexity',
        'semantic syntax volume',
      ].includes(score.name),
    ),
  }));
}

function toScoreRoundedMetrics(metrics: CodeMetrics[]): CodeMetrics[] {
  return metrics.map(metric => ({
    ...metric,
    scores: metric.scores.map(
      score =>
        ({
          ...score,
          value: round(score.value),
        }) satisfies Score,
    ),
  }));
}
