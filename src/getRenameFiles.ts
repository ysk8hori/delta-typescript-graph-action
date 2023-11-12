import { DangerDSLType } from 'danger/distribution/dsl/DangerDSL';
declare let danger: DangerDSLType;

export default function getRenameFiles() {
  return danger.github.api.repos
    .compareCommitsWithBasehead({
      owner: danger.github.pr.base.repo.owner.login,
      repo: danger.github.pr.base.repo.name,
      basehead: `${danger.github.pr.base.ref}...${danger.github.pr.head.ref}`,
    })
    .then(comparison =>
      comparison.data.files
        ?.filter(file => file.status === 'renamed')
        .map(({ filename, previous_filename }) => ({
          filename,
          previous_filename,
        })),
    );
}
