import { Context } from '../utils/context';

/**
 * コメントに出力する tsg コマンドを生成する
 *
 * このコマンドは、コメント中に出力するグラフとは異なる結果となるものであるが、あると便利と思われるので出力している。
 */
export function createTsgCommand({
  includes,
  abstractions,
  context,
}: {
  includes: string[];
  abstractions: string[];
  context: Context;
}) {
  console.log('context.config', context.config);
  const includeOption =
    includes.length === 0 ? '' : ` --include ${includes.join(' ')}`;
  const highlightOption =
    includes.length === 0 ? '' : ` --highlight ${includes.join(' ')}`;
  const excludeOption =
    context.config.exclude.length === 0
      ? ''
      : ` --exclude ${context.config.exclude.join(' ')}`;
  const abstractionOption =
    abstractions.length === 0 ? '' : ` --abstraction ${abstractions.join(' ')}`;
  const tsconfigPath = context.config.tsconfigPath
    ? ` --tsconfig ${context.config.tsconfigPath}`
    : '';
  return `tsg ${includeOption}${highlightOption}${excludeOption}${abstractionOption}`;
}
