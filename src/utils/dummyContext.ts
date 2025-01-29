import type { Context } from './context';
import type GitHub from './github';

export function getDummyContext(context?: {
  configExclude?: string[];
  configTsconfig?: string;
}): Context {
  return {
    config: {
      tsconfigRoot: '',
      tsconfig: context?.configTsconfig ?? '',
      maxSize: 100,
      orientation: {},
      debugEnabled: false,
      inDetails: false,
      exclude: context?.configExclude ?? ['node_modules'],
      includeIndexFileDependencies: false,
      commentTitle: '',
      showMetrics: false,
    },
    github: {
      getWorkflowName: jest.fn(),
      commentToPR: jest.fn(),
      deleteComment: jest.fn(),
      getTSFiles: jest.fn(),
      getBaseSha: jest.fn(),
      getHeadSha: jest.fn(),
      cloneRepo: jest.fn(),
    } as unknown as GitHub,
    fullCommentTitle: '## Delta TypeScript Graph<!--test-workflow.yml-->',
    filesChanged: {
      created: [],
      deleted: [],
      modified: [],
      renamed: [],
    },
  };
}
