import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  // `who-to-greet` import defined in action metadata file
  const nameToGreet = core.getInput("who-to-greet");
  console.log(`Hello ${nameToGreet}!`);
  const time = new Date().toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);
  const octokit = github.getOctokit(core.getInput("access-token"));
  // issue #1 に書き込む
  octokit.rest.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: 1,
    body: "Hello World",
  });
} catch (error) {
  core.setFailed((error as Error).message);
}
