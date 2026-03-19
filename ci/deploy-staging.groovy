def call(config) {
    String image = "${config.dockerUser}/${config.appName}:dev-latest"

    stage('Deploy to Staging Server') {

        sshagent(['development-srv']) {
            sh"""
                ssh -o StrictHostKeyChecking=no ${config.devServer} \
                'sudo docker pull ${image} && 
                
                sudo docker stop ${config.appName} || true && 
                sudo docker rm ${config.appName} || true &&
                
                sudo docker run -d -p ${config.port}:${config.port} \
                --name ${config.appName} \
                --restart unless-stopped \
                ${image}'
            """
        }
    }
}

return this