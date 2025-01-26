import type { Graph } from '@ysk8hori/typescript-graph';
import { mermaidify } from '@ysk8hori/typescript-graph';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import { info } from '../utils/log';
import type { Context } from '../utils/context';
import mergeGraphsWithDifferences from './mergeGraphsWithDifferences';

export async function outputGraph(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  context: Context,
) {
  const github = context.github;
  const { graph, tsgCommand } = mergeGraphsWithDifferences(
    fullBaseGraph,
    fullHeadGraph,
    context,
  );

  if (graph.nodes.length === 0) {
    // グラフが空の場合は表示しない
    await github.deleteComment(context.fullCommentTitle);
    info('The graph is empty.');
    return;
  }

  if (graph.nodes.length > getMaxSize()) {
    // グラフが大きすぎる場合は表示しない
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
> 本PRでの表示ノード数: ${graph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}

\`\`\`bash
${tsgCommand}
\`\`\`

${outputIfInDetails('</details>')}
`,
    );
    return;
  }

  const mermaidLines: string[] = [];
  await mermaidify(
    (arg: string) => mermaidLines.push(arg),
    graph,
    getOrientation(),
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

\`\`\`mermaid
${mermaidLines.join('')}
\`\`\`

${outputIfInDetails('</details>')}
`,
  );
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
