pipeline {
  agent any

  environment {
    IMAGE_NAME = "sainathmitalakar/my-node-microservice:latest"
  }

  stages {

    stage('Clone Repo') {
      steps {
        echo "Cloning repository..."
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "Building Docker image..."
        script {
          docker.build("${IMAGE_NAME}")
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        echo "Pushing image to Docker Hub..."
        script {
          docker.withRegistry('', 'dockerhub-creds') {
            docker.image("${IMAGE_NAME}").push()
          }
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        echo "Deploying to Kubernetes..."
        sh 'kubectl apply -f kubedeploy/node-deployment.yaml'
        sh 'kubectl apply -f kubedeploy/node-service.yaml'
      }
    }
  }
}
