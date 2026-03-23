def call() {
    stage('Trivy Filesystem Scan') {
        steps {
            sh '''
                trivy fs . --format json --output trivyfs.json
                trivy fs . --format table --output trivy.txt
                cat trivy.txt
            '''
            archiveArtifacts artifacts: 'trivy.*', allowEmptyArchive: true
        }
    }
}
