pipeline {
    agent any

    environment {
        // Project infof
        APP_NAME = 'data-labeling-fe'
        RELEASE = '1.1'
        GITHUB_URL = 'https://github.com/G4-Data-Labeling-Support-System/DLS_FrontEnd.git'
        GIT_MANIFEST_REPO = "https://github.com/G4-Data-Labeling-Support-System/Infrastructure.git"

        // Sonar Scanner info
        SCANNER_HOME = tool 'sonarqube-scanner'
        SONAR_HOST_URL = 'https://sonarqube.hikarimoon.pro'

        // Docker info
        DOCKER_USER = 'fleeforezz'
        DOCKER_IMAGE_NAME = "${DOCKER_USER}" + '/' + "${APP_NAME}"
        DOCKER_IMAGE_VERSION = "${RELEASE}.${env.BUILD_NUMBER}"

        // Environment-specific variable
        ENVIRONMENT = "${env.BRANCH_NAME == 'main' ? 'production' : 'development'}"
        K8S_NAMESPACE = "${env.BRANCH_NAME == 'main' ? 'prod' : 'dev'}"
    }

    stages {
        stage('Environment Info') {
            steps {
                script {
                    echo "======================================="
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Environment: ${ENVIRONMENT}"
                    echo "Kubernetes Namespace: ${K8S_NAMESPACE}"
                    echo "Build Trigger: ${env.BUILD_CAUSE}"
                    echo "======================================="
                }
            }
        }

        stage('Clean up WorkSpace') {
            steps {
                echo "#====================== Clean up WorkSpace ======================#"
                cleanWs()
            }
        }

        stage('Git Checkout') {
            steps {
                echo '#====================== Git Checkout for (${env.BRANCH_NAME}) ======================#'
                checkout scm: [$class: 'GitSCM',
                    branches: [[name: "${env.BRANCH_NAME}"]],
                    userRemoteConfigs: [[
                        credentialsId: 'github-credentials',
                        url: "${GITHUB_URL}"
                    ]]
                ]
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    echo "#====================== Sonar Scan for (${env.BRANCH_NAME}) ======================#"
                    sh """
                        $SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectKey=${APP_NAME}-${env.BRANCH_NAME} \
                        -Dsonar.projectName="${APP_NAME} (${ENVIRONMENT})" \
                        -Dsonar.host.url=${SONAR_HOST_URL}
                    """
                }
            }
        }

        // stage('Quality Gate') {
        //     steps {
        //         script {
        //             timeout(time: 3, unit: 'MINUTES') {
        //                 def qg = waitForQualityGate()

        //                 if (qg.status != 'OK') {
        //                     if (env.BRANCH_NAME == 'prod') {
        //                         error "Quality Gate failed for PROD: ${qg.status}. Deployment blocked!"
        //                     } else {
        //                         echo "Quality Gate failed for DEV: ${qg.status}. Continuing with warnings..."
        //                         currentBuild.result = 'UNSTABLE'
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }

        stage('Node Build') {
            steps {
                echo "#====================== Node install and build ======================#"
                script {
                    if (env.BRANCH_NAME == 'master') {
                        sh "npm install"
                        sh "npm run build:prod"
                    } else {
                        sh "npm install"
                        sh "npm run build:dev"
                    }
                }
            }
        }

        // stage('OWASP DP-SCAN') {
        //     steps {
        //         dependencyCheck additionalArguments: '', nvdCredentialsId: 'NVD-API', odcInstallation: 'owasp-dp-check'
        //     }
        // }

        stage('Security Scans') {
            parallel {
                stage('Trivy Filesystem Scan') {
                    steps {
                        echo "#====================== Trivy Filesystem scan ======================#"
                        sh """
                            trivy fs . --format json --output trivyfs.json
                            trivy fs . --format table --output trivy.txt
                            cat trivy.txt
                        """
                        archiveArtifacts artifacts: 'trivy.*', allowEmptyArchive: true
                    }
                }

                stage('NPM Audit') {
                    steps {
                        echo "#====================== NPM Security Audit ======================#"
                        sh """
                            npm audit --audit-level=high --json > npm-audit.json || true
                            npm audit --audit-level=high || true
                        """
                        archiveArtifacts artifacts: 'npm-audit.json', allowEmptyArchive: true
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    echo "#====================== Docker Build ======================#"
                    // Dockerfile var
                    def dockerfile = "Dockerfile" // Add custom Dockerfile name ex: ./PathToDockerfile/PathToDockerfile/DevDockerfile
                    def contextDir = "."// Path to DockerFile ex: ./PathToDockerfile/PathToDockerfile

                    // Build Docker image with custom Dockerfile
                    def dockerImage = docker.build(
                        "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}",
                        "-f ${dockerfile} ${contextDir}"
                    )

                    // Build Docker image with normal Dockerfile
                    // def dockerImage = docker.build(
                    //     "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}"
                    // )

                    // Set IMAGE_TAGGED dynamically
                    if (env.BRANCH_NAME == 'main') {
                        env.IMAGE_TAGGED = "${DOCKER_IMAGE_NAME}:latest"
                        dockerImage.tag('latest')  // ✅ Tag latest
                    } else {
                        env.IMAGE_TAGGED = "${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}-beta"
                        dockerImage.tag("${DOCKER_IMAGE_VERSION}-beta")  // ✅ Tag beta
                    }
                }
            }
        }

        stage('Docker Test') {
            steps {
                echo "#====================== Docker Test ======================#"
                script {
                    def containerName = "test-${APP_NAME}-${env.BUILD_NUMBER}"
                    def testPort = env.BRANCH_NAME == 'main' ? '3000' : '5173'

                    // Test docker in background
                    sh """
                        docker run -d --name ${containerName} \
                        -p ${testPort}:${testPort} ${env.IMAGE_TAGGED}

                        echo "⏳ Waiting for Vite to be healthy..."

                        ATTEMPTS=40
                        SLEEP=3

                        for i in \$(seq 1 \$ATTEMPTS); do
                        if curl -fs http://localhost:${testPort}/admin > /dev/null; then
                            echo "App is UP (after \$((i*SLEEP))s)"
                            break
                        fi

                        echo "⏱ Attempt \$i/\$ATTEMPTS – not ready yet"
                        sleep \$SLEEP
                        done

                        echo "🔍 Final health check"
                        curl -f http://localhost:${testPort}/admin

                        docker stop ${containerName}
                        docker rm ${containerName}
                    """
                }
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                echo "#====================== Trivy Docker Image Scan ======================#"
                script {
                    def securityLevel = env.BRANCH_NAME == 'main' ? 'HIGH,CRITICAL' : 'CRITICAL'

                    sh "trivy image --no-progress --exit-code 1 --format json --severity UNKNOWN,HIGH,CRITICAL ${env.IMAGE_TAGGED} > trivyimage.txt || true"

                    sh """
                        trivy image --no-progress --format json \
                            --severity ${securityLevel} \
                            --output trivyimage.json ${env.IMAGE_TAGGED}
                        trivy image --no-progress --format table \
                            --severity ${securityLevel} \
                            --output trivyimage.txt ${env.IMAGE_TAGGED}
                        
                        cat trivyimage.txt
                    """
                }
                archiveArtifacts artifacts: 'trivyimage.txt', allowEmptyArchive: true
            }
        }

        stage('Push to registry') {
            steps {
                echo "#====================== Push Docker Image to DockerHub Registry ======================#"
                script {
                    withDockerRegistry(credentialsId: 'Docker_Login', toolName: 'Docker', url: 'https://index.docker.io/v1/') {
                        def image = docker.image("${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION}")

                        if (env.BRANCH_NAME == 'main') {
                            echo "Pushing production images..."
                            image.push('latest')
                            image.push("v${DOCKER_IMAGE_VERSION}")
                        } else {
                            echo "Pushing development images..."
                            image.push("${DOCKER_IMAGE_VERSION}-beta")
                            image.push('dev-latest')
                        }
                    }
                }
            }
        }

        // stage('Checkout Manifest Repository') {
        //     steps {
        //         script {
        //             echo "#====================== Checkout Manifest Repository ======================#"
                    
        //             sh """
        //                 rm -rf infrastructure || true
        //                 git clone ${GIT_MANIFEST_REPO} infrastructure
        //             """
        //         }
        //     }
        // }

        // stage('Update Manifest Files') {
        //     steps {
        //         echo "#====================== Update Kubernetes Manifest Files ======================#"
        //         dir('infrastructure') {
        //             script {
        //                 def deploymentPath = env.BRANCH_NAME == 'main' ? 
        //                     'k8s-gitops/overlays/prod/patch-deployment.yaml' : 
        //                     'k8s-gitops/overlays/dev/patch-deployment.yaml'
                        
        //                 sh """
        //                     echo "Current deployment file:"
        //                     cat ${deploymentPath}
                            
        //                     echo ""
        //                     echo "Updating image to: ${env.IMAGE_TAGGED}"
                            
        //                     # Update the image tag using yq (more reliable than sed for YAML)
        //                     # If yq is not available, fall back to sed
        //                     if command -v yq &> /dev/null; then
        //                         yq eval '.spec.template.spec.containers[0].image = "${env.IMAGE_TAGGED}"' -i ${deploymentPath}
        //                     else
        //                         # Using sed with more precise matching
        //                         sed -i 's|image: fleeforezz/data-labeling-be:.*|image: ${env.IMAGE_TAGGED}|g' ${deploymentPath}
        //                     fi
                            
        //                     echo ""
        //                     echo "Updated deployment file:"
        //                     cat ${deploymentPath}
        //                 """
        //             }
        //         }
        //     }
        // }

        // stage('Commit and Push Manifest Changes') {
        //     steps {
        //         echo "#====================== Commit and Push Manifest Changes ======================#"
        //         dir('infrastructure') {
        //             script {
        //                 withCredentials([sshUserPrivateKey(credentialsId: 'guests-ssh', keyFileVariable: 'SSH_KEY')]) {
        //                     sh """
        //                         # Setup SSH
        //                         mkdir -p ~/.ssh
        //                         ssh-keyscan github.com >> ~/.ssh/known_hosts
                                
        //                         # Configure Git
        //                         git config user.email "fleeforezz@gmail.com"
        //                         git config user.name "fleeforezz"
                                
        //                         # Set SSH URL for push
        //                         git remote set-url origin git@github.com:G4-Data-Labeling-Support-System/Infrastructure.git
                                
        //                         # Setup SSH agent
        //                         eval \$(ssh-agent -s)
        //                         ssh-add ${SSH_KEY}
                                
        //                         # Check for changes
        //                         git status
                                
        //                         # Add and commit changes
        //                         git add .
                                
        //                         # Commit with skip ci flag to avoid triggering another build
        //                         git commit -m "🚀 [${ENVIRONMENT}] Update ${APP_NAME} to ${env.IMAGE_TAG_SHORT} - Build #${env.BUILD_NUMBER} [skip ci]" || {
        //                             echo "No changes to commit"
        //                             exit 0
        //                         }
                                
        //                         # Push changes
        //                         git push origin main
                                
        //                         echo "✅ Successfully pushed manifest updates"
        //                     """
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    post {
        always {
            script {
                def buildStatus = currentBuild.result ?: 'SUCCESS'
                def statusIcon = buildStatus == 'SUCCESS' ? '✅' : '❌'
                def environment = env.BRANCH_NAME == 'main' ? 'PRODUCTION' : 'DEVELOPMENT'

                emailext(
                    attachLog: true,
                    subject: "${statusIcon} ${buildStatus} - ${environment} Deployment - ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>${statusIcon} ${environment} Deployment ${buildStatus}</h2>
                        <table border="1" cellpadding="5" cellspacing="0">
                            <tr><td><b>Project:</b></td><td>${env.JOB_NAME}</td></tr>
                            <tr><td><b>Build Number:</b></td><td>${env.BUILD_NUMBER}</td></tr>
                            <tr><td><b>Environment:</b></td><td>${environment}</td></tr>
                            <tr><td><b>Branch:</b></td><td>${env.BRANCH_NAME}</td></tr>
                            <tr><td><b>Docker Image:</b></td><td>${env.IMAGE_TAGGED}</td></tr>
                            <tr><td><b>Kubernetes Namespace:</b></td><td>${K8S_NAMESPACE}</td></tr>
                            <tr><td><b>Build URL:</b></td><td><a href="${env.BUILD_URL}">${env.BUILD_URL}</a></td></tr>
                        </table>
                        <br/>
                        <p><b>Artifacts:</b> Security scans and test reports are attached.</p>
                            
                        ${env.CHANGE_ID ? "<p><b>Pull Request:</b> #${env.CHANGE_ID} by ${env.CHANGE_AUTHOR}</p>" : ""}
                    """,
                    to: 'fleeforezz@gmail.com',
                    attachmentsPattern: 'trivyfs.*,trivyimage.*,npm-audit.json'
                )
            }
        }

        success {
            echo "🎉 Pipeline completed successfully!"
        }

        failure {
            echo "💥 Pipeline failed. Check the logs for details."
        }

        cleanup {
            sh """
                echo "🧹 Cleaning up Docker resources..."
                docker stop test-${APP_NAME}-${env.BUILD_NUMBER} || true
                docker rm test-${APP_NAME}-${env.BUILD_NUMBER} || true
                docker rmi ${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_VERSION} || true
                docker rmi ${env.IMAGE_TAGGED} || true
                docker system prune -f || true
                echo "✅ Cleanup completed"
            """
        }
    }
}