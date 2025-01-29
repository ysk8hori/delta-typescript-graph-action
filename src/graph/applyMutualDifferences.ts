import type { Graph } from '@ysk8hori/typescript-graph';
import { abstraction, filterGraph } from '@ysk8hori/typescript-graph';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import { createTsgCommand } from '../tsg/createTsgCommand';
import type { Context } from '../utils/context';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import { extractAbstractionTargetFromGraphs } from './extractAbstractionTargetFromGraphs';
import { createIncludeList } from './createIncludeList';

/**
 * ２つのグラフの差分を互いに反映する。
 *
 * 実際にグラフの差分を見ているのではなく、github api で取得したファイルの差分を見ている。
 */
export default function applyMutualDifferences(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  context: Context,
) {
  const includes = createIncludeList({
    context,
    graphs: [fullBaseGraph, fullHeadGraph],
  });
  log('includes:', includes);

  const abstractionTargetsForBase = pipe(
    includes,
    extractNoAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullBaseGraph),
  );
  log('abstractionTargetsForBase:', abstractionTargetsForBase);
  const baseGraph = pipe(
    fullBaseGraph,
    graph => filterGraph(includes, context.config.exclude, graph),
    graph => (
      log('filtered base graph.nodes.length:', graph.nodes.length),
      log('filtered base graph.relations.length:', graph.relations.length),
      graph
    ),
    graph => abstraction(abstractionTargetsForBase, graph),
    graph => (
      log('abstracted base graph.nodes.length:', graph.nodes.length),
      log('abstracted base graph.relations.length:', graph.relations.length),
      graph
    ),
    graph => addStatus(context, graph),
  );
  log('baseGraph.nodes.length:', baseGraph.nodes.length);
  log('baseGraph.relations.length:', baseGraph.relations.length);

  const abstractionTargetsForHead = pipe(
    includes,
    extractNoAbstractionDirs,
    dirs => extractAbstractionTarget(dirs, fullHeadGraph),
  );
  log('abstractionTargetsForHead:', abstractionTargetsForHead);
  const headGraph = pipe(
    fullHeadGraph,
    graph => filterGraph(includes, context.config.exclude, graph),
    graph => (
      log('filtered head graph.nodes.length:', graph.nodes.length),
      log('filtered head graph.relations.length:', graph.relations.length),
      graph
    ),
    graph => abstraction(abstractionTargetsForHead, graph),
    graph => (
      log('abstracted head graph.nodes.length:', graph.nodes.length),
      log('abstracted head graph.relations.length:', graph.relations.length),
      graph
    ),
    graph => addStatus(context, graph),
  );
  log('headGraph.nodes.length:', headGraph.nodes.length);
  log('headGraph.relations.length:', headGraph.relations.length);

  const tsgCommand = createTsgCommand({
    includes,
    abstractions: extractAbstractionTargetFromGraphs(baseGraph, headGraph),
    context,
  });

  return { baseGraph, headGraph, tsgCommand };
}
