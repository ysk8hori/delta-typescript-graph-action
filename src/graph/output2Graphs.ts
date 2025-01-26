import type { Graph } from '@ysk8hori/typescript-graph';
import { mermaidify } from '@ysk8hori/typescript-graph';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import { info } from '../utils/log';
import type { Context } from '../utils/context';
import type { PullRequestFilesInfo } from '../utils/github';
import applyMutualDifferences from './applyMutualDifferences';

/**
 * ファイルの削除またはリネームがある場合は Graph を2つ表示する
 */
export async function output2Graphs(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  files: Omit<PullRequestFilesInfo, 'unchanged'>,
  context: Context,
) {
  const { baseGraph, headGraph, tsgCommand } = applyMutualDifferences(
    files.created.map(({ filename }) => filename),
    files.deleted.map(({ filename }) => filename),
    files.modified.map(({ filename }) => filename),
    files.renamed,
    fullBaseGraph,
    fullHeadGraph,
    context,
  );

  const github = context.github;

  if (baseGraph.nodes.length === 0 && headGraph.nodes.length === 0) {
    // base と head のグラフが空の場合は表示しない
    await github.deleteComment(context.fullCommentTitle);
    info('The graph is empty.');
    return;
  }

  if (
    baseGraph.nodes.length > getMaxSize() ||
    headGraph.nodes.length > getMaxSize()
  ) {
    // base または head のグラフが大きすぎる場合は表示しない
    await github.commentToPR(
      context.fullCommentTitle,
      `
${context.fullCommentTitle}

${outputIfInDetails(`
<details>
<summary>mermaid</summary>
`)}

> 表示ノード数が多いため、グラフを表示しません。
> 表示ノード数の上限を変更したい場合はアクションのパラメータ \`max-size\` を設定してください。
>
> Base branch の表示ノード数: ${baseGraph.nodes.length}
> Head branch の表示ノード数: ${headGraph.nodes.length}

\`\`\`bash
${tsgCommand}
\`\`\`

${outputIfInDetails('</details>')}
`,
    );
    return;
  }

  // base の書き出し
  const baseLines: string[] = [];
  const orientation = getOrientation();
  await mermaidify(
    (arg: string) => baseLines.push(arg),
    baseGraph,
    orientation,
  );

  // head の書き出し
  const headLines: string[] = [];
  await mermaidify(
    (arg: string) => headLines.push(arg),
    headGraph,
    orientation,
  );

  await github.commentToPR(
    context.fullCommentTitle,
    `
${context.fullCommentTitle}

${outputIfInDetails(`
<details>
<summary>mermaid</summary>
`)}

\`\`\`bash
${tsgCommand}
\`\`\`

### Base Branch

\`\`\`mermaid
${baseLines.join('')}
\`\`\`

### Head Branch

\`\`\`mermaid
${headLines.join('')}
\`\`\`

${outputIfInDetails('</details>')}
`,
  );
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
