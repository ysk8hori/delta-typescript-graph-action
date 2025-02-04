import type { ProjectTraverser } from '@ysk8hori/typescript-graph';
import { calculateCodeMetrics } from '@ysk8hori/typescript-graph/feature/metric/calculateCodeMetrics.js';
import type {
  CodeMetrics,
  Score,
} from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import { pipe } from 'remeda';
import { getIconByState } from '@ysk8hori/typescript-graph/feature/metric/functions/getIconByState.js';
import { unTree } from '@ysk8hori/typescript-graph/utils/Tree.js';
import type { PullRequestFileInfo } from '../utils/github';
import type { Context } from '../utils/context';
import { createScoreDiff } from './createScoreDiff';
import { round } from './round';

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
  const scoreTitles = headMetrics[0].scores.map(score => score.name);

  // メトリクスの差分を計算
  const { metricsMap, sortedKeys } = createScoreDiff(headMetrics, baseMetrics);

  // メトリクスの差分をファイルごとに表示
  formatAndOutputMetrics(sortedKeys, metricsMap, write, scoreTitles);
  return;
}

/** メトリクスの差分をファイルごとに表示 */
function formatAndOutputMetrics(
  sortedKeys: string[],
  metricsMap: Map<
    string,
    (Omit<CodeMetrics, 'scores'> & {
      scores: (Score & { diff?: number; diffStr?: string })[];
      status: 'added' | 'deleted' | 'updated';
    })[]
  >,
  write: (str: string) => void,
  scoreTitles: string[],
) {
  for (const filePath of sortedKeys) {
    const metrics = metricsMap.get(filePath);
    if (!metrics) continue;
    const isNewFile = metrics[0]?.status === 'added';
    write(`### ${isNewFile ? '🆕 ' : ''}${filePath}\n\n`);

    if (metrics.length === 0 || metrics[0].status === 'deleted') {
      write('🗑️ This file has been deleted.\n\n');
      continue;
    }

    // メトリクスのヘッダー
    write(`name | scope | ` + scoreTitles.join(' | ') + '\n');

    // メトリクスのヘッダーの区切り
    write(`-- | -- | ` + scoreTitles.map(() => '--:').join(' | ') + '\n');

    // メトリクスの本体
    for (const metric of metrics) {
      write(
        `${formatMetricName(metric, isNewFile)} | ${metric.scope} | ` +
          metric.scores.map(formatScore).join(' | ') +
          '\n',
      );
    }
    write('\n\n');
  }
}

function formatScore(
  score: Score & { diff?: number; diffStr?: string },
): string {
  return `${
    score.diffStr
      ? // 全角カッコを使うことで余白を取っている
        `（${score.diffStr}）`
      : ''
  }${getIconByState(score.state)}${score.value}`;
}

function formatMetricName(
  metric: Omit<CodeMetrics, 'scores'> & {
    scores: (Score & { diff?: number; diffStr?: string })[];
    status: 'added' | 'deleted' | 'updated';
  },
  isNewFile: boolean,
) {
  return metric.scope === 'file'
    ? '~'
    : `${metric.status === 'added' && !isNewFile ? `🆕 ${metric.name}` : metric.status === 'deleted' ? `🗑️  ~~${metric.name}~~` : metric.name}`;
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
