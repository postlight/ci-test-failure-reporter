const dotenv = require('dotenv');
const nodeFetch = require('node-fetch');
dotenv.config();
const getTestReport = require('./getTestReport');
const stripAnsi = require('strip-ansi');

function comment(filepath) {
  const username = process.env.PR_USERNAME;
  const repoName = process.env.PR_REPONAME;
  const prNumber = process.env.PR_NUMBER;
  const apiKey = process.env.GITHUB_API_KEY;

  if (!username || !repoName || !prNumber || !apiKey) {
    const undefinedVars = [];
    if (!username)  { undefinedVars.push("Username") }
    if (!repoName)  { undefinedVars.push("Repo Name") }
    if (!prNumber)  { undefinedVars.push("PR Number") }
    if (!apiKey)  { undefinedVars.push("GitHub API Key") }
    throw `${undefinedVars.join(", ")} env variables must not be undefined`;
  }
  const body = stripAnsi(getTestReport(filepath));
  const request = {
    method: 'POST',
    body: JSON.stringify({ body }),
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${apiKey}`,
      'User-Agent': repoName
    }
  };

  return nodeFetch(
    `https://api.github.com/repos/${username}/${repoName}/issues/${prNumber}/comments`,
    request
  ).then(res => {
    if (res.status === 201) {
      return body;
    } else {
      throw "Error posting GitHub request";
    }
  });
}

function getReport(filepath) {
  return stripAnsi(getTestReport(filepath));
}

module.exports = {
  comment,
  getReport
};