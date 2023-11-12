import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import applyMutualDifferences from './applyMutualDifferences';
import github from '../github';

type FileInfoList = {
  filename: string;
  previous_filename: string | undefined;
}[];

/**
 * ファイルの削除またはリネームがある場合は Graph を2つ表示する
 */
export async function output2Graphs(
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
  const { baseGraph, headGraph, tsgCommand } = applyMutualDifferences(
    files.created.map(({ filename }) => filename),
    files.deleted.map(({ filename }) => filename),
    files.modified.map(({ filename }) => filename),
    files.renamed,
    fullBaseGraph,
    fullHeadGraph,
  );

  if (baseGraph.nodes.length === 0 && headGraph.nodes.length === 0) {
    // base と head のグラフが空の場合は表示しない
    return;
  }

  // base または head のグラフが大きすぎる場合は表示しない
  if (
    baseGraph.nodes.length > getMaxSize() ||
    headGraph.nodes.length > getMaxSize()
  ) {
    //  TODO: ワークフローのパラメータの場合の文言にする
    github.commentToPR(`
## TypeScript Graph - Diff

> 表示ノード数が多いため、グラフを表示しません。
> グラフを表示したい場合、環境変数 TSG_MAX_SIZE を設定してください。
>
> Base branch の表示ノード数: ${baseGraph.nodes.length}
> Head branch の表示ノード数: ${headGraph.nodes.length}
> 最大表示ノード数: ${getMaxSize()}

\`\`\`bash
${tsgCommand}
\`\`\`
`);
    return;
  }

  // base の書き出し
  const baseLines: string[] = [];
  await mermaidify((arg: string) => baseLines.push(arg), baseGraph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });

  // head の書き出し
  const headLines: string[] = [];
  await mermaidify((arg: string) => headLines.push(arg), headGraph, {
    rootDir: meta.rootDir,
    ...getOrientation(),
  });

  github.commentToPR(`
## TypeScript Graph - Diff

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
`);
}

/** isMermaidInDetails() の結果が true ならば与えられた文字列を返し、そうでなければ空文字を返す関数。 */
function outputIfInDetails(str: string): string {
  return isInDetails() ? str : '';
}
