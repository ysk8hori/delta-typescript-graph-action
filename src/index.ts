import type { Graph } from '@ysk8hori/typescript-graph';
import { calculateCodeMetrics } from '@ysk8hori/typescript-graph/feature/metric/calculateCodeMetrics.js';
import type {
  CodeMetrics,
  Score,
} from '@ysk8hori/typescript-graph/feature/metric/metricsModels.js';
import { zip } from 'remeda';
import { getIconByState } from '@ysk8hori/typescript-graph/feature/metric/functions/getIconByState.js';
import getFullGraph from './getFullGraph';
import { info, log } from './utils/log';
import type { PullRequestFileInfo } from './utils/github';
import { createContext } from './utils/context';
import { build2GraphsMessage } from './graph/build2GraphsMessage';
import { buildGraphMessage } from './graph/buildGraphMessage';

async function makeGraph() {
  const context = await createContext();
  const { modified, created, deleted, renamed } = context.filesChanged;
  // 以下の *_files は src/index.ts のようなパス文字列になっている
  log('modified:', modified);
  log('created:', created);
  log('deleted:', deleted);
  log('renamed:', renamed);
  const allModifiedFiles = [modified, created, deleted, renamed].flat();

  // .tsファイルの変更がある場合のみ Graph を生成する。コンパイル対象外の ts ファイルもあるかもしれないがわからないので気にしない
  if (allModifiedFiles.length === 0) {
    await context.github.deleteComment(context.config.commentTitle);
    info('No TypeScript files were changed.');
    return;
  }

  const { fullHeadGraph, fullBaseGraph, traverserForHead, traverserForBase } =
    await getFullGraph(context);
  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);

  // head のグラフが空の場合は何もしない
  if (fullHeadGraph.nodes.length === 0) return;

  let message = '';

  if (deleted.length !== 0 || hasRenamedFiles(fullHeadGraph, renamed)) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    message += await build2GraphsMessage(fullBaseGraph, fullHeadGraph, context);
  } else {
    message += await buildGraphMessage(fullBaseGraph, fullHeadGraph, context);
  }

  if (traverserForHead && traverserForBase && allModifiedFiles.length !== 0) {
    message += '## Metrics\n\n';
    const baseMetrics = calculateCodeMetrics(
      { metrics: true },
      traverserForBase,
      filePath => allModifiedFiles.map(v => v.filename).includes(filePath),
    );

    const headMetrics = calculateCodeMetrics(
      { metrics: true },
      traverserForHead,
      filePath => allModifiedFiles.map(v => v.filename).includes(filePath),
    );
    const scoreTitles = headMetrics[0].scores.map(score => score.name);

    // メトリクスの差分を計算
    const metricsMap = createScoreDiff(headMetrics, baseMetrics);

    // メトリクスの差分をファイルごとに表示
    for (const [filePath, metrics] of metricsMap) {
      console.log('metrics:', metrics.length, filePath);
      message += `### ${filePath}\n\n`;
      // メトリクスのヘッダー
      message += `name | scope | ` + scoreTitles.join(' | ') + '\n';

      // メトリクスのヘッダーの区切り
      message +=
        `--- | --- | ` + scoreTitles.map(() => '---').join(' | ') + '\n';

      // メトリクスの本体
      for (const metric of metrics) {
        message +=
          `${metric.name} | ${metric.scope} | ` +
          metric.scores
            .map(
              score =>
                `${getIconByState(score.state)}${score.value}${score.diff ? `<br>(${score.diff})` : ''}`,
            )
            .join(' | ') +
          '\n';
      }
    }
  }

  await context.github.commentToPR(context.fullCommentTitle, message);
}

makeGraph().catch(err => {
  info('Error in delta-typescript-graph-action: ', err);
});

function hasRenamedFiles(fullHeadGraph: Graph, renamed: PullRequestFileInfo[]) {
  return fullHeadGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );
}

type ScoreWithDiff = Score & {
  diff?: number;
};
type FlattenMatericsWithDiff = Omit<CodeMetrics, 'scores'> & {
  scores: ScoreWithDiff[];
  status: 'added' | 'deleted' | 'updated';
};
function createScoreDiff(
  headFileData: CodeMetrics[],
  baseFileData: CodeMetrics[],
): Map<string, FlattenMatericsWithDiff[]> {
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
    const zipped = zip(headData.scores, baseData.scores);
    const scores = zipped.map(([headScore, baseScore]) => {
      return {
        ...headScore,
        value: round(headScore.value),
        diff: round(round(headScore.value) - round(baseScore.value)),
      };
    });

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
  return array.reduce((map, currentValue) => {
    const filePath = currentValue.filePath;
    if (!map.has(filePath)) {
      console.log('new file found:', filePath);
      map.set(filePath, []);
    }
    console.log('push:', filePath, currentValue.name);
    map.get(filePath)?.push(currentValue);
    return map;
  }, new Map<string, FlattenMatericsWithDiff[]>());
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
