import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { z } from 'zod';
import type mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';

const dangerPluginTsgConfigScheme = z.object({
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

export type DangerPluginTsgConfigScheme = z.infer<
  typeof dangerPluginTsgConfigScheme
>;

let rc: DangerPluginTsgConfigScheme | undefined;

/**
 * @deprecated test用関数。テスト以外で使用しないでください。
 */
export function clearRuntimeConfig(): void {
  rc = undefined;
}

/** rcを取得する。プロセスにおいて1度だけファイルを読み込む。rcファイルが不正な場合は設定がないものとする。 */
export function readRuntimeConfig(
  filePath: string = path.join(process.cwd(), '.danger-tsgrc.json'),
): void {
  if (!existsSync(filePath)) {
    rc = {};
  }
  try {
    rc = dangerPluginTsgConfigScheme.parse(
      JSON.parse(readFileSync(filePath, 'utf-8')),
    );
  } catch (e) {
    rc = {};
    console.error(e);
  }
}

/**
 * tsconfig を探索するディレクトリ情報を取得する。
 *
 * ここで指定した階層から上の階層に向かって tsconfig を探索する。
 */
export function getTsconfigRoot(): string {
  return process.env.TSG_TSCONFIG_ROOT ?? rc?.tsconfigRoot ?? './';
}

/** 変更ファイル数が多い場合にグラフの表示を抑止するが、その際のノード数を指定する値を取得する。 */
export function getMaxSize(): number {
  return process.env.TSG_MAX_SIZE
    ? parseInt(process.env.TSG_MAX_SIZE, 10)
    : rc?.maxSize ?? 30;
}

/** グラフの方向を指定したオブジェクトを取得する */
export function getOrientation(): Pick<
  Parameters<typeof mermaidify>[2],
  'LR' | 'TB'
> {
  return process.env.TSG_ORIENTATION === 'TB'
    ? { TB: true }
    : process.env.TSG_ORIENTATION === 'LR'
    ? { LR: true }
    : rc?.orientation === 'TB'
    ? { TB: true }
    : rc?.orientation === 'LR'
    ? { LR: true }
    : {};
}

export function isDebugEnabled(): boolean {
  return process.env.TSG_DEBUG === 'true'
    ? true
    : process.env.TSG_DEBUG === 'false'
    ? false
    : rc?.debug ?? false;
}

/** Mermaid を `<details>` タグで囲み折りたたむかどうか */
export function isInDetails(): boolean {
  return process.env.TSG_IN_DETAILS === 'true'
    ? true
    : process.env.TSG_IN_DETAILS === 'false'
    ? false
    : rc?.inDetails ?? false;
}

export function exclude(): string[] {
  return rc?.exclude ?? [];
}

/** 変更対象のファイルが同階層の index.ts などから参照されている場合、その index.ts への依存ファイルも表示するかどうか */
export function isIncludeIndexFileDependencies(): boolean {
  return process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES === 'true'
    ? true
    : process.env.TSG_INCLUDE_INDEX_FILE_DEPENDENCIES === 'false'
    ? false
    : rc?.includeIndexFileDependencies ?? false;
}
