import { createCommentTitle } from './createCommentTitle';
import { getConfig } from './config';
import type { FilesChanged } from './github';
import GitHub from './github';

export interface Context {
  config: {
    tsconfigRoot: string;
    tsconfig: string | undefined;
    maxSize: number;
    orientation: { TB: true } | { LR: true } | object;
    debugEnabled: boolean;
    inDetails: boolean;
    exclude: string[];
    includeIndexFileDependencies: boolean;
    commentTitle: string;
    showMetrics: boolean;
  };
  github: GitHub;
  fullCommentTitle: string;
  filesChanged: FilesChanged;
}

export async function createContext(): Promise<Context> {
  const github = new GitHub();
  const filesChanged = await github.getTSFiles();
  const config = getConfig();
  return {
    config,
    github,
    fullCommentTitle: createCommentTitle(
      config.commentTitle,
      github.getWorkflowName(),
    ),
    filesChanged,
  };
}
