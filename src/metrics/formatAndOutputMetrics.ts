import type {
  CodeMetrics,
  Score,
} from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import { getIconByState } from '@ysk8hori/typescript-graph/feature/metric/functions/getIconByState.js';

/** メトリクスの差分をファイルごとに書き込む */
export function formatAndOutputMetrics(
  sortedKeys: string[],
  metricsMap: Map<
    string,
    (Omit<CodeMetrics, 'scores'> & {
      scores: (Score & { diff?: number; diffStr?: string })[];
      status: 'added' | 'deleted' | 'updated';
    })[]
  >,
  write: (str: string) => void,
) {
  for (const filePath of sortedKeys) {
    const scoreTitles =
      metricsMap
        .values()
        .next()
        .value?.[0].scores.map(score => score.name) ?? [];
    if (scoreTitles.length === 0) continue;
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
