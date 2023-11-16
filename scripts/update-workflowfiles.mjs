/**
 * This script updates the workflow files in the .github/workflows directory.
 *
 * workflow の中の ysk8hori/delta-typescript-graph-action のバージョンを、現在のブランチにおける最新のコミットハッシュに更新する。
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const headSha = execSync('git rev-parse HEAD').toString().trim();
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
//
