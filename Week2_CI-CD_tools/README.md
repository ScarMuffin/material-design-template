<h1>1. Create Jenkins VM with internet access</h1>

For that task I took hetzner VM IP: 88.198.130.104 on Ubuntu 20.04 LTS

```
sudo apt-get update
sudo apt-get install openjdk-8 git
```

For install jenkins we should do:

```
wget -q -O - https://pkg.jenkins.io/debian/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb http://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt-get update
sudo apt-get install jenkins
```

Then you need to go on your jenkins URL and use sudo cat /var/lib/jenkins/secrets/initialAdminPassword to take an initial admin password for setup

And after that you can add a new user or add it in "Manage Jenkins" > "Manage users"
<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-16%20at%2018.39.16.png" border="0"/></a>

For install custom port in jenkins you should edit /etc/default/jenkins and change HTTP_PORT=8080 to HTTP_PORT=8081 you can check it on my vm http://88.198.130.104:8081/


For installs plugin you should go to "Manage Jenkins" > "Manage plugins" and install there GitHub and Role-based authorization strategy or do it on install Jenkins page.

<h1>2. Create Agent VM</h1>

For that task I took Oracle VM IP: 132.145.235.148

<img src="https://github.com/ScarMuffin/material-design-template/blob/08c37773335b3de4c3f780ebd4c8b27dc892e5d1/Week2_CI-CD_tools/Screenshot%202021-10-21%20at%2000.56.13.png" border="0"/></a>

```
sudo apt-get update
sudo apt-get -y install openjdk-8-jre git
sudo useradd -m -d /home/jenkins jenkins
sudo su jenkins
ssh-keygen
cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys
```
Then you should copy a ~/.ssh/id_rsa
After that go http://YOUR_JENKINS_URL/computer/new and create a new node Launch method should be Launch agent via ssh in host you should add your Public VM IP then add credentials "SSH Username with private key" then add jenkins to username and after that add your id_rsa private key to the private key.
In the "Host Key Verification Strategy" you should choose Manually trusted key Verification Strategy and click on "Require manual verification of initial connection"
<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-18%20at%2000.13.16.png" border="0"/></a>
After that you should confirm that connection and that it will work and you can see it in your nodes list.
<img src="https://github.com/ScarMuffin/material-design-template/blob/e0ca24132a582f1d8b05ced7bb3364b0e358c441/Week2_CI-CD_tools/Screenshot%202021-10-21%20at%2000.41.28.png" border="0"/></a>

<h1>3. Configure tools – NodeJS</h1>

To configure NodeJS you shoud go to "Manage Jenkins" -> "Global tool configuration" and add there NodeJS installation with global npm packages to install: uglify-js clean-css-cli
<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-18%20at%2000.31.05.png" border="0"/></a>

<h1>4. Create “Multibranch Pipeline” pipeline job (work inside Lab folder)</h1>

To create a multibrach pipeline you should go to "New item" and choose there multibranch pipeline
<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-17%20at%2020.00.56.png" border="0"/></a>
Then you should put a link for your github repo and add your credentials (if its needed) and in build configuration you should add path to your jenkins file what will be needed in next step

Then you should write a simple pipeline with groovy code:
```
pipeline {
    agent {
        label "oraclevm"
    }

    tools{
        nodejs "nodejs"
    }

    stages {
        stage("Checkout"){
            steps{
                checkout scm
            }
        }
        stage("Compressing"){
            parallel {
                stage("JS compressing"){
                    steps{
                        sh 'cat www/js/* | uglifyjs -o www/min/merged-and-compressed.js --compress'
                    }
                }
                stage("CSS compressing"){
                    steps{
                        sh 'cat www/css/* | cleancss -o www/min/merged-and-minified.css'
                    }
                }
            }
        }
        stage("Archiving artifacts"){
            steps{
                sh "mkdir -p artifacts"
                sh "tar --exclude=.git --exclude=www/js --exclude=www/css --exclude=artifacts -czvf artifacts/result.tar.gz ."
                archiveArtifacts artifacts: "artifacts/result.tar.gz", fingerprint: true
            }
        }
    }
}
```
And then we can see a result after build and check our artifacts in "Last Successful Artifacts"

<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-18%20at%2000.41.34.png" border="0"/></a>

<h1>5. Setup the GitHub webhook to trigger the jobs</h1>

For that task you should Enable ‘GitHub hook trigger for Git SCM polling’
Then you should go to your github account and go to your repository then click on settings and then go Webhooks and add http(s)://JENKINS_URL/git/notifyCommit?url=REPO_URL 

<img src="https://github.com/ScarMuffin/material-design-template/blob/master/Week2_CI-CD_tools/Screenshot%202021-10-18%20at%2000.51.04.png" border="0"/></a>


<h1>* Use Scripted pipeline instead of declarative</h1>

That is code of scripted pipeline:
```
node('oraclevm') {
   env.nodejs = tool 'nodejs'
   env.PATH="${env.nodejs}/bin:${env.PATH}"

     stage(‘checkout’){ 
        checkout scm
    
     }
     stage('Compressing')
     {
         compress = ["JS" : { sh 'cat www/js/* | ${nodejs}/bin/uglifyjs -o www/min/merged-and-compressed.js --compress'},
                     "CSS" : { sh 'cat www/css/* | ${nodejs}/bin/cleancss -o www/min/merged-and-minified.css'}]
          parallel compress
     }
     stage('Archiving artifacts')
     {
        sh "mkdir -p artifacts"
        sh "tar --exclude=.git --exclude=www/js --exclude=www/css --exclude=artifacts -czvf artifacts/result.tar.gz ."
        archiveArtifacts artifacts: "artifacts/result.tar.gz", fingerprint: true
     }
}
```


