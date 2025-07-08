pipeline {
  agent any

  environment {
    IMAGE_NAME = "sainathmitalakar/my-node-microservice:latest"
    KUBECONFIG = "/var/lib/jenkins/.kube/config"
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

    stage('Deploy Kafka (KRaft Mode)') {
      steps {
        echo "Deploying Kafka..."
        script {
          sh '''
            export KUBECONFIG=${KUBECONFIG}
            kubectl apply -f kafka/k8s/kafka-kraft.yaml
          '''
        }
      }
    }

    stage('Install Loki via Helm') {
      steps {
        echo "Installing Loki Stack..."
        script {
          sh '''
            export KUBECONFIG=${KUBECONFIG}
            helm repo add grafana https://grafana.github.io/helm-charts
            helm repo update
            helm upgrade --install loki grafana/loki-stack \
              -f observability/loki/loki-stack-values.yaml \
              -n monitoring --create-namespace
          '''
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        echo "Deploying Node.js Microservice to Kubernetes..."
        script {
          sh '''
            export KUBECONFIG=${KUBECONFIG}
            kubectl apply --validate=false -f kubedeploy/node-deployment.yaml
            kubectl apply --validate=false -f kubedeploy/node-service.yaml
          '''
        }
      }
    }
  }
}

