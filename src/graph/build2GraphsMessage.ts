import type { Graph } from '@ysk8hori/typescript-graph';
import { mermaidify } from '@ysk8hori/typescript-graph';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import type { Context } from '../utils/context';
import applyMutualDifferences from './applyMutualDifferences';

/**
 * ファイルの削除またはリネームがある場合は Graph を2つ表示する
 */
export function build2GraphsMessage(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  context: Context,
): string {
  const { baseGraph, headGraph, tsgCommand } = applyMutualDifferences(
    fullBaseGraph,
    fullHeadGraph,
    context,
  );

  if (baseGraph.nodes.length === 0 && headGraph.nodes.length === 0) {
    // base と head のグラフが空の場合は表示しない
    return 'The graph is empty.\n\n';
  }

  if (
    baseGraph.nodes.length > getMaxSize() ||
    headGraph.nodes.length > getMaxSize()
  ) {
    // base または head のグラフが大きすぎる場合は表示しない
    return buildGraphSizeExceededMessage(baseGraph, headGraph, tsgCommand);
  }

  // base の書き出し
  const baseLines: string[] = [];
  const orientation = getOrientation();
  mermaidify((arg: string) => baseLines.push(arg), baseGraph, orientation);

  // head の書き出し
  const headLines: string[] = [];
  mermaidify((arg: string) => headLines.push(arg), headGraph, orientation);

  return buildNormal2GraphMessage(tsgCommand, baseLines, headLines);
}

function buildNormal2GraphMessage(
  tsgCommand: string,
  baseLines: string[],
  headLines: string[],
): string {
  return `
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

`;
}

function buildGraphSizeExceededMessage(
  baseGraph: Graph,
  headGraph: Graph,
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
> Base branch の表示ノード数: ${baseGraph.nodes.length}
> Head branch の表示ノード数: ${headGraph.nodes.length}

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
