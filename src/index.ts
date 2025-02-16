import type { Graph } from '@ysk8hori/typescript-graph';
import { getFullGraph } from './getFullGraph';
import { info, log } from './utils/log';
import type { PullRequestFileInfo } from './utils/github';
import { createContext } from './utils/context';
import { build2GraphsMessage } from './graph/build2GraphsMessage';
import { buildGraphMessage } from './graph/buildGraphMessage';
import { buildMetricsMessage } from './metrics/buildMetricsMessage';

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
    getFullGraph(context);
  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);

  // head のグラフが空の場合は何もしない
  if (fullHeadGraph.nodes.length === 0) return;

  let message = '';

  if (deleted.length !== 0 || hasRenamedFiles(fullHeadGraph, renamed)) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    message += build2GraphsMessage(fullBaseGraph, fullHeadGraph, context);
  } else {
    message += buildGraphMessage(fullBaseGraph, fullHeadGraph, context);
  }

  buildMetricsMessage({
    context,
    traverserForHead,
    traverserForBase,
    allModifiedFiles,
    write: str => (message += str),
  });

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
