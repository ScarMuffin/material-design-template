<h1>1. Spin up a VM</h1>

I took a virtual machine in the Hetzner data center for the task with github hooks would work correctly and everything was made on root user and you can check my website in http://88.198.130.104/

<h1> 2. Install Nginx web server and git </h1>

apt update
apt install -y nginx git


<h1> 3. Fork GitHub repo https://github.com/joashp/material-design-template </h1>

To fork repository we should go on the link and click on fork button in it
Then:
cd /var/
git init .
git remote add origin git@github.com:user/repo.git
git fetch origin

#After that we should configure our nginx config

vi /etc/nginx/sites-available/default

#And change here root for /var/www/;

#After that restart your nginx using command:

systemctl restart nginx

<h1> 4. Setup a cron job for a regular (every 1 minute) checkout from main branch https://github.com/YOURNAME/mdt-fork </h1>
  #To set up a cron job and pull changes from repo we should put a simple script
  
  #!/bin/bash
  cd /var/ && git pull
  
  #And put this somewhere and after using crontab -e we should add */1 * * * * /root/gitpull.sh and save it
  #Here is the screenshot of cron log
<a href="https://savepice.ru" target="_blank" title="хостинг картинок"><img src="https://cdn1.savepice.ru/uploads/2021/10/10/81949766b1b5cd2c353a0400104c39e6-full.png" border="0"/></a>
  
  <h1> 5. Update index.html from your machine, push changes to Git and confirm updated content on web page </h1>
  
  #For making changes we should add a new feature brach using command:
  git checkout -b <your_featurebranchn_name>
  
  #Then you can make changes in index.html and push it using command:
  git push <remote> <branch>
  
  #Then changes will be uploaded to your feature branch
  #To put in into master branch we should make a pull request and then confirm it
 
  <h1> 6. Configure Github hook instead of cron </h1>
  #For configuring github hook I used nodejs in website https://www.robinwieruch.de/github-webhook-node-js code and recoded it a little bit for our task code you can see in webhook.js
  #I added it in github webhooks on port 5001 and after pull request github sends request to run same gitpull.sh script  which was in 4 task
  
  #Here is the screenshot how it works
  
  <a href="https://savepice.ru" target="_blank" title="хостинг картинок"><img src="https://cdn1.savepice.ru/uploads/2021/10/10/63ee7352368611904ba2d685099f3de9-full.png" border="0"/></a>
  
  #And here is a screenshot which confirms that its works
  <a href="https://savepice.ru" target="_blank" title="хостинг картинок"><img src="https://cdn1.savepice.ru/uploads/2021/10/10/031e1d00b8669e3031c3d20804aa032a-full.png" border="0"/></a>
  
  <h1> 7. Configure Nginx to Proxy Websockets and cache static content within 1 hour  </h1>
  
  #To configure our nginx to cache static content within 1 hour we should edit our website configuration file in /etc/nginx/sites-availible/<your_website>
  #And put there:
  
  
          location ~* \.(?:ico|css|js|gif|jpe?g|png)$ {
            expires 1h;
            add_header Vary Accept-Encoding;
            access_log off;
        }
  
  #You can also see how it works in my website http://88.198.130.104/ and if you use console in your browser and see networking and click on files you can see:
  cache-control: max-age=3600
  
  #What means that our images will be cached for 1 hour
  
  #And here is the screenshot of my own website
  
  <a href="https://savepice.ru" target="_blank" title="хостинг картинок"><img src="https://cdn1.savepice.ru/uploads/2021/10/10/8355a1f0c3109b981864d0b65b2a0834-full.png" border="0"/></a>
  
  
  <h1> 8. Merge feature branch with main, rebase git merge commit, squash all commits </h1>
  
  #For merge our feature (f.e. I have sashokfeature branch) branch with main(master) we should first go to master with command:
  
  git checkout master
  
  #Then we should merge this
  
  git merge sashokfeature
  
  #And then rebase it 
  
  git rebase sashokfeature
  
  #After that we can squash commits using:
  
  git rebase -i HEAD~7
