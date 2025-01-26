import type { Graph } from '@ysk8hori/typescript-graph';
import getFullGraph from './getFullGraph';
import { outputGraph, output2Graphs } from './graph';
import { info, log } from './utils/log';
import type { PullRequestFileInfo } from './utils/github';
import { createContext } from './utils/context';

async function makeGraph() {
  const context = await createContext();
  const { modified, created, deleted, renamed } = context.filesChanged;
  // 以下の *_files は src/index.ts のようなパス文字列になっている
  log('modified:', modified);
  log('created:', created);
  log('deleted:', deleted);
  log('renamed:', renamed);

  // .tsファイルの変更がある場合のみ Graph を生成する。コンパイル対象外の ts ファイルもあるかもしれないがわからないので気にしない
  if ([modified, created, deleted, renamed].flat().length === 0) {
    await context.github.deleteComment(context.config.commentTitle);
    info('No TypeScript files were changed.');
    return;
  }

  const { fullHeadGraph, fullBaseGraph } = await getFullGraph(context);
  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);

  // head のグラフが空の場合は何もしない
  if (fullHeadGraph.nodes.length === 0) return;

  if (deleted.length !== 0 || hasRenamedFiles(fullHeadGraph, renamed)) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    await output2Graphs(fullBaseGraph, fullHeadGraph, context);
  } else {
    await outputGraph(fullBaseGraph, fullHeadGraph, context);
  }
}

makeGraph().catch(err => {
  info('Error in delta-typescript-graph-action: ', err);
});

function hasRenamedFiles(fullHeadGraph: Graph, renamed: PullRequestFileInfo[]) {
  return fullHeadGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );
}
