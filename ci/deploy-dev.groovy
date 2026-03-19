def call(config) {
    String image = "${config.dockerUser}/${config.appName}:dev-latest"

    stage('Deploy to Development Server with Dev tag') {

        sshagent(['development-srv']) {
            sh"""
                ssh -o StrictHostKeyChecking=no ${config.devServer} \
                'sudo docker pull ${image} && 
                
                sudo docker stop ${config.appName}-dev || true && 
                sudo docker rm ${config.appName}-dev || true &&
                
                sudo docker run -d -p ${config.devPort}:${config.containerPort} \
                --name ${config.appName}-dev \
                --restart unless-stopped \
                ${image}'
            """
        }
    }
}

return this