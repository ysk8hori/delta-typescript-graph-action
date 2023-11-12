/**
 * danger のコメント中に出力する tsg コマンドを生成する
 *
 * このコマンドは、danger のコメント中に出力するグラフとは異なる結果となるものであるが、あると便利と思われるので出力している。
 */
export function createTsgCommand({
  includes,
  excludes,
  abstractions,
}: {
  includes: string[];
  excludes: string[];
  abstractions: string[];
}) {
  const includeOption =
    includes.length === 0 ? '' : ` --include ${includes.join(' ')}`;
  const highlightOption =
    includes.length === 0 ? '' : ` --highlight ${includes.join(' ')}`;
  const excludeOption =
    excludes.length === 0 ? '' : ` --exclude ${excludes.join(' ')}`;
  const abstractionOption =
    abstractions.length === 0 ? '' : ` --abstraction ${abstractions.join(' ')}`;
  return `tsg ${includeOption}${highlightOption}${excludeOption}${abstractionOption}`;
}
