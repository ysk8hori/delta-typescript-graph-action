import * as core from '@actions/core';
import * as github from '@actions/github';
import { log } from './utils/log';
import { execSync } from 'child_process';

async function getTSFiles() {
  const octokit = github.getOctokit(core.getInput('access-token'));
  const compareResult = await octokit.rest.repos.compareCommitsWithBasehead({
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

function getBaseSha() {
  return github.context.payload.pull_request?.base.sha;
}

function getHeadSha() {
  return github.context.payload.pull_request?.head.sha;
}

/**
 * コメントのタイトルは同一コメントを探す際にも使用する
 */
function getCommentTitle() {
  return `## Delta TypeScript Graph<!--${github.context.workflow}-->`;
}

/**
 * PRにコメントする。
 *
 * 同一PR内では同一コメントを上書きし続ける。
 */
export async function commentToPR(body: string) {
  const octokit = github.getOctokit(core.getInput('access-token'));
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const issue_number = github.context.payload.number;
  github.context.workflow;
  // 1. 既存のコメントを取得する
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number,
  });

  // 2. 既存のコメントがあれば、そのコメントのIDを取得する
  const existingComment = comments.data.find(
    comment => comment.body?.trim().startsWith(getCommentTitle()),
  );

  if (existingComment) {
    // 3. 既存のコメントがあれば、そのコメントを更新する
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: existingComment.id,
      body,
    });
  } else {
    // 4. 既存のコメントがなければ、新規にコメントを作成する
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number,
      body,
    });
  }
}

/**
 * PRのコメントを削除する
 */
export async function deleteComment() {
  const octokit = github.getOctokit(core.getInput('access-token'));
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;
  const issue_number = github.context.payload.number;
  // 1. 既存のコメントを取得する
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number,
  });

  // 2. 既存のコメントがあれば、そのコメントのIDを取得する
  const existingComment = comments.data.find(
    comment => comment.body?.trim().startsWith(getCommentTitle()),
  );

  if (existingComment) {
    // 3. 既存のコメントがあれば、そのコメントを削除する
    await octokit.rest.issues.deleteComment({
      owner,
      repo,
      comment_id: existingComment.id,
    });
  }
}

export async function cloneRepo() {
  const repo = github.context.repo;
  // リポジトリのURLを取得
  const repoUrl = `https://github.com/${repo.owner}/${repo.repo}.git`;
  // リポジトリをチェックアウト
  execSync(`git clone ${repoUrl}`);
  // result としてリポジトリ名を返す
  return { repoDir: repo.repo };
}

// TODO: refactor: それぞれの関数を export する。テストの変更も必要。
export default {
  getFiles: getTSFiles,
  getBaseSha,
  getHeadSha,
  commentToPR,
  cloneRepo,
  getCommentTitle,
  deleteComment,
};
