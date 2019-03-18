# CI Failed Test Reporter

![A PR comment posted with the CI Failed Test Reporter](/readme-assets/demo.gif "CI Failed Test Reporter Screenshot")

A familiar scene: you open up a PR only to see that your CircleCI build failed because of some tests that didn't pass. But which tests? GitHub won't tell you. Your best options for finding out include opening a console and running your test suite locally or manually sifting through the CI logs, and neither of these is as efficient as you'd like. 

This tool was built to facilitate this process—when your CI build breaks due to failing tests, it reads the JSON test report generated by Jest, formats it into markdown, and posts it as a comment directly on your PR. With this tool, you can see which tests broke the build in the same place you find out it's broken, no context-switching necessary.

## Installation

```bash
yarn add @postlight/ci-failed-test-reporter

# or

npm install @postlight/ci-failed-test-reporter
```

### Notes on testing frameworks

This package is currently only compatible with JSON test results generated by [Jest](https://jestjs.io/), but we're hoping to add additional support in the future.

## Usage

The basic usage is simple: First, you'll run your Jest tests with the flag to save results to JSON:

```bash
jest --json --outputFile test-output.json
```

You'll likely want to add this as a script to your `package.json`, like so:

```json
  "scripts": {
    "test-with-output": "jest --json --outputFile test-output.json",
  }
```

Next, you run `ciftr` (**ci**-**f**ailed-**t**est-**r**eporter) to parse the test results and report failed tests:

```bash
yarn ciftr test-output.json
```

Before that will work in your CI environment, you'll need to do two things:

1. Set up your CircleCI config
2. Create a GitHub API key and add it to your CircleCI environment variables

> Currently, this tool currently only works with CircleCI, but we're looking into opening it up to other CI solutions. 

### Set up your CircleCI config

To set it up with CircleCI, there are two `run` blocks you'll need to add to your `.circleci/config.yml` file.

First, set up your environment variables.

```yml
# exports CircleCI env variables so they can be referenced in your code
# put this near the top of your job, e.g., after the `checkout` step
- run:
    name: Define Environment Variables at Runtime
    command: |
      echo 'export PR_REPONAME=${CIRCLE_PROJECT_REPONAME}' >> $BASH_ENV
      echo 'export PR_USERNAME=${CIRCLE_PROJECT_USERNAME}' >> $BASH_ENV
      # grep just the pr number from the PR URL
      echo 'export PR_NUMBER=$(echo $CIRCLE_PULL_REQUEST | grep -Eo "\/pull\/([0-9]+)" | grep -Eo "[0-9]+")' >> $BASH_ENV
      source $BASH_ENV
```

Next, after you run your tests (the `yarn test` command below is set up like we have it in the script above), you'll run `ciftr`:

```yml
- run: yarn test
- run:
    name: Upload Test Report
    command: yarn ciftr test-report.json # this should mirror whereever you've saved your test results
    when: on_fail # only run this when tests have failed
```

You can check out [this CircleCI config](.circleci/config.example.yml) for a full working example.

### Setting Up Your GitHub API Key Environment Variable

The only environment variable you need to define for use through the CircleCI webapp is `GITHUB_API_KEY`, which must be populated with your GitHub API key. This can be the API key of any user with access to the repo—at Postlight, we've created a `postlight-bot` user and recommend you do similar. The rest of the necessary environment variables are built in to CircleCI and are exported in your CircleCI config file, as detailed [above](#Set up your CircleCI config).

---
🔬 A project from your friends at [Postlight Labs](https://postlight.com/labs)
