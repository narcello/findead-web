const express = require('express');
const app = express();
const fetch = require("node-fetch");

app.use(express.static('public'))

app.get('/url', async function (req, res) {
  res.writeHead(200, { 'Content-type': 'text/plain' });
  try {
    const isReactRepositorieRes = await isReactRepositorie(req.query.repoUrl);
    res.write(isReactRepositorieRes);
  } catch (error) {
    res.write(error);
  }
  res.end();
});

function getUserAndRepoNamesFromUrl(repoUrl) {
  const regex = new RegExp('(.com\/)(.*)\/(.*)');
  let res = repoUrl.match(regex);
  console.log(res)

}

function isReactRepositorie(repoUrl) {
  return new Promise((resolve, reject) => {
    let repoUrlRaw = repoUrl.indexOf('.git') > -1 ? repoUrl.replace('.git', '') : repoUrl;
    repoUrlRaw = repoUrlRaw.replace('github', 'raw.githubusercontent');
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
        const { type } = err;
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

app.listen(8080);