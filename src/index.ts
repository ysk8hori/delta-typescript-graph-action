import { DangerDSLType } from '../node_modules/danger/distribution/dsl/DangerDSL';
import getRenameFiles from './getRenameFiles';
import getFullGraph from './getFullGraph';
import { outputGraph, output2Graphs } from './graph';

import { log } from './utils/log';
import { readRuntimeConfig } from './utils/config';
// Provides dev-time type structures for  `danger` - doesn't affect runtime.
declare let danger: DangerDSLType;
export declare function message(message: string): void;
export declare function warn(message: string): void;
export declare function fail(message: string): void;
export declare function markdown(message: string): void;

/**
 * Visualize the dependencies between files in the TypeScript code base.
 */
export default async function typescriptGraph() {
  // Replace this with the code from your Dangerfile
  const title = danger.github.pr.title;
  message(`PR Title: ${title}`);

  await makeGraph();
}

async function makeGraph() {
  readRuntimeConfig();

  // 以下の *_files は src/index.ts のようなパス文字列になっている
  const modified = danger.git.modified_files;
  log('modified:', modified);
  const created = danger.git.created_files;
  log('created:', created);
  const deleted = danger.git.deleted_files;
  log('deleted:', deleted);

  // .tsファイルの変更がある場合のみ Graph を生成する。コンパイル対象外の ts ファイルもあるかもしれないがわからないので気にしない
  if (
    ![modified, created, deleted].flat().some(file => /\.ts|\.tsx/.test(file))
  ) {
    return;
  }

  const [renamed, { fullHeadGraph, fullBaseGraph, meta }] = await Promise.all([
    getRenameFiles(),
    getFullGraph(),
  ]);
  log('renamed:', renamed);
  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);
  log('meta:', meta);

  // head のグラフが空の場合は何もしない
  if (fullHeadGraph.nodes.length === 0) return;

  const hasRenamed = fullHeadGraph.nodes.some(headNode =>
    renamed?.map(({ filename }) => filename).includes(headNode.path),
  );

  if (deleted.length !== 0 || hasRenamed) {
    // ファイルの削除またはリネームがある場合は Graph を2つ表示する
    await output2Graphs(fullBaseGraph, fullHeadGraph, meta, renamed);
  } else {
    await outputGraph(fullBaseGraph, fullHeadGraph, meta, renamed);
  }
}
