import { createGraph } from '@ysk8hori/typescript-graph/dist/src/graph/createGraph';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { execSync } from 'child_process';
import { log } from './utils/log';
import { getTsconfigRoot, getTsconfigPath } from './utils/config';
import path from 'path';
import GitHub from './utils/github';
import { getCreateGraphsArguments } from './tsg/getCreateGraphsArguments';

const emptyGraph = {
  graph: {
    nodes: [],
    relations: [],
  } as Graph,
  meta: undefined,
} as const;

/**
 * TypeScript Graph の createGraph を使い head と base の Graph を生成する
 *
 * 内部的に git fetch と git checkout を実行するので、テストで実行する際には execSync を mock すること。
 *
 * また、処理に時間がかかるため Promise を返す。
 */
export default function getFullGraph() {
  const github = new GitHub();
  // head の Graph を生成するために head に checkout する
  execSync(`git fetch origin ${github.getHeadSha()}`);
  execSync(`git checkout ${github.getHeadSha()}`);

  // - tsconfig-path が指定されているが、そのファイルが存在しない場合は空のグラフとする
  //   （createGraph は指定された tsconfig がない場合、カレントディレクトリより上に向かって tsconfig.json を探すが、ここではそれをしたくない）
  // - tsconfig-path が指定されていない場合は、tsconfig-root から tsconfig.json を探索する
  const tsconfigPath = getTsconfigPath();
  const tsconfigRoot = getTsconfigRoot();
  const argumentsForHeadBranch = getCreateGraphsArguments({
    tsconfigPath,
    tsconfigRoot,
  });
  const { graph: fullHeadGraph, meta: headMeta } = argumentsForHeadBranch
    ? createGraph(argumentsForHeadBranch)
    : emptyGraph;
  log('fullHeadGraph.nodes.length:', fullHeadGraph.nodes.length);
  log('fullHeadGraph.relations.length:', fullHeadGraph.relations.length);

  // base の Graph を生成するために base に checkout する
  execSync(`git fetch origin ${github.getBaseSha()}`);
  execSync(`git checkout ${github.getBaseSha()}`);
  // base の Graph を生成

  const argumentsForBaseBranch = getCreateGraphsArguments({
    tsconfigPath,
    tsconfigRoot,
  });
  const { graph: fullBaseGraph, meta: baseMeta } = argumentsForBaseBranch
    ? createGraph(argumentsForBaseBranch)
    : emptyGraph;

  log('fullBaseGraph.nodes.length:', fullBaseGraph.nodes.length);
  log('fullBaseGraph.relations.length:', fullBaseGraph.relations.length);
  return { fullHeadGraph, fullBaseGraph, meta: headMeta ?? baseMeta };
}
