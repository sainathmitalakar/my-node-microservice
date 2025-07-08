pipeline {
  agent any

  environment {
    IMAGE_NAME = "sainathmitalakar/my-node-microservice:latest"
    KUBECONFIG = "/var/lib/jenkins/.kube/config"
  }

  stages {

    stage('Clone Repo') {
      steps {
        echo "📥 Cloning repository..."
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "🐳 Building Docker image..."
        script {
          docker.build("${IMAGE_NAME}")
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        echo "☁️ Pushing Docker image to Docker Hub..."
        script {
          docker.withRegistry('', 'dockerhub-creds') {
            docker.image("${IMAGE_NAME}").push()
          }
        }
      }
    }

    stage('Deploy Kafka (KRaft Mode)') {
      steps {
        echo "🟡 Deploying Kafka in KRaft mode..."
        withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
          sh 'kubectl apply -f kafka/k8s/kafka-kraft.yaml'
        }
      }
    }

    stage('Install Loki via Helm') {
      steps {
        echo "📊 Installing Loki Stack via Helm..."
        withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
          sh '''
            helm repo add grafana https://grafana.github.io/helm-charts
            helm repo update
            helm upgrade --install loki grafana/loki-stack \
              -f observability/loki/loki-stack-values.yaml \
              -n monitoring --create-namespace
          '''
        }
      }
    }

    stage('Install Tempo via Helm') {
      steps {
        echo "🧪 Installing Tempo via Helm..."
        withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
          sh '''
            helm repo add grafana https://grafana.github.io/helm-charts
            helm repo update
            helm upgrade --install tempo grafana/tempo \
              -f observability/tempo/tempo-values.yaml \
              -n monitoring --create-namespace
          '''
        }
      }
    }

    stage('Install Grafana via Helm') {
      steps {
        echo "📈 Installing Grafana via Helm..."
        withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
          sh '''
            helm upgrade --install grafana grafana/grafana \
              --set adminPassword=admin \
              -n monitoring --create-namespace
          '''
        }
      }
    }

    stage('Deploy Node.js Microservice') {
      steps {
        echo "🚀 Deploying Node.js app to Kubernetes..."
        withEnv(["KUBECONFIG=${KUBECONFIG}"]) {
          sh '''
            kubectl apply --validate=false -f kubedeploy/node-deployment.yaml
            kubectl apply --validate=false -f kubedeploy/node-service.yaml
          '''
        }
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline completed successfully."
    }
    failure {
      echo "❌ Pipeline failed. Check logs for more details."
    }
    always {
      cleanWs()
    }
  }
}
