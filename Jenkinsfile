node {

    def buildStatus = 'SUCCESS'
    def slackNotify

    try {
        stage('Checkout') {
            checkout scm
        }

        // Configs
        def config = [
            appName: 'data-labeling-fe',
            dockerUser: 'fleeforezz',

            release: '1.0.0',
            beta: '1.0.0',
            
            containerPort: '5173',
            testPort: '5173',
            devPort: '5174',
            betaPort: '5175',
            prodPort: '5176',
            
            devServer: 'jso@192.168.1.74',
            prodServer: 'jso@192.168.1.23',

            manifestRepo: 'https://github.com/G4-Data-Labeling-Support-System/Infrastructure.git',
            // env: '${env.BRANCH_NAME == 'main' ? 'production' : 'development'}',
            // k8sNamespace: '${env.BRANCH_NAME == 'main' ? 'prod' : 'dev'}'
        ]

        // Env variables
        slackNotify = load "ci/slack.groovy"
        def sonarqubePipeline = load "ci/sonarqube.groovy"
        def trivyFilesystemScan = load "ci/trivy-filesystem-scan.groovy"
        def dockerPipeline = load "ci/docker.groovy"

        def deployProd = load "ci/deploy-prod.groovy"
        def deployBeta = load "ci/deploy-beta.groovy"
        def deployDev = load "ci/deploy-dev.groovy"

        def updateManifest = load "ci/update-manifest.groovy"

        // Call functions base on branch
        if (env.BRANCH_NAME == "main") {
            // sonarqubePipeline.call(config)
            trivyFilesystemScan.call()
            dockerPipeline.call(config)
            deployProd.call(config)
            // updateManifest.call(config)
        } else if (env.BRANCH_NAME == "development") {
            // sonarqubePipeline.call(config)
            trivyFilesystemScan.call()
            dockerPipeline.call(config)
            deployBeta.call(config)
            // updateManifest.call(config)
        } else {
            // sonarqubePipeline.call(config)
            // trivyFilesystemScan.call()
            dockerPipeline.call(config)
            deployDev.call(config)
        }
    }
    catch (err) {
        buildStatus = 'FAILURE'
        currentBuild.result = 'FAILURE'
        throw err // keep pipeline failed
    } finally {
        if (slackNotify != null) {
            slackNotify.call(buildStatus)
        } else {
            echo "Slack notify not loaded"
        }

        sh"""
            docker image prune -f
            docker rmi \$(docker images -q 'fleeforezz/data-labeling-fe') --force || true
        """

        // Clean up workspace after run the pipeline
        stage('Cleanup') {
            cleanWs()
        }
    }

}