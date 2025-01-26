import path from 'path';
import type { Context } from '../utils/context';

/**
 * コメントに出力する tsg コマンドを生成する
 *
 * このコマンドは、厳密にはコメント中に出力するグラフとは異なる結果となるものであるが、あると便利と思われるので出力している。
 */
export function createTsgCommand({
  includes,
  abstractions,
  context,
}: {
  includes: string[];
  abstractions: string[];
  context: Pick<Context, 'config'>;
}) {
  const tsconfigRoot = context.config.tsconfig
    ? path
        .relative('./', path.resolve(context.config.tsconfig))
        ?.split('/')
        .slice(0, -1)
        .join('/')
        .concat('/')
    : undefined; // context.config.tsconfigRoot は一旦考えない
  // TODO: tsg は tsconfig から相対パスでファイルパスを出力しないようになったら、以下の関数は使用しないようにする。
  // 現状、tsg コマンドで指定可能なファイルのパスは、--tsconfig からの相対パスとなる。
  // しかし、Delta TypeScript Graph Action においてはリポジトリのルートからの相対パスで指定になっている。
  // そのため、ここで入力された includes 等々のパスは tsg に合わせて tsconfig からの相対パスに変換する。
  function convertToRelatedPathFromTsconfig(path: string) {
    if (!tsconfigRoot) return path;
    return path.replace(new RegExp(`^${tsconfigRoot}`), '');
  }

  const includeOption =
    includes.length === 0
      ? ''
      : `--include ${includes.map(convertToRelatedPathFromTsconfig).join(' ')}`;
  const highlightOption =
    includes.length === 0
      ? ''
      : `--highlight ${includes.map(convertToRelatedPathFromTsconfig).join(' ')}`;
  const excludeOption =
    context.config.exclude.length === 0
      ? ''
      : `--exclude ${context.config.exclude.map(convertToRelatedPathFromTsconfig).join(' ')}`;
  const abstractionOption =
    abstractions.length === 0
      ? ''
      : `--abstraction ${abstractions.map(convertToRelatedPathFromTsconfig).join(' ')}`;
  const tsconfig = context.config.tsconfig
    ? `--tsconfig ${context.config.tsconfig}`
    : '';
  return [
    'tsg',
    includeOption,
    highlightOption,
    excludeOption,
    abstractionOption,
    tsconfig,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}
