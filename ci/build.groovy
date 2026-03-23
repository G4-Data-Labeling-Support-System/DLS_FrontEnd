def call(config) {
    stage('Node Build') {
        echo 'Running Node Build...'

        script {
            sh "npm install"
            sh "npm run build"
        }
    }
}

return this