const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');

const SECRET = 'MY_GITHUB_WEBHOOK_SECRET';
 
const GITHUB_REPOSITORIES_TO_DIR = {
  'ScarMuffin/material-design-template': '/root/nodejs/hooks',
};

console.log('Starting webhook handler on port 5001');

http
  .createServer((req, res) => {
    req.on('data', chunk => {
      const body = JSON.parse(chunk);
      console.log(`Get new webhook request`);

      const signature = `sha1=${crypto
        .createHmac('sha1', SECRET)
        .update(chunk)
        .digest('hex')}`;

      //const isAllowed = req.headers['x-hub-signatconst http = require('http') === signature 
      //const body = JSON.parse(chunk);

      const isMaster = body?.ref === 'refs/heads/master';
      const directory = GITHUB_REPOSITORIES_TO_DIR[body?.repository?.full_name];

      if (isMaster && directory) {
        try {
          console.log('Deploy starting');
          exec(`cd ${directory} && bash deploy.sh`);
          console.log('Deploy ending');
        } catch (error) {
          console.log(error);
        }
      }
    });

    res.end();
  })
  .listen(5001);
