import { createCommentTitle } from '../graph/createCommentTitle';
import { getConfig } from './config';
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
  };
  github: GitHub;
  fullCommentTitle: string;
}

export function createContext(): Context {
  const github = new GitHub();
  const config = getConfig();
  return {
    config,
    github,
    fullCommentTitle: createCommentTitle(
      config.commentTitle,
      github.getWorkflowName(),
    ),
  };
}
