import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import mergeGraphsWithDifferences from './mergeGraphsWithDifferences';
import github from '../github';

type FileInfoList = {
  filename: string;
  previous_filename: string | undefined;
}[];

export function outputGraph(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  meta: Meta,
  files: {
    created: FileInfoList;
    deleted: FileInfoList;
    modified: FileInfoList;
    renamed: FileInfoList;
  },
) {
  const { graph, tsgCommand } = mergeGraphsWithDifferences(
    fullBaseGraph,
    fullHeadGraph,
    files.created.map(({ filename }) => filename),
    files.deleted.map(({ filename }) => filename),
    files.modified.map(({ filename }) => filename),
    files.renamed,
  );

  if (graph.nodes.length === 0) {
    // グラフが空の場合は表示しない
    return;
  }

  if (graph.nodes.length > getMaxSize()) {
    // グラフが大きすぎる場合は表示しない
    github.commentToPR(`
${github.getCommentTitle()}

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
`);
    return;
  }

  const mermaidLines: string[] = [];
  mermaidify((arg: string) => mermaidLines.push(arg), graph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });

  github.commentToPR(`
${github.getCommentTitle()}

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
