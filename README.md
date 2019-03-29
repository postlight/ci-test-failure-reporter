# CI Failed Test Reporter

![A PR comment posted with the CI Failed Test Reporter](/readme-assets/demo.gif "CI Failed Test Reporter Screenshot")

A familiar scene: you open up a PR only to see that your CI build failed because of some tests that didn't pass. But which tests? GitHub won't tell you. Your best options for finding out include opening a console and running your test suite locally or manually sifting through the CI logs, and neither of these is as efficient as you'd like. 

This tool was built to facilitate this process—when your CI build breaks due to failing tests, it reads the JSON test report generated by your testing framework, formats it into markdown, and posts it as a comment directly on your PR. With this tool, you can see which tests broke the build in the same place you find out it's broken, no context-switching necessary.

## Installation

```bash
yarn add @postlight/ci-failed-test-reporter

# or

npm install @postlight/ci-failed-test-reporter
```

### Note on testing frameworks

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

1. Set up your CI config
2. [Create a GitHub API key](#setting-up-your-github-api-key-environment-variable) and add it to your CI environment variables

> Currently, this tool currently only works with CircleCI, but we're looking into opening it up to other CI solutions. 

## CI Setup

This tool has only been tested using CircleCI, but should be able to work with any CI solution that allows you to set the proper environment variables. Below, we've outlined the process for setting up a CircleCI config for use with the tool. The process should be somewhat similar across CI solutions—make sure to look at the CI tool's docs to determine what needs to be done differently.

### Setting up a CircleCI config

To set things up with CircleCI, there's just one `run` block you'll need to add to your `.circleci/config.yml` file.

After the step where you run your tests, you'll run `ciftr`:

```yml
- run: yarn test
- run:
    name: Upload Test Report
    command: yarn ciftr test-report.json # this should mirror whereever you've saved your test results
    when: on_fail # only run this when tests have failed
```

You can check out [this CircleCI config](.circleci/config.example.yml) for a full working example. The only thing you will definitely want to change is the `working_directory` value, which should be changed to the name of your repo. Note that this config assumes you're saving your test reports as `test-report.json` in the root directory.

### Setting up a Travis config

To set things up with Travis, you only need to add the following step to your `.travis.yml` file:

```
after_failure:
  - yarn ciftr /test-report.json
```

You'll be all set after that! Again, this assumes that the testing framework is writing test results in a file called `test-report.json` in the root directory of your project. Check out our [example Travis config](.travis.example.yml) for a working example that you can use as a guide.

### Using this project with another CI solution

While we've only tested this package with Travis and CircleCI, it should work swimmingly with any CI solution that allows you to access a few key pieces of info about the current build. The following environment variables must be defined—you may be able to export them as part of a step in your build process.

```
GITHUB_API_KEY="your github API key"
PR_USERNAME="the repo owner's username"
PR_NUMBER="the number of the pull request"
PR_REPONAME="the repo name"
```

Here's an example of how you might manually export the appropriate environment variables, using CircleCI as an example (remember that this package supports CircleCI, so need to use this code in your actual config). The process for another CI tool may or may not look similar.

```
  - run:
      name: Define Environment Variables at Runtime
      command: |
        echo 'export PR_REPONAME=${CIRCLE_PROJECT_REPONAME}' >> $BASH_ENV
        echo 'export PR_USERNAME=${CIRCLE_PROJECT_USERNAME}' >> $BASH_ENV
        # grep just the pr number from the PR URL
        echo 'export PR_NUMBER=$(echo $CIRCLE_PULL_REQUEST | grep -Eo "\/pull\/([0-9]+)" | grep -Eo "[0-9]+")' >> $BASH_ENV
        source $BASH_ENV
```


### Setting Up Your GitHub API Key Environment Variable

The only environment variable you need to define for use through the CircleCI webapp is `GITHUB_API_KEY`, which must be populated with your GitHub API key. This can be the API key of any user with access to the repo—at Postlight, we've created a `postlight-bot` user and recommend you do similarly. In order to create a GitHub API key, start [here](https://github.com/settings/tokens). The rest of the necessary environment variables are built into CircleCI and are exported in your CircleCI config file, as detailed [above](#Set up your CircleCI config).

## TODO

- Add support for other JS testing frameworks
- Add example config for Jenkins

Pull requests are more than welcome!

---
🔬 A project from your friends at [Postlight Labs](https://postlight.com/labs)
