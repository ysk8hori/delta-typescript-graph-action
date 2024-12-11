import getFullGraph from './getFullGraph';
import { outputGraph, output2Graphs } from './graph';
import { info, log } from './utils/log';
import GitHub, { PullRequestFileInfo } from './utils/github';

async function makeGraph() {
  const github = new GitHub();
  // 以下の *_files は src/index.ts のようなパス文字列になっている
  const {
    created,
    deleted,
    modified,
    renamed,
    unchanged: _,
  } = await github.getTSFiles();
  log('modified:', modified);
  log('created:', created);
  log('deleted:', deleted);
  log('renamed:', renamed);

  // .tsファイルの変更がある場合のみ Graph を生成する。コンパイル対象外の ts ファイルもあるかもしれないがわからないので気にしない
  if ([modified, created, deleted, renamed].flat().length === 0) {
    await github.deleteComment();
    info('No TypeScript files were changed.');
    return;
  }

  const { fullHeadGraph, fullBaseGraph, meta } = await getFullGraph();
  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);
  log('meta:', meta);

  // head のグラフが空の場合は何もしない
  if (fullHeadGraph.nodes.length === 0) return;

  // meta が返らない場合は解析できていないので何もしない
  if (!meta) return;

  const hasRenamed = fullHeadGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );

  /**  パスの開始部分から meta の rootDir を除去する */
  function removeRootDir(fileInfo: PullRequestFileInfo): PullRequestFileInfo {
    return {
      ...fileInfo,
      filename: fileInfo.filename.replace(
        new RegExp(`^${meta.rootDir.replace(/^.\//, '')}`),
        '',
      ),
    };
  }

  if (deleted.length !== 0 || hasRenamed) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    await output2Graphs(fullBaseGraph, fullHeadGraph, meta, {
      created: created.map(removeRootDir),
      deleted: deleted.map(removeRootDir),
      modified: modified.map(removeRootDir),
      renamed: renamed.map(removeRootDir),
    });
  } else {
    await outputGraph(fullBaseGraph, fullHeadGraph, meta, {
      // パスの開始部分から meta の rootDir を除去する
      created: created.map(removeRootDir),
      deleted: deleted.map(removeRootDir),
      modified: modified.map(removeRootDir),
      renamed: renamed.map(removeRootDir),
    });
  }
}

makeGraph().catch(err => {
  info('Error in delta-typescript-graph-action: ', err);
});
