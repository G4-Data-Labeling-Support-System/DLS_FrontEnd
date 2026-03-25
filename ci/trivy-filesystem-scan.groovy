def call() {
    stage('Trivy Filesystem Scan') {
        sh '''
            trivy fs . --format json --output trivyfs.json
            trivy fs . --format table --output trivy.txt
            cat trivy.txt
        '''
        archiveArtifacts artifacts: 'trivy.*', allowEmptyArchive: true
    }
}

return this
