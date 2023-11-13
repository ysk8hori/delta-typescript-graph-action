// TODO: ワークフローからパラメータを受け取って使用するようにする

import { z } from 'zod';
import type mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import * as core from '@actions/core';
import { log } from './log';

/** tsconfig のルートディレクトリ */
const TSCONFIG_ROOT = 'tsconfig-root';
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

const tsgConfigScheme = z.object({
  /** tsconfig のルートディレクトリ */
  tsconfigRoot: z.string().optional(),
  /** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値 */
  maxSize: z.number().optional(),
  /** グラフの方向を指定する */
  orientation: z.union([z.literal('TB'), z.literal('LR')]).optional(),
  /** デバッグモード */
  debug: z.boolean().optional(),
  /** Mermaid を `<details>` タグで囲み折りたたむかどうか */
  inDetails: z.boolean().optional(),
  /** ファイルの除外対象 */
  exclude: z.array(z.string()).optional(),
  /** 変更対象のファイルが同階層の index.ts などから参照されている場合、その index.ts への依存ファイルも表示するかどうか */
  includeIndexFileDependencies: z.boolean().optional(),
});

export type TsgConfigScheme = z.infer<typeof tsgConfigScheme>;

export function loggingConfig() {
  log(TSCONFIG_ROOT, core.getInput(TSCONFIG_ROOT));
  log(MAX_SIZE, core.getInput(MAX_SIZE));
  log(ORIENTATION, core.getInput(ORIENTATION));
  log(DEBUG, core.getInput(DEBUG));
  log(IN_DETAILS, core.getInput(IN_DETAILS));
  log(EXCLUDE, core.getInput(EXCLUDE));
  log(
    INCLUDE_INDEX_FILE_DEPENDENCIES,
    core.getInput(INCLUDE_INDEX_FILE_DEPENDENCIES),
  );

  // それぞれの値を core.getInput で取得し、取得したままの値をオブジェクトにして JSON にして出力する
  const config = {
    tsconfigRoot: core.getInput(TSCONFIG_ROOT),
    maxSize: core.getInput(MAX_SIZE),
    orientation: core.getInput(ORIENTATION),
    debug: core.getInput(DEBUG),
    inDetails: core.getInput(IN_DETAILS),
    exclude: core.getInput(EXCLUDE),
    includeIndexFileDependencies: core.getInput(
      INCLUDE_INDEX_FILE_DEPENDENCIES,
    ),
  };
  // json にして出力する
  log('config:', JSON.stringify(config));
}

/**
 * tsconfig を探索するディレクトリ情報を取得する。
 *
 * ここで指定した階層から上の階層に向かって tsconfig を探索する。
 */
export function getTsconfigRoot(): string {
  return core.getInput(TSCONFIG_ROOT) ?? './';
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

export function exclude(): string[] {
  // return rc?.exclude ?? [];
  log('exclude', core.getInput(EXCLUDE));
  return [];
}

/** 変更対象のファイルが同階層の index.ts などから参照されている場合、その index.ts への依存ファイルも表示するかどうか */
export function isIncludeIndexFileDependencies(): boolean {
  // return process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES === 'true'
  //   ? true
  //   : process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES === 'false'
  //   ? false
  //   : rc?.includeIndexFileDependencies ?? false;
  return core.getInput(INCLUDE_INDEX_FILE_DEPENDENCIES) === 'true';
}
