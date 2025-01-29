import type { Graph } from '@ysk8hori/typescript-graph';
import { mermaidify } from '@ysk8hori/typescript-graph';
import { isInDetails } from '../utils/config';
import type { Context } from '../utils/context';
import mergeGraphsWithDifferences from './mergeGraphsWithDifferences';

export function buildGraphMessage(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  context: Context,
): string {
  const { graph, tsgCommand } = mergeGraphsWithDifferences(
    fullBaseGraph,
    fullHeadGraph,
    context,
  );

  if (graph.nodes.length === 0) {
    return 'The graph is empty.\n\n';
  }

  if (graph.nodes.length > context.config.maxSize) {
    // グラフが大きすぎる場合は表示しない
    return buildGraphSizeExceededMessage(graph, context, tsgCommand);
  }

  const mermaidLines: string[] = [];
  mermaidify(
    (arg: string) => mermaidLines.push(arg),
    graph,
    context.config.orientation,
  );

  return buildNormalGraphMessage(tsgCommand, mermaidLines);
}

function buildNormalGraphMessage(
  tsgCommand: string,
  mermaidLines: string[],
): string {
  return `
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

`;
}

function buildGraphSizeExceededMessage(
  graph: Graph,
  context: Context,
  tsgCommand: string,
): string {
  return `
${outputIfInDetails(`
<details>
<summary>mermaid</summary>
`)}

> 表示ノード数が多いため、グラフを表示しません。
> 表示ノード数の上限を変更したい場合はアクションのパラメータ \`max-size\` を設定してください。
>
> 本PRでの表示ノード数: ${graph.nodes.length}
> 最大表示ノード数: ${context.config.maxSize}

\`\`\`bash
${tsgCommand}
\`\`\`

${outputIfInDetails('</details>')}

`;
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
