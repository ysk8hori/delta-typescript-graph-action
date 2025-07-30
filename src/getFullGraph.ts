import { execSync } from 'child_process';
import type { Graph } from '@ysk8hori/typescript-graph';
import {
  GraphAnalyzer,
  mergeGraph,
  ProjectTraverser,
  resolveTsconfig,
} from '@ysk8hori/typescript-graph';
import { anyPass, isNot, map, pipe } from 'remeda';
import { getCreateGraphsArguments } from './tsg/getCreateGraphsArguments';
import type { Context } from './utils/context';
import { isInTsconfigScope } from './utils/tsconfigPath';

/** word に該当するか */
const bindMatchFunc = (word: string) => (filePath: string) =>
  filePath.toLowerCase().includes(word.toLowerCase());
/** word に完全一致するか */
const bindExactMatchFunc = (word: string) => (filePath: string) =>
  filePath === word;
/** 抽象的な判定関数 */
const judge = (filePath: string) => (f: (filePath: string) => boolean) =>
  f(filePath);
/** いずれかの word に該当するか */
const matchSome = (words: string[]) => (filePath: string) =>
  words.map(bindMatchFunc).some(judge(filePath));
/** いずれかの word に完全一致するか */
const isExactMatchSome = (words: string[]) => (filePath: string) =>
  words.map(bindExactMatchFunc).some(judge(filePath));

/**
 * TypeScript Graph の createGraph を使い head と base の Graph を生成する
 *
 * 内部的に git fetch と git checkout を実行するので、テストで実行する際には execSync を mock すること。
 */
export function getFullGraph(
  context: Pick<Context, 'config' | 'filesChanged' | 'github'>,
): {
  fullHeadGraph: Graph;
  fullBaseGraph: Graph;
  traverserForHead: ProjectTraverser | undefined;
  traverserForBase: ProjectTraverser | undefined;
} {
  // head の Graph を生成するために head に checkout する
  execSync(`git fetch origin ${context.github.getHeadSha()}`);
  execSync(`git checkout ${context.github.getHeadSha()}`);
  const [fullHeadGraph, traverserForHead] = getGraph(context);

  // base の Graph を生成するために base に checkout する
  execSync(`git fetch origin ${context.github.getBaseSha()}`);
  execSync(`git checkout ${context.github.getBaseSha()}`);
  const [fullBaseGraph, traverserForBase] = getGraph(context);

  return {
    fullHeadGraph,
    fullBaseGraph,
    traverserForHead,
    traverserForBase,
  };
}

function getGraph(
  context: Pick<Context, 'config' | 'filesChanged'>,
): [Graph, ProjectTraverser | undefined] {
  const { modified, created, deleted, renamed } = context.filesChanged;
  const allChangedFiles = [modified, created, deleted, renamed]
    .flat()
    .map(v => v.filename);
  const tsconfigInfo = getCreateGraphsArguments(context.config);
  // - tsconfig が指定されているが、そのファイルが存在しない場合は空のグラフとする
  //   （createGraph は指定された tsconfig がない場合、カレントディレクトリより上に向かって tsconfig.json を探すが、ここではそれをしたくない）
  // - tsconfig が指定されていない場合は、tsconfig-root から tsconfig.json を探索する
  if (!tsconfigInfo) {
    return [
      {
        nodes: [],
        relations: [],
      } satisfies Graph,
      undefined,
    ];
  }

  const tsConfig = resolveTsconfig(tsconfigInfo);
  const traverser = new ProjectTraverser(tsConfig);

  // Filter out files that are outside of the tsconfig scope
  const filesInScope = allChangedFiles.filter(file =>
    isInTsconfigScope(file, context.config),
  );

  // If no files are in scope, return an empty graph
  if (filesInScope.length === 0) {
    return [
      {
        nodes: [],
        relations: [],
      } satisfies Graph,
      undefined,
    ];
  }

  return [
    pipe(
      traverser.traverse(
        anyPass([
          isExactMatchSome(filesInScope),
          isNot(matchSome(context.config.exclude)),
        ]),
        GraphAnalyzer.create,
      ),
      map(([analyzer]) => analyzer.generateGraph()),
      mergeGraph,
    ),
    traverser,
  ] as const;
}
