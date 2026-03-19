def call(config) {
    stage('Node Build') {
        echo 'Running Node Build...'

        script {
            if (env.BRANCH_NAME == 'main') {
                sh "npm install"
                sh "npm run build:prod"
            } else {
                sh "npm install"
                sh "npm run build"
            }
        }
    }
}

return this