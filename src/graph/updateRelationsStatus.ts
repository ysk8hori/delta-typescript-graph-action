import {
  Graph,
  RelationOfDependsOn,
  isSameRelation,
  Relation,
} from '@ysk8hori/typescript-graph/dist/src/models';
import { pipe, filter, forEach } from 'remeda';

/** 削除された Relation にマークをつける */
export default function updateRelationsStatus(
  baseGraph: Graph,
  headGraph: Graph,
) {
  const createdRelations = pipe(
    headGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      headRelation =>
        !baseGraph.relations.some(baseRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => (relation.changeStatus = 'created')),
  );
  const deletedRelations = pipe(
    baseGraph.relations,
    filter(isRelationOfDependsOn),
    filter(
      baseRelation =>
        !headGraph.relations.some(headRelation =>
          isSameRelation(baseRelation, headRelation),
        ),
    ),
    forEach(relation => (relation.changeStatus = 'deleted')),
  );
  return { deletedRelations, createdRelations };
}

function isRelationOfDependsOn(
  relation: Relation,
): relation is RelationOfDependsOn {
  return relation.kind === 'depends_on';
}
