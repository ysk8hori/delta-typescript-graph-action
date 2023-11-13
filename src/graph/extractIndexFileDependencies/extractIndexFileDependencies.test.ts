import { Node, Relation } from '@ysk8hori/typescript-graph/dist/src/models';
import { extractIndexFileDependencies } from './extractIndexFileDependencies';

test('すべて空配列でもエラーとならない', () => {
  expect(
    extractIndexFileDependencies({
      includeFilePaths: [],
      graphs: [{ nodes: [], relations: [] }],
    }),
  ).toEqual([]);
});

const main = {
  changeStatus: 'not_modified',
  name: 'main.ts',
  path: 'src/main.ts',
} satisfies Node;
const indexA = {
  changeStatus: 'not_modified',
  name: 'index.ts',
  path: 'src/a/index.ts',
} satisfies Node;
const a = {
  changeStatus: 'not_modified',
  name: 'a.ts',
  path: 'src/a/a.ts',
} satisfies Node;
const a2 = {
  changeStatus: 'not_modified',
  name: 'a2.ts',
  path: 'src/a/a2.ts',
} satisfies Node;
const indexB = {
  changeStatus: 'not_modified',
  name: 'index.ts',
  path: 'src/b/index.ts',
} satisfies Node;
const b = {
  changeStatus: 'not_modified',
  name: 'b.ts',
  path: 'src/b/b.ts',
} satisfies Node;
const nodes = [main, indexA, a, a2, indexB, b];

function relation(from: Node, to: Node): Relation {
  return {
    from: from,
    to: to,
    changeStatus: 'not_modified',
    fullText: '',
    kind: 'depends_on',
  };
}

test('index.ts から参照されるノードが includeFilePath に含まれる場合はその index.ts を返す（通常ケース）', () => {
  expect(
    extractIndexFileDependencies({
      includeFilePaths: [a.path, a2.path, b.path],
      graphs: [
        {
          nodes,
          relations: [
            // 抽出対象となる relation
            relation(indexA, a),
            // 抽出対象となる relation
            relation(indexA, a2),
            // 抽出対象とならない relation
            relation(main, b),
          ],
        },
      ],
    }),
  ).toEqual([indexA.path]);
});

test('includeFilePaths が空配列でもエラーにならない', () => {
  expect(
    extractIndexFileDependencies({
      includeFilePaths: [],
      graphs: [
        {
          nodes,
          relations: [relation(indexA, a), relation(main, b)],
        },
      ],
    }),
  ).toEqual([]);
});

test('includeFilePaths に空文字が含まれていても全ての index.ts が抽出対象になったりはしない', () => {
  expect(
    extractIndexFileDependencies({
      includeFilePaths: [''],
      graphs: [
        {
          nodes,
          relations: [relation(indexA, a), relation(main, b)],
        },
      ],
    }),
  ).toEqual([]);
});

test('graph が空っぽでもエラーにならない', () => {
  expect(
    extractIndexFileDependencies({
      includeFilePaths: ['a.ts', 'b.ts'],
      graphs: [
        {
          nodes: [],
          relations: [],
        },
      ],
    }),
  ).toEqual([]);
});
