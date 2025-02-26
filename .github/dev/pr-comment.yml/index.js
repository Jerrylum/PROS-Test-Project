/** @type {ReturnType<import('@actions/github').getOctokit>} */
const gh = github;
/** @type {import('@actions/github').context} */
const ctx = context;
/** @type {import('@octokit/webhooks-types').WorkflowRun} */
const run = ctx.payload.workflow_run; // a.k.a GitHub Event

const { owner, repo } = ctx.repo;
const run_id = run.id;
const pull_head_sha = run.head_sha;
const pull_requests = run.pull_requests;

if (!pull_requests.length)
  return core.error("This workflow doesn't match any pull requests!");
const pull_number = pull_requests[0].number;

const { data: pr_detail } = await gh.rest.pulls.get({
  owner,
  repo,
  pull_number,
});

const old_body = pr_detail.body || "";

const old_sha = /\<\!-- commit-sha: (?<sha>[a-z0-9]+) --\>/i.exec(old_body)
  ?.groups?.sha;
if (old_sha !== undefined && pull_head_sha === old_sha)
  return core.error("Comment is already up-to-date!");

const artifacts = await gh.paginate(gh.rest.actions.listWorkflowRunArtifacts, {
  owner,
  repo,
  run_id,
});
if (!artifacts.length)
  return core.error(`No artifacts found, perhaps Build Template was skipped`);
const template = artifacts[0];

const { data: head_commit } = await gh.rest.repos.getCommit({
  owner,
  repo,
  ref: pull_head_sha,
});

const head_commit_message = head_commit.commit.message.split("\n")[0].replace(/`/, "");
const head_commit_short_sha = head_commit.sha.slice(0, 7);
const head_commit_date = head_commit.commit.committer.date;

const insertion = `<!-- commit-sha: ${pull_head_sha} -->
## Download the template for this pull request:

> [!NOTE]
> This is auto-generated from the last successful build commit [${head_commit_short_sha}](${head_commit.html_url}) on ${head_commit_date}.
> Commit message: \`${head_commit_message}\`
- via manual download: [${template.name}.zip](https://nightly.link/${owner}/${repo}/actions/artifacts/${template.id}.zip)
- via PROS Integrated Terminal:
\`\`\`
curl -o ${template.name}.zip https://nightly.link/${owner}/${repo}/actions/artifacts/${template.id}.zip;
pros c fetch ${template.name}.zip;
pros c apply ${template.name};
rm ${template.name}.zip;
\`\`\``;

core.info(`Review thread message body: \n${insertion}`);

const marker = `\r\n<!-- DO NOT REMOVE!! -->\r\n<!-- bot: nightly-link -->\r\n`;

const old_marker =
  new RegExp(marker.replace("\r\n", "\r?\n")).exec(old_body)?.[0] ?? marker;

const new_body = old_body.split(old_marker)[0] + marker + insertion;
await gh.rest.pulls.update({ owner, repo, pull_number, body: new_body });
