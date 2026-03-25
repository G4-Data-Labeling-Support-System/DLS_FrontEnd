def call(config) {
    String image = "${config.dockerUser}/${config.appName}"
    String version = "${config.release}-release.${env.BUILD_NUMBER}b"
    String imageTagged = "${image}:${version}"

    stage('Deploy to Production Server') {

        sshagent(['production-srv']) {
            sh"""
                ssh -o StrictHostKeyChecking=no -l ${config.prodServer} \
                'echo "Deploying to version ${version}"

                sudo docker pull ${imageTagged} && 

                sudo docker stop ${config.appName} || true && 
                sudo docker rm ${config.appName} || true &&

                sudo docker run -d -p ${config.prodPort}:${config.containerPort} \
                --name ${config.appName} \
                --restart unless-stopped \
                ${imageTagged}'
            """
        }
    }
}

return this