/**
 * GitHub Action を公開する際には、 /dist/index.js をビルドしてコミットする必要がある。それが Action の実体となる。
 * それをコミットしたうえで、本リポジトリの CI のテストにおいてはそのコミットハッシュを使用するようワークフローファイルを更新してコミットする。
 *
 * When publishing a GitHub Action, it is necessary to build and commit `/dist/index.js`, as it serves as the actual implementation of the Action.
 * After committing that, in the CI test of this repository, update the workflow file to use the commit hash and commit the changes.
 */

import fs from 'fs';
import path from 'path';
import { $ } from 'zx';

await $`pnpm run build`;
await $`git commit -am "chore: update dist"`;

const headSha = (await $`git rev-parse HEAD`).toString().trim();
const files = fs.readdirSync(path.resolve('.github/workflows'));
files.forEach(file => {
  const filePath = path.resolve('.github/workflows', file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const updatedContent = content.replace(
    /ysk8hori\/delta-typescript-graph-action@.*/,
    `ysk8hori/delta-typescript-graph-action@${headSha}`,
  );
  fs.writeFileSync(filePath, updatedContent);
});

await $`git commit -am "ci: update hash"`;
