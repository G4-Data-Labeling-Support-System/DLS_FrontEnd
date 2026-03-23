def call(config) {

    String sonarHostUrl = "https://sonarqube.hikarimoon.pro"

    stage('SonarQube Analysis') {
        withSonarQubeEnv('SonarQube') {
            echo "#====================== Sonar Scan for (${env.BRANCH_NAME}) ======================#"

            sh """
                mvn clean verify sonar:sonar \
                -Dsonar.projectKey=${config.appName}-${env.BRANCH_NAME} \
                -Dsonar.projectName="${config.appName} (${env.BRANCH_NAME})" \
                -Dsonar.host.url=${sonarHostUrl}
            """
        }
    }

    stage('Quality Gate') {
        script {
            timeout(time: 10, unit: 'MINUTES') {
                def qg = waitForQualityGate()

                if (qg.status != 'OK') {
                    if (env.BRANCH_NAME == 'main') {
                        error "❌ Quality Gate failed for MAIN: ${qg.status}. Deployment blocked!"
                    } else {
                        echo "⚠️ Quality Gate failed for DEV: ${qg.status}. Continuing..."
                        currentBuild.result = 'UNSTABLE'
                    }
                } else {
                    echo "✅ Quality Gate PASSED"
                }
            }
        }
    }
}