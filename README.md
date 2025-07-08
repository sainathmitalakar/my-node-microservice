# 📦 Node.js Microservice with Jenkins CI/CD, Docker, Kubernetes, Kafka & Observability (LGTM Stack)

This repository contains a **complete DevOps pipeline setup** for a production-ready Node.js microservice. It covers everything from application development and Dockerization to CI/CD with Jenkins, infrastructure deployment on Kubernetes, Kafka messaging, and full observability using Grafana, Loki, and Tempo.

---

## 📁 Project Structure

```
my-node-microservice/
├── Dockerfile                      # Docker config to build container
├── Jenkinsfile                     # Jenkins CI/CD pipeline
├── package.json                    # Node.js app dependencies
├── src/                            # Node.js application source code
├── kubedeploy/                     # Kubernetes deployment and service YAMLs
│   ├── node-deployment.yaml
│   └── node-service.yaml
├── kafka/
│   └── k8s/
│       └── kafka-kraft.yaml        # Kafka in KRaft mode (no Zookeeper)
├── terraform/                      # (Optional) Terraform for infrastructure
├── observability/                 # LGTM Stack configuration
│   ├── loki/
│   │   └── loki-stack-values.yaml
│   ├── tempo/
│   │   └── tempo-values.yaml
│   └── grafana/
│       └── datasource.yaml         # Datasource configs for Grafana
```

---

## ✅ Features & Highlights

* 🎯 **CI/CD with Jenkins**: Full declarative pipeline for build, push and deploy
* 🐳 **Docker**: Node.js app containerization
* ☸️ **Kubernetes**: Self-managed cluster deployment
* ⚡ **Kafka**: Streaming with KRaft mode (no Zookeeper)
* 📊 **Observability**: Loki, Tempo, and Grafana integration (LGTM stack)
* 🔐 **Credential Management**: Docker Hub credentials securely used in Jenkins

---

## 🔧 Technologies Used

| Category       | Tools Used                                 |
| -------------- | ------------------------------------------ |
| Source Control | Git, GitHub                                |
| CI/CD          | Jenkins, Docker, GitHub Webhooks           |
| Infrastructure | Kubernetes (self-managed), Terraform-ready |
| Messaging      | Apache Kafka (KRaft mode)                  |
| Observability  | Grafana, Loki, Tempo                       |

---

## 🚀 Jenkins Pipeline Overview

The `Jenkinsfile` is a declarative pipeline that includes the following stages:

```groovy
pipeline {
  agent any

  environment {
    IMAGE_NAME = 'sainathmitalakar/my-node-microservice'
    KUBECONFIG_PATH = '/var/lib/jenkins/.kube/config'
    DOCKER_HUB_CREDENTIALS = 'dockerhub-creds'
  }

  stages {
    stage('Checkout Code') {
      steps {
        git branch: 'main', url: 'https://github.com/sainathmitalakar/my-node-microservice.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          dockerImage = docker.build("${IMAGE_NAME}:latest")
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', DOCKER_HUB_CREDENTIALS) {
            dockerImage.push('latest')
          }
        }
      }
    }

    stage('Deploy Kafka (KRaft)') {
      steps {
        sh 'kubectl apply -f kafka/k8s/kafka-kraft.yaml'
      }
    }

    stage('Install Loki Stack') {
      steps {
        sh '''
          helm repo add grafana https://grafana.github.io/helm-charts
          helm repo update
          helm upgrade --install loki grafana/loki-stack \
            -f observability/loki/loki-stack-values.yaml \
            -n monitoring --create-namespace
        '''
      }
    }

    stage('Install Tempo') {
      steps {
        sh '''
          helm upgrade --install tempo grafana/tempo \
            -f observability/tempo/tempo-values.yaml \
            -n monitoring
        '''
      }
    }

    stage('Apply Grafana Datasource') {
      steps {
        sh 'kubectl apply -f observability/grafana/datasource.yaml'
      }
    }

    stage('Deploy Node.js App') {
      steps {
        sh '''
          kubectl apply -f kubedeploy/node-deployment.yaml
          kubectl apply -f kubedeploy/node-service.yaml
        '''
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    failure {
      echo '❌ Build failed. Check Jenkins logs.'
    }
  }
}
```

---

## 🧪 Run Locally

```bash
# Clone the repo
$ git clone https://github.com/sainathmitalakar/my-node-microservice.git
$ cd my-node-microservice

# Install dependencies
$ npm install

# Run the app
$ npm start
```

---

## 🐳 Build & Push Docker Image

```bash
# Build
$ docker build -t sainathmitalakar/my-node-microservice:latest .

# Push to Docker Hub
$ docker push sainathmitalakar/my-node-microservice:latest
```

---

## ☸️ Kubernetes Deployment

```bash
kubectl apply -f kubedeploy/node-deployment.yaml
kubectl apply -f kubedeploy/node-service.yaml
```

---

## 📈 Observability Setup

```bash
# Loki
helm upgrade --install loki grafana/loki-stack \
  -f observability/loki/loki-stack-values.yaml \
  -n monitoring --create-namespace

# Tempo
helm upgrade --install tempo grafana/tempo \
  -f observability/tempo/tempo-values.yaml \
  -n monitoring

# Apply Grafana Datasource
kubectl apply -f observability/grafana/datasource.yaml
```

---

## 🧩 Kafka in KRaft Mode

```bash
kubectl apply -f kafka/k8s/kafka-kraft.yaml
```

---

* 🔁 End-to-End CI/CD with Jenkins
* ☸️ Kubernetes-native microservice deployment
* 📊 Advanced observability via LGTM stack
* 🧱 Kafka event streaming in lightweight KRaft mode
* 🔒 Secure credential usage with Jenkins Secrets

---

## 👨‍💻 Author

**Sainath Mitalakar**
🔗 [Topmate](https://topmate.io/sainathmitalakar)
📨 [LinkedIn](https://linkedin.com/in/sainathmitalakar)

---
