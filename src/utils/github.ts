import * as core from '@actions/core';
import * as github from '@actions/github';
import { info, log } from './log';
import { execSync } from 'child_process';
import { retry } from './retry';

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
    log(e);
    return undefined;
  }
  const error = new Error();
  error.cause = e;
  throw error;
}

export default class GitHub {
  #octokit: ReturnType<typeof github.getOctokit>;

  constructor() {
    this.#octokit = github.getOctokit(core.getInput('access-token'));
  }

  public async getTSFiles() {
    const compareResult =
      await this.#octokit.rest.repos.compareCommitsWithBasehead({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        basehead: `${github.context.payload.pull_request?.base.sha}...${github.context.payload.pull_request?.head.sha}`,
      });
    const files = compareResult.data.files
      ?.filter(file =>
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
      unchanged: files?.filter(file => file.status === 'unchanged') ?? [],
    };
  }

  public getBaseSha() {
    return github.context.payload.pull_request?.base.sha;
  }

  public getHeadSha() {
    return github.context.payload.pull_request?.head.sha;
  }

  /**
   * コメントのタイトルは同一コメントを探す際にも使用する
   */
  public getCommentTitle() {
    return `## Delta TypeScript Graph<!--${github.context.workflow}-->`;
  }

  /**
   * PRにコメントする。
   *
   * 同一PR内では同一コメントを上書きし続ける。
   */
  public async commentToPR(body: string) {
    const owner = github.context.repo.owner;
    const repo = github.context.repo.repo + 'hoge';
    const issue_number = github.context.payload.number;
    github.context.workflow;
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
    const existingComment = comments.data.find(
      comment => comment.body?.trim().startsWith(this.getCommentTitle()),
    );

    if (existingComment) {
      // 3. 既存のコメントがあれば、そのコメントを更新する
      await retry(() =>
        this.#octokit.rest.issues
          .updateComment({
            owner,
            repo,
            comment_id: existingComment.id,
            body,
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
            body,
          })
          .catch(throwUnexpectedError),
      );
    }
  }

  /**
   * PRのコメントを削除する
   */
  public async deleteComment() {
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
    const existingComment = comments.data.find(
      comment => comment.body?.trim().startsWith(this.getCommentTitle()),
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
