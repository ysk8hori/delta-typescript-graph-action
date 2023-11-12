import { Graph, Node } from '@ysk8hori/typescript-graph/dist/src/models';
import updateRelationsStatus from './updateRelationsStatus';

test('updateRelationsStatus は削除されたリレーションに deleted のステータスを付与する', () => {
  const a: Node = {
    path: 'src/A.tsx',
    name: 'A',
    changeStatus: 'not_modified',
  };
  const b: Node = {
    path: 'src/B.tsx',
    name: 'B',
    changeStatus: 'not_modified',
  };
  const c: Node = {
    path: 'src/C.tsx',
    name: 'C',
    changeStatus: 'not_modified',
  };
  const baseGraph: Graph = {
    nodes: [a, b, c],
    relations: [
      {
        from: a,
        to: b,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
      {
        from: a,
        to: c,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
    ],
  };
  const headGraph: Graph = {
    nodes: [a, b, c],
    relations: [
      {
        from: a,
        to: b,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
    ],
  };

  const { deletedRelations, createdRelations } = updateRelationsStatus(
    baseGraph,
    headGraph,
  );

  expect(baseGraph).toMatchInlineSnapshot(`
    {
      "nodes": [
        {
          "changeStatus": "not_modified",
          "name": "A",
          "path": "src/A.tsx",
        },
        {
          "changeStatus": "not_modified",
          "name": "B",
          "path": "src/B.tsx",
        },
        {
          "changeStatus": "not_modified",
          "name": "C",
          "path": "src/C.tsx",
        },
      ],
      "relations": [
        {
          "changeStatus": "not_modified",
          "from": {
            "changeStatus": "not_modified",
            "name": "A",
            "path": "src/A.tsx",
          },
          "fullText": "",
          "kind": "depends_on",
          "to": {
            "changeStatus": "not_modified",
            "name": "B",
            "path": "src/B.tsx",
          },
        },
        {
          "changeStatus": "deleted",
          "from": {
            "changeStatus": "not_modified",
            "name": "A",
            "path": "src/A.tsx",
          },
          "fullText": "",
          "kind": "depends_on",
          "to": {
            "changeStatus": "not_modified",
            "name": "C",
            "path": "src/C.tsx",
          },
        },
      ],
    }
  `);
  expect(deletedRelations).toEqual([
    {
      changeStatus: 'deleted',
      from: a,
      fullText: '',
      kind: 'depends_on',
      to: c,
    },
  ]);
  expect(createdRelations).toEqual([]);
});

test('updateRelationsStatus は作成されたリレーションに created のステータスを付与する', () => {
  const a: Node = {
    path: 'src/A.tsx',
    name: 'A',
    changeStatus: 'not_modified',
  };
  const b: Node = {
    path: 'src/B.tsx',
    name: 'B',
    changeStatus: 'not_modified',
  };
  const c: Node = {
    path: 'src/C.tsx',
    name: 'C',
    changeStatus: 'not_modified',
  };
  const baseGraph: Graph = {
    nodes: [a, b],
    relations: [
      {
        from: a,
        to: b,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
    ],
  };
  const headGraph: Graph = {
    nodes: [a, b, c],
    relations: [
      {
        from: a,
        to: b,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
      {
        from: a,
        to: c,
        kind: 'depends_on',
        changeStatus: 'not_modified',
        fullText: '',
      },
    ],
  };

  const { deletedRelations, createdRelations } = updateRelationsStatus(
    baseGraph,
    headGraph,
  );

  expect(headGraph).toMatchInlineSnapshot(`
    {
      "nodes": [
        {
          "changeStatus": "not_modified",
          "name": "A",
          "path": "src/A.tsx",
        },
        {
          "changeStatus": "not_modified",
          "name": "B",
          "path": "src/B.tsx",
        },
        {
          "changeStatus": "not_modified",
          "name": "C",
          "path": "src/C.tsx",
        },
      ],
      "relations": [
        {
          "changeStatus": "not_modified",
          "from": {
            "changeStatus": "not_modified",
            "name": "A",
            "path": "src/A.tsx",
          },
          "fullText": "",
          "kind": "depends_on",
          "to": {
            "changeStatus": "not_modified",
            "name": "B",
            "path": "src/B.tsx",
          },
        },
        {
          "changeStatus": "created",
          "from": {
            "changeStatus": "not_modified",
            "name": "A",
            "path": "src/A.tsx",
          },
          "fullText": "",
          "kind": "depends_on",
          "to": {
            "changeStatus": "not_modified",
            "name": "C",
            "path": "src/C.tsx",
          },
        },
      ],
    }
  `);
  expect(deletedRelations).toEqual([]);
  expect(createdRelations).toEqual([
    {
      changeStatus: 'created',
      from: a,
      fullText: '',
      kind: 'depends_on',
      to: c,
    },
  ]);
});
