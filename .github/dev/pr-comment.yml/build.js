// get the directory of this script
const dir = __dirname;

const fs = require("fs");
const index = fs.readFileSync(`${dir}/index.js`, "utf8");

const workflow = `name: Add download link to pull request
on:
  workflow_run:
    workflows: ["Build Template"]
    types: [completed]
jobs:
  pr_comment:
    if: github.event.workflow_run.event == 'pull_request' && github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest

    permissions:
      pull-requests: write

    steps:
      - uses: actions/github-script@v6
        with:
          # This snippet is public-domain, taken from
          # https://github.com/oprypin/nightly.link/blob/master/.github/workflows/pr-comment.yml
          script: |
            ${index.replace(/\n/g, "\n            ")}`;

fs.writeFileSync(`${dir}/../../workflows/pr-comment.yml`, workflow);
