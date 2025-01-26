import { execSync } from 'child_process';
import type { Graph } from '@ysk8hori/typescript-graph';
import {
  GraphAnalyzer,
  mergeGraph,
  ProjectTraverser,
  resolveTsconfig,
} from '@ysk8hori/typescript-graph';
import { isNot, map, pipe } from 'remeda';
import GitHub from './utils/github';
import { getCreateGraphsArguments } from './tsg/getCreateGraphsArguments';
import type { Context } from './utils/context';

/** word に該当するか */
const bindMatchFunc = (word: string) => (filePath: string) =>
  filePath.toLowerCase().includes(word.toLowerCase());
/** 抽象的な判定関数 */
const judge = (filePath: string) => (f: (filePath: string) => boolean) =>
  f(filePath);
const matchSome = (words: string[]) => (filePath: string) =>
  words.map(bindMatchFunc).some(judge(filePath));

/**
 * TypeScript Graph の createGraph を使い head と base の Graph を生成する
 *
 * 内部的に git fetch と git checkout を実行するので、テストで実行する際には execSync を mock すること。
 *
 * また、処理に時間がかかるため Promise を返す。
 */
export default function getFullGraph(context: Pick<Context, 'config'>) {
  const github = new GitHub();
  // head の Graph を生成するために head に checkout する
  execSync(`git fetch origin ${github.getHeadSha()}`);
  execSync(`git checkout ${github.getHeadSha()}`);

  const fullHeadGraph = getGraph(context);

  // base の Graph を生成するために base に checkout する
  execSync(`git fetch origin ${github.getBaseSha()}`);
  execSync(`git checkout ${github.getBaseSha()}`);
  // base の Graph を生成

  const fullBaseGraph = getGraph(context);

  return {
    fullHeadGraph,
    fullBaseGraph,
  };
}

function getGraph(context: Pick<Context, 'config'>) {
  const tsconfigInfo = getCreateGraphsArguments(context.config);
  // - tsconfig が指定されているが、そのファイルが存在しない場合は空のグラフとする
  //   （createGraph は指定された tsconfig がない場合、カレントディレクトリより上に向かって tsconfig.json を探すが、ここではそれをしたくない）
  // - tsconfig が指定されていない場合は、tsconfig-root から tsconfig.json を探索する
  if (!tsconfigInfo) {
    return {
      nodes: [],
      relations: [],
    } satisfies Graph;
  }

  const tsConfig = resolveTsconfig(tsconfigInfo);
  const traverserForHead = new ProjectTraverser(tsConfig);
  return pipe(
    traverserForHead.traverse(
      isNot(matchSome(context.config.exclude)),
      GraphAnalyzer.create,
    ),
    map(([analyzer]) => analyzer.generateGraph()),
    mergeGraph,
  );
}
