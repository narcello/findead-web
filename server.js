const express = require('express');
const app = express();
const fetch = require("node-fetch");
const fs = require('fs');
const { execSync } = require('child_process');

app.use(express.static('public'))

app.get('/url', async function (req, res) {
  res.writeHead(200, { 'Content-type': 'text/plain' });
  try {
    let { repoUrl } = req.query;
    repoUrl = repoUrl.indexOf('.git') > -1 ? repoUrl.replace('.git', '') : repoUrl;
    const [user, repoName] = getUserAndRepoNamesFromUrl(repoUrl);
    const cacheFile = `${user}.${repoName}.txt`;
    await isReactRepositorie(repoUrl);
    const needNewFindeadCheck = await needNewCheck(repoUrl, cacheFile);
    if (needNewFindeadCheck)
      await newCheck(repoUrl, repoName, cacheFile);
    res.write('lastResultFile')
  } catch (error) {
    res.write(error);
    res.end();
  }
  res.end();
});

function getUserAndRepoNamesFromUrl(repoUrl) {
  const regex = new RegExp('(.com\/)(.*)\/(.*)');
  let res = repoUrl.match(regex);
  return [res[2], res[3]];
}

function isReactRepositorie(repoUrl) {
  return new Promise((resolve, reject) => {
    let repoUrlRaw = repoUrl.replace('github', 'raw.githubusercontent');
    repoUrlRaw = `${repoUrlRaw}/master/package.json`
    fetch(repoUrlRaw, { method: 'get' })
      .then(res => res.json())
      .then(data => {
        const testReact = new RegExp(/("|'|)react("|'|):("|').*("|')/, 'g')
        let stringPackage = JSON.stringify(data);
        let isReactRepo = testReact.exec(stringPackage);
        Array.isArray(isReactRepo) ? resolve(`${repoUrl} is a react repositorie`) : reject(`${repoUrl} is not a react repositorie`)
      })
      .catch(err => {
        const { type, message } = err;
        switch (type) {
          case 'invalid-json':
            reject("Invalid or inexistent JSON.")
            break;
          default:
            reject(message)
            break;
        }
      })
  })
}

async function needNewCheck(repoUrl, cacheFile) {
  const cacheFileLastModification = getCacheFileLastModification(cacheFile);
  const repoLastModification = await getRepoLastModification(repoUrl);
  return new Date(repoLastModification) > new Date(cacheFileLastModification);
}

function getCacheFileLastModification(cacheFile) {
  try {
    const stats = fs.statSync(`../cache_results/${cacheFile}`)
    return stats.mtime;
  } catch (error) {
    return 0;
  }
}

function getRepoLastModification(repoUrl) {
  return new Promise((resolve, reject) => {
    let repoUrlApi = repoUrl.replace('github.com', 'api.github.com/repos');
    repoUrlApi = `${repoUrlApi}/commits/master`;
    fetch(repoUrlApi, { method: 'get' })
      .then(res => res.json())
      .then(data => {
        const { date } = data.commit.author;
        resolve(date);
      })
      .catch(err => {
        reject(err.message)
      })
  })
}

function newCheck(repoUrl, repoName, outputFile) {
  try {
    execSync(`~/findead-web/scripts/main.sh ${repoUrl} ${repoName} ${outputFile}`);
  } catch (err) {
    console.log("ERRO AQUI")
    console.error(err);
  };
}

app.listen(8080);