def call(config) {

    stage('Checkout Manifest Repository') {
        script {
            sh """
                rm -rf infrastructure || true
                git clone ${config.manifestRepo} infrastructure
            """
        }
    }

    stage('Update Manifest Files') {
        dir('infrastructure') {
            script {
                def deploymentPath = env.BRANCH_NAME == 'main' ?
                    'k8s-gitops/overlays/prod/patch-deployment.yaml' :
                    'k8s-gitops/overlays/dev/patch-deployment.yaml'

                sh """
                    echo "Current deployment file:"
                    cat ${deploymentPath}

                    echo ""
                    echo "Updating image to: ${env.IMAGE_TAGGED}"

                    # Update the image tag using yq (more reliable than sed for YAML)
                    # If yq is not available, fall back to sed
                    if command -v yq &> /dev/null; then
                        yq eval '.spec.template.spec.containers[0].image = "${env.IMAGE_TAGGED}"' -i ${deploymentPath}
                    else
                        # Using sed with more precise matching
                        sed -i 's|image: fleeforezz/data-labeling-be:.*|image: ${env.IMAGE_TAGGED}|g' ${deploymentPath}
                    fi

                    echo ""
                    echo "Updated deployment file:"
                    cat ${deploymentPath}
                """
            }
        }
    }

    stage('Commit and Push Manifest Changes') {
        dir('infrastructure') {
            script {
                withCredentials([sshUserPrivateKey(credentialsId: 'guests-ssh', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        # Setup SSH
                        mkdir -p ~/.ssh
                        ssh-keyscan github.com >> ~/.ssh/known_hosts
                                
                        # Configure Git
                        git config user.email "fleeforezz@gmail.com"
                        git config user.name "fleeforezz"
                                
                        # Set SSH URL for push
                        git remote set-url origin git@github.com:G4-Data-Labeling-Support-System/Infrastructure.git
                                
                        # Setup SSH agent
                        eval \$(ssh-agent -s)
                        ssh-add ${SSH_KEY}
                                
                        # Check for changes
                        git status
                                
                        # Add and commit changes
                        git add .
                                
                        # Commit with skip ci flag to avoid triggering another build
                        git commit -m "🚀 [${ENVIRONMENT}] Update ${APP_NAME} to ${env.IMAGE_TAG_SHORT} - Build #${env.BUILD_NUMBER} [skip ci]" || {
                            echo "No changes to commit"
                            exit 0
                        }
                                
                        # Push changes
                        git push origin main
                                
                        echo "✅ Successfully pushed manifest updates"
                    """
                }
            }
        }
    }
}
