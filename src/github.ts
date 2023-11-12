import * as core from "@actions/core";
import * as github from "@actions/github";
import { log } from "./utils/log";

export async function getFiles() {
  const octokit = github.getOctokit(core.getInput("access-token"));
  const compareResult = await octokit.rest.repos.compareCommitsWithBasehead({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    basehead: `${github.context.payload.pull_request?.base.sha}...${github.context.payload.pull_request?.head.sha}`,
  });
  const files = compareResult.data.files?.map((file) => ({
    filename: file.filename,
    status: file.status,
    previous_filename: file.previous_filename,
  }));
  log(files);

  // file.status の値（"added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged"）をキーにした、型安全なオブジェクトに変換する。
  // 例えば、"added" なら { added: string[] } になる。
  const hoge = files?.reduce((acc, file) => {
    if (acc[file.status]) {
      acc[file.status].push(file);
    } else {
      acc[file.status] = [file];
    }
    return acc;
  }, {} as { [key in (typeof files)[number]["status"]]: typeof files });

  // typescript-graph では、以下の分類で処理する。
  return {
    created:
      files?.filter(
        (file) => file.status === "added" || file.status === "copied"
      ) ?? [],
    deleted: files?.filter((file) => file.status === "removed") ?? [],
    modified:
      files?.filter(
        (file) => file.status === "modified" || file.status === "changed"
      ) ?? [],
    renamed: files?.filter((file) => file.status === "renamed") ?? [],
    unchanged: files?.filter((file) => file.status === "unchanged") ?? [],
  };
}
