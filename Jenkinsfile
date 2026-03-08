pipeline {
    agent any

    environment {
        IMAGE_NAME = 'pet-insurance-devops'
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
        SONAR_TOKEN = credentials('sonar-token')
        SNYK_TOKEN = credentials('snyk-token')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME} | Build: ${env.BUILD_NUMBER}"
            }
        }

        stage('Install') {
            steps {
                sh 'node --version'
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test:ci'
            }
            post {
                always {
                    junit 'jest-junit.xml'
                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=pet-insurance-devops \
                          -Dsonar.sources=src \
                          -Dsonar.exclusions=**/*.spec.ts \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Snyk Security Scan') {
            steps {
                sh "npx snyk test --severity-threshold=high --token=${SNYK_TOKEN} || true"
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${env.BUILD_NUMBER} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Snyk Container Scan') {
            steps {
                sh "npx snyk container test ${IMAGE_NAME}:${env.BUILD_NUMBER} --severity-threshold=high --token=${SNYK_TOKEN} || true"
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    echo ${DOCKER_CREDENTIALS_PSW} | docker login -u ${DOCKER_CREDENTIALS_USR} --password-stdin
                    docker tag ${IMAGE_NAME}:${env.BUILD_NUMBER} ${DOCKER_CREDENTIALS_USR}/${IMAGE_NAME}:${env.BUILD_NUMBER}
                    docker tag ${IMAGE_NAME}:latest ${DOCKER_CREDENTIALS_USR}/${IMAGE_NAME}:latest
                    docker push ${DOCKER_CREDENTIALS_USR}/${IMAGE_NAME}:${env.BUILD_NUMBER}
                    docker push ${DOCKER_CREDENTIALS_USR}/${IMAGE_NAME}:latest
                """
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                branch 'main'
            }
            steps {
                sh """
                    sed -i 's|IMAGE_TAG|${env.BUILD_NUMBER}|g' k8s/deployment.yml
                    kubectl apply -f k8s/
                    kubectl rollout status deployment/pet-insurance-api -n pet-insurance
                """
            }
        }
    }

    post {
        always {
            sh 'docker logout || true'
            cleanWs()
        }
        success {
            echo "Pipeline succeeded - Build #${env.BUILD_NUMBER}"
        }
        failure {
            echo "Pipeline failed - Build #${env.BUILD_NUMBER}"
        }
    }
}
