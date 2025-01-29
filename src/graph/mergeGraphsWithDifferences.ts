import type { Graph } from '@ysk8hori/typescript-graph';
import {
  abstraction,
  mergeGraph,
  filterGraph,
} from '@ysk8hori/typescript-graph';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import { createTsgCommand } from '../tsg/createTsgCommand';
import type { Context } from '../utils/context';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import updateRelationsStatus from './updateRelationsStatus';
import { extractAbstractionTargetFromGraphs } from './extractAbstractionTargetFromGraphs';
import { createIncludeList } from './createIncludeList';

/** ２つのグラフからその差分を反映した１つのグラフを生成する */
export default function mergeGraphsWithDifferences(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  context: Pick<Context, 'filesChanged' | 'config'>,
) {
  const { createdRelations, deletedRelations } = updateRelationsStatus(
    fullBaseGraph,
    fullHeadGraph,
  );
  log('createdRelations:', createdRelations);
  log('deletedRelations:', deletedRelations);

  // base と head のグラフをマージする
  const mergedGraph = mergeGraph([fullHeadGraph, fullBaseGraph]);
  log('mergedGraph.nodes.length:', mergedGraph.nodes.length);
  log('mergedGraph.relations.length:', mergedGraph.relations.length);

  const includes = createIncludeList({ context, graphs: [mergedGraph] });
  log('includes:', includes);

  const abstractionTarget = pipe(includes, extractNoAbstractionDirs, dirs =>
    extractAbstractionTarget(dirs, mergedGraph),
  );
  log('abstractionTarget:', abstractionTarget);

  const graph = pipe(
    mergedGraph,
    graph => filterGraph(includes, context.config.exclude, graph),
    graph => (
      log('filteredGraph.nodes.length:', graph.nodes.length),
      log('filteredGraph.relations.length:', graph.relations.length),
      graph
    ),
    graph => abstraction(abstractionTarget, graph),
    graph => (
      log('abstractedGraph.nodes.length:', graph.nodes.length),
      log('abstractedGraph.relations.length:', graph.relations.length),
      graph
    ),
    graph => addStatus(context, graph),
    graph => (
      log('graph.nodes.length:', graph.nodes.length),
      log('graph.relations.length:', graph.relations.length),
      graph
    ),
  );

  const tsgCommand = createTsgCommand({
    includes,
    abstractions: extractAbstractionTargetFromGraphs(graph),
    context,
  });

  return { graph, tsgCommand };
}
