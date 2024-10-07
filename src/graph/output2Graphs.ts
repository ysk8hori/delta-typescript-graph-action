import mermaidify from '@ysk8hori/typescript-graph/dist/src/mermaidify';
import { Graph, Meta } from '@ysk8hori/typescript-graph/dist/src/models';
import { getMaxSize, getOrientation, isInDetails } from '../utils/config';
import applyMutualDifferences from './applyMutualDifferences';
import GitHub from '../utils/github';
import { info } from '../utils/log';

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

  const github = new GitHub();

  if (baseGraph.nodes.length === 0 && headGraph.nodes.length === 0) {
    // base と head のグラフが空の場合は表示しない
    await github.deleteComment();
    info('The graph is empty.');
    return;
  }

  if (
    baseGraph.nodes.length > getMaxSize() ||
    headGraph.nodes.length > getMaxSize()
  ) {
    // base または head のグラフが大きすぎる場合は表示しない
    await github.commentToPR(`
${github.getCommentTitle()}

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

  await github.commentToPR(`
${github.getCommentTitle()}

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
