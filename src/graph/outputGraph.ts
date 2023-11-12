import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import mergeGraphsWithDifferences from './mergeGraphsWithDifferences';
declare let danger: DangerDSLType;
export declare function markdown(message: string): void;

export function outputGraph(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  meta: Meta,
  renamed:
    | {
        filename: string;
        previous_filename: string | undefined;
      }[]
    | undefined,
) {
  const modified = danger.git.modified_files;
  const created = danger.git.created_files;
  const deleted = danger.git.deleted_files;

  const { graph, tsgCommand } = mergeGraphsWithDifferences(
    fullBaseGraph,
    fullHeadGraph,
    created,
    deleted,
    modified,
    renamed,
  );

  if (graph.nodes.length === 0) {
    // グラフが空の場合は表示しない
    return;
  }

  if (graph.nodes.length > getMaxSize()) {
    // グラフが大きすぎる場合は表示しない
    markdown(`
## TypeScript Graph - Diff

> 表示ノード数が多いため、グラフを表示しません。
> グラフを表示したい場合、環境変数 TSG_MAX_SIZE を設定してください。
>
> 本PRでの表示ノード数: ${graph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}

\`\`\`bash
${tsgCommand}
\`\`\`
`);
    return;
  }

  const mermaidLines: string[] = [];
  mermaidify((arg: string) => mermaidLines.push(arg), graph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });

  markdown(`
## TypeScript Graph - Diff

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
`);
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
