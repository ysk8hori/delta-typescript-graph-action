import { execSync } from 'child_process';
import * as core from '@actions/core';
import * as github from '@actions/github';
import { info, log } from './log';
import { retry } from './retry';

export interface PullRequestFileInfo {
  filename: string;
  status:
    | 'added'
    | 'removed'
    | 'modified'
    | 'renamed'
    | 'copied'
    | 'changed'
    | 'unchanged';
  previous_filename: string | undefined;
}

export interface FilesChanged {
  created: PullRequestFileInfo[];
  deleted: PullRequestFileInfo[];
  modified: PullRequestFileInfo[];
  renamed: PullRequestFileInfo[];
}

/**
 * 400、401、403、404、422、451を除く、サーバーの4xx/5xx応答の場合はエラーをスローする。
 *
 * @param e エラーオブジェクト
 * @returns 400、401、403、404、422、451 の場合は undefined を返す。
 * @see https://github.com/octokit/plugin-retry.js
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throwUnexpectedError(e: any) {
  // @see https://github.com/octokit/plugin-retry.js
  if ([400, 401, 403, 404, 422, 451].includes(e?.status)) {
    console.warn(e);
    return undefined;
  }
  throw new Error(e.message, { cause: e });
}

export default class GitHub {
  #octokit: ReturnType<typeof github.getOctokit>;

  constructor() {
    this.#octokit = github.getOctokit(core.getInput('access-token'));
  }

  public async getTSFiles(): Promise<FilesChanged> {
    const compareResult =
      await this.#octokit.rest.repos.compareCommitsWithBasehead({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        basehead: `${github.context.payload.pull_request?.base.sha}...${github.context.payload.pull_request?.head.sha}`,
      });
    const files = compareResult.data.files
      ?.filter(file =>
        // TODO: tsg の isTsFile を使用する
        /\.ts$|\.tsx$|\.vue$|\.astro$|\.svelte$/.test(file.filename),
      )
      .map(file => ({
        filename: file.filename,
        status: file.status,
        previous_filename: file.previous_filename,
      }));
    log(files);

    // typescript-graph では、以下の分類で処理する。
    return {
      created:
        files?.filter(
          file => file.status === 'added' || file.status === 'copied',
        ) ?? [],
      deleted: files?.filter(file => file.status === 'removed') ?? [],
      modified:
        files?.filter(
          file => file.status === 'modified' || file.status === 'changed',
        ) ?? [],
      renamed: files?.filter(file => file.status === 'renamed') ?? [],
    };
  }

  public getBaseSha() {
    return github.context.payload.pull_request?.base.sha;
  }

  public getHeadSha() {
    return github.context.payload.pull_request?.head.sha;
  }

  /**
   * ワークフロー名を取得する。
   *
   * @returns ワークフロー名
   */
  public getWorkflowName() {
    return github.context.workflow;
  }

  /**
   * PRにコメントする。
   *
   * 同一PR内では同一コメントを上書きし続ける。
   */
  public async commentToPR(fullCommentTitle: string, body: string) {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const issue_number = github.context.payload.number;
    // 1. 既存のコメントを取得する
    const comments = await retry(() =>
      this.#octokit.rest.issues
        .listComments({
          owner,
          repo,
          issue_number,
        })
        .catch(throwUnexpectedError),
    );

    if (!comments) {
      info('commentToPR:コメントの取得に失敗しました');
      return;
    }

    // 2. 既存のコメントがあれば、そのコメントのIDを取得する
    const existingComment = comments.data.find(comment =>
      comment.body?.trim().startsWith(fullCommentTitle),
    );

    if (existingComment) {
      // 3. 既存のコメントがあれば、そのコメントを更新する
      await retry(() =>
        this.#octokit.rest.issues
          .updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body: fullCommentTitle + '\n\n' + body,
          })
          .catch(throwUnexpectedError),
      );
    } else {
      // 4. 既存のコメントがなければ、新規にコメントを作成する
      await retry(() =>
        this.#octokit.rest.issues
          .createComment({
            owner,
            repo,
            issue_number,
            body: fullCommentTitle + '\n\n' + body,
          })
          .catch(throwUnexpectedError),
      );
    }
  }

  /**
   * PRのコメントを削除する
   */
  public async deleteComment(fullCommentTitle: string) {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo;
    const issue_number = github.context.payload.number;
    // 1. 既存のコメントを取得する
    const comments = await retry(() =>
      this.#octokit.rest.issues
        .listComments({
          owner,
          repo,
          issue_number,
        })
        .catch(throwUnexpectedError),
    );

    if (!comments) {
      info('deleteComment:コメントの取得に失敗しました');
      return;
    }

    // 2. 既存のコメントがあれば、そのコメントのIDを取得する
    const existingComment = comments.data.find(comment =>
      comment.body?.trim().startsWith(fullCommentTitle),
    );

    if (existingComment) {
      // 3. 既存のコメントがあれば、そのコメントを削除する
      await retry(() =>
        this.#octokit.rest.issues
          .deleteComment({
            owner,
            repo,
            comment_id: existingComment.id,
          })
          .catch(throwUnexpectedError),
      );
    }
  }

  public cloneRepo() {
    const repo = github.context.repo;
    // リポジトリのURLを取得
    const repoUrl = `https://github.com/${repo.owner}/${repo.repo}.git`;
    // リポジトリをチェックアウト
    execSync(`git clone ${repoUrl}`);
    // result としてリポジトリ名を返す
    return { repoDir: repo.repo };
  }
}
