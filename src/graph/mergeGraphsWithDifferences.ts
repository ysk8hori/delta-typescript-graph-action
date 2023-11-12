import { abstraction } from '@ysk8hori/typescript-graph/dist/src/graph/abstraction';
import { mergeGraph } from '@ysk8hori/typescript-graph/dist/src/graph/utils';
import { Graph } from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe } from 'remeda';
import { log } from '../utils/log';
import addStatus from './addStatus';
import extractAbstractionTarget from './extractAbstractionTarget';
import extractNoAbstractionDirs from './extractNoAbstractionDirs';
import updateRelationsStatus from './updateRelationsStatus';
import { filterGraph } from '@ysk8hori/typescript-graph/dist/src/graph/filterGraph';
import { exclude } from '../utils/config';
import { extractAbstractionTargetFromGraphs } from './extractAbstractionTargetFromGraphs';
import { createTsgCommand } from './createTsgCommand';
import { createIncludeList } from './createIncludeList';

/** ２つのグラフからその差分を反映した１つのグラフを生成する */
export default function mergeGraphsWithDifferences(
  fullBaseGraph: Graph,
  fullHeadGraph: Graph,
  created: string[],
  deleted: string[],
  modified: string[],
  renamed:
    | { filename: string; previous_filename: string | undefined }[]
    | undefined,
) {
  const { createdRelations, deletedRelations } = updateRelationsStatus(
    fullBaseGraph,
    fullHeadGraph,
  );
  log('createdRelations:', createdRelations);
  log('deletedRelations:', deletedRelations);

  // base と head のグラフをマージする
  const mergedGraph = mergeGraph(fullHeadGraph, fullBaseGraph);
  log('mergedGraph.nodes.length:', mergedGraph.nodes.length);
  log('mergedGraph.relations.length:', mergedGraph.relations.length);

  const includes = createIncludeList({
    created,
    deleted,
    modified,
    renamed,
    graphs: [mergedGraph],
  });
  log('includes:', includes);

  const abstractionTarget = pipe(includes, extractNoAbstractionDirs, dirs =>
    extractAbstractionTarget(dirs, mergedGraph),
  );
  log('abstractionTarget:', abstractionTarget);

  const graph = pipe(
    mergedGraph,
    graph => filterGraph(includes, ['node_modules', ...exclude()], graph),
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
    graph => addStatus({ modified, created, deleted }, graph),
    graph => (
      log('graph.nodes.length:', graph.nodes.length),
      log('graph.relations.length:', graph.relations.length),
      graph
    ),
  );

  const tsgCommand = createTsgCommand({
    includes,
    excludes: ['node_modules', ...exclude()],
    abstractions: extractAbstractionTargetFromGraphs(graph),
  });

  return { graph, tsgCommand };
}
