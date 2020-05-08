#!/usr/bin/env groovy

@Library("liveramp-base@v1") _

pipeline {
  options {
    ansiColor('xterm')
    disableConcurrentBuilds()
    // This discards builds after there are either 50 unique builds
    // or a build is older than 30 days
    buildDiscarder(logRotator(numToKeepStr: '50', daysToKeepStr: '30'))
  }

  environment {
    // SonarCloud access token for report upload
    SONAR_TOKEN = credentials('sonar--jenkins-access-token')
    IMAGE_TAG = "local-registry/ts-mutations"
  }

  triggers {
    // Github hook to build whenever a commit is pushed
    githubPush()
    // This creates a trigger to run dependency builds
    snapshotDependencies()
    // Github hook to build whenever 'jenkins please' is in a comment on github
    issueCommentTrigger('.*jenkins\\W+(((test|build|run|do)\\W+this)|again|git\\W+r\\W+done|please|make it so).*')
  }

  agent any

  stages {
    stage('Execute tests') {
      steps {
        sh 'bin/jenkins/run-tests'
      }
    }

    stage('Run SonarCloud Analysis'){
      steps {
        sshagent(credentials: ['ops-github--github.com']) {
          withCredentials(bindings: [
            file(
                credentialsId: 'gcp-gcr--liveramp-jenkins',
                variable: 'GOOGLE_APPLICATION_CREDENTIALS'
              )
          ]) {
            sh './bin/jenkins/sonarcloud'
          }
        }
      }
    }
}
    

  post {
    always {
      sendNotifications {}
    }
  }
}
