properties([buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '5')), disableConcurrentBuilds()])

node {
    def workspace = pwd()
    try {
        stage ('Clone') {
        	checkout scm
        }
        stage ('Build') {
            sh 'npm install'
            sh 'npm run build'
        }
      	stage ('Deploy') {
      	    sh "aws s3 sync build/ s3://ants-cosmashing"
      	}
    } catch (err) {
        currentBuild.result = 'FAILED'
        throw err
    }

}