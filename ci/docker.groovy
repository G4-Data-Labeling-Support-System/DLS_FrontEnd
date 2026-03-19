def call(config) {

    String image = "${config.dockerUser}/${config.appName}"

    // Version tags
    String version
    if (env.BRANCH_NAME == 'main') {
        version = "${config.release}-release.${env.BUILD_NUMBER}b" // 1.1.2-release.78b
    } else if (env.BRANCH_NAME == 'development') {
        version = "${config.beta}-beta.${env.BUILD_NUMBER}b" // 1.1.2-beta.78b
    } else {
        version = "dev-${env.BUILD_NUMBER}b" // dev-78b
    }

    String imageTagged = "${image}:${version}" // fleeforezz/data-labeling-be:1.1.2-release.78b

    stage('Docker Build') {
        echo "Building Docker image: ${imageTagged}"
        docker.build("${imageTagged}")
    }

    stage('Docker Test') {
        script {
            String containerName = "test-${config.appName}-${env.BUILD_NUMBER}"

            sh """
                docker run -d --name ${containerName} \
                -p ${config.testPort}:${config.testPort} ${imageTagged}

                echo "Waiting for Spring Boot health check..."

                ATTEMPTS=40
                SLEEP=3

                for i in \$(seq 1 \$ATTEMPTS); do
                    if curl -fs http://localhost:${config.testPort}/actuator/health > /dev/null; then
                        echo "App is UP"
                        break
                    fi

                    echo "Attempt \$i/\$ATTEMPTS"
                    sleep \$SLEEP
                done

                curl -f http://localhost:${config.testPort}/actuator/health

                docker stop ${containerName}
                docker rm ${containerName}
            """
        }
    }

    stage('Push Docker Image') {
        withDockerRegistry(
            credentialsId: 'Docker_Login',
            url: 'https://index.docker.io/v1/'
        ) {
            def dockerImage = docker.image("${image}:${version}")

            if (env.BRANCH_NAME == "main") {
                dockerImage.push()         // version tag
                dockerImage.push("release-latest") // production latest
            } else if (env.BRANCH_NAME == "development") {
                dockerImage.push()            // version tag
                dockerImage.push("beta-latest") // beta latest
            } else {
                dockerImage.push("dev-latest") // dev latest
            }
        }
    }
}

return this