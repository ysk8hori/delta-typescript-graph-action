import { vi } from 'vitest';
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
      getWorkflowName: vi.fn(),
      commentToPR: vi.fn(),
      deleteComment: vi.fn(),
      getTSFiles: vi.fn(),
      getBaseSha: vi.fn(),
      getHeadSha: vi.fn(),
      cloneRepo: vi.fn(),
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
