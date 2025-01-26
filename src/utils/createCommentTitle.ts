/**
 * コメントタイトルを生成する。
 *
 * @param workflow ワークフロー名
 * @returns コメントタイトル
 */
export function createCommentTitle(
  commentTitle: string,
  workflow: string,
): string {
  return `## ${commentTitle}<!--${workflow}-->`;
}
