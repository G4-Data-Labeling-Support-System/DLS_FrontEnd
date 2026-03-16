def call(config) {
    String image = "${config.dockerUser}/${config.appName}"
    String version = "${config.beta}-beta.${env.BUILD_NUMBER}b"
    String imageTagged = "${image}:${version}"

    stage('Deploy to Development Server with Beta tag') {

        sshagent(['development-srv']) {
            sh"""
                ssh -o StrictHostKeyChecking=no -l ${config.devServer} \
                'sudo docker pull ${imageTagged} && 
                
                sudo docker stop ${config.appName}-beta || true && 
                sudo docker rm ${config.appName}-beta || true &&
                
                sudo docker run -d -p ${config.betaPort}:${config.containerPort} \
                --name ${config.appName}-beta \
                --restart unless-stopped \
                ${imageTagged}'
            """
        }
    }
}

return this