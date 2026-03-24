def call(config) {
    String image = "${config.dockerUser}/${config.appName}:beta-latest"

    stage('Deploy to Development Server with Beta tag') {

        sshagent(['development-srv']) {
            sh"""
                ssh -o StrictHostKeyChecking=no ${config.devServer} \
                'sudo docker pull ${image} && 
                
                sudo docker stop ${config.appName}-beta || true && 
                sudo docker rm ${config.appName}-beta || true &&
                
                sudo docker run -d -p ${config.betaPort}:${config.containerPort} \
                --name ${config.appName}-beta \
                --restart unless-stopped \
                ${image}'
            """
        }
    }
}

return this