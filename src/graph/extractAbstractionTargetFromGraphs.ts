import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';

/**
 * graph に含まれる抽象化されたノードのパスのリストを返す
 *
 * もともとは tsg コマンド生成時にも extractNoAbstractionDirs や extractAbstractionTarget を使って抽出した abstractionTarget を使っていたが、フィルター後の graph に含まれないパスも指定しており、無駄に量が多くなるため必要最低限とする。
 */
export function extractAbstractionTargetFromGraphs(...graphs: Graph[]) {
  return (
    graphs
      .map(graph =>
        graph.nodes.filter(node => node.isDirectory).map(node => node.path),
      )
      .flat()
      .sort()
      // 重複を除去する
      .reduce<string[]>((prev, current) => {
        if (!current) return prev;
        if (!prev.includes(current)) prev.push(current);
        return prev;
      }, [])
  );
}
