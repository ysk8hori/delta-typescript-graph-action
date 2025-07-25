import type { mermaidify } from '@ysk8hori/typescript-graph';
import * as core from '@actions/core';
import { uniqueString } from './reducer';

/** tsconfig のルートディレクトリ */
const TSCONFIG_ROOT = 'tsconfig-root';
/** tsconfig のパス */
const TSCONFIG_PATH = 'tsconfig';
/** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値 */
const MAX_SIZE = 'max-size';
/** グラフの方向を指定する */
const ORIENTATION = 'orientation';
/** デバッグモード */
const DEBUG = 'debug';
/** Mermaid を `<details>` タグで囲み折りたたむかどうか */
const IN_DETAILS = 'in-details';
/** ファイルの除外対象 */
const EXCLUDE = 'exclude';
/** 変更対象のファイルが同階層の index.ts などから参照されている場合、その index.ts への依存ファイルも表示するかどうか */
const INCLUDE_INDEX_FILE_DEPENDENCIES = 'include-index-file-dependencies';
/** コメントのタイトル */
const COMMENT_TITLE = 'comment-title';
/** メトリクスを表示するかどうか */
const SHOW_METRICS = 'show-metrics';

/**
 * tsconfig を探索するディレクトリ情報を取得する。
 *
 * ここで指定した階層から上の階層に向かって tsconfig を探索する。
 */
export function getTsconfigRoot(): string {
  return core.getInput(TSCONFIG_ROOT) ?? './';
}

/**
 * tsconfig.json のパスを取得する。ファイル名が異なる場合などにはこちらを指定する。
 */
export function getTsconfigPath(): string | undefined {
  return core.getInput(TSCONFIG_PATH) ?? undefined;
}

/** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値を取得する。 */
export function getMaxSize(): number {
  const maxSize = core.getInput(MAX_SIZE);
  if (maxSize && !isNaN(parseInt(maxSize, 10))) {
    return parseInt(maxSize, 10);
  }
  return 30;
}

/** グラフの方向を指定したオブジェクトを取得する */
export function getOrientation(): Pick<
  Parameters<typeof mermaidify>[2],
  'LR' | 'TB'
> {
  const orientation = core.getInput(ORIENTATION);
  if (orientation === 'TB') {
    return { TB: true };
  }
  if (orientation === 'LR') {
    return { LR: true };
  }
  return {};
}

export function isDebugEnabled(): boolean {
  return core.getInput(DEBUG) === 'true';
}

/** Mermaid を `<details>` タグで囲み折りたたむかどうか */
export function isInDetails(): boolean {
  return core.getInput(IN_DETAILS) === 'true';
}

export function getShowMetrics(): boolean {
  return core.getInput(SHOW_METRICS) === 'true';
}

export function exclude(): string[] {
  return core
    .getInput(EXCLUDE)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .reduce(uniqueString, ['node_modules']); // デフォルトで node_modules を含める
}

/** 変更対象のファイルが同階層の index.ts などから参照されている場合、その index.ts への依存ファイルも表示するかどうか */
export function isIncludeIndexFileDependencies(): boolean {
  return core.getInput(INCLUDE_INDEX_FILE_DEPENDENCIES) === 'true';
}

/** コメントのタイトルを取得する */
export function getCommentTitle(): string {
  return core.getInput(COMMENT_TITLE) ?? 'Delta TypeScript Graph';
}

export type Config = ReturnType<typeof getConfig>;

export function getConfig() {
  return {
    tsconfigRoot: getTsconfigRoot(),
    tsconfig: getTsconfigPath(),
    maxSize: getMaxSize(),
    orientation: getOrientation(),
    debugEnabled: isDebugEnabled(),
    inDetails: isInDetails(),
    exclude: exclude(),
    includeIndexFileDependencies: isIncludeIndexFileDependencies(),
    /** Action の parameter として指定された comment-title */
    commentTitle: getCommentTitle(),
    showMetrics: getShowMetrics(),
  };
}
