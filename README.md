# Node.js Microservice CI/CD with Jenkins, Docker, Kubernetes, Terraform, and Observability Stack

This project showcases a **complete DevOps CI/CD pipeline** for deploying a Node.js microservice using:
- Jenkins for CI/CD
- Docker for containerization
- Kubernetes for orchestration
- Terraform for infrastructure provisioning
- Helm for package management
- Grafana, Loki, and Tempo for full observability

---
##  Folder Structure

```
NodeMicroservice-CICD/
├── Dockerfile
├── Jenkinsfile
├── package.json
├── package-lock.json
├── src/                      # Node.js microservice source code
├── node_modules/
├── kafka/
│   └── k8s/
│       └── kafka-kraft.yaml
├── kubedeploy/
│   ├── node-deployment.yaml
│   └── node-service.yaml
├── terraform/                # Terraform files to provision EC2, worker nodes, VPC, etc.
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── observability/
│   ├── grafana/
│   │   └── datasource.yaml
│   ├── loki/
│   │   └── loki-stack-values.yaml
│   └── tempo/
│       └── tempo-values.yaml
└── README.md
```

---

## 🛠️ Tools & Technologies Used

| Area              | Stack Used |
|-------------------|------------|
| Provisioning      | Terraform (EC2, IAM, VPC, Security Groups, Workers) |
| CI/CD             | Jenkins (Pipeline as Code) |
| Containerization  | Docker, Docker Hub |
| Orchestration     | Kubernetes (Single-node Control Plane + Worker Nodes) |
| Monitoring & Logs | Grafana, Loki, Tempo (via Helm) |
| Source Control    | GitHub |

---

## ⚙️ Infrastructure Workflow (Provisioning with Terraform)

✅ **Terraform is not optional in this setup** — it is the foundation of infrastructure:

1. **Created Jenkins master node** on EC2 via Terraform.
2. **Installed and configured Jenkins**, Docker, kubectl, and Helm manually on that instance.
3. **Provisioned 3 Kubernetes Worker Nodes** using Terraform to form a cluster.
4. **Control plane initialized** on the same node (for learning/demo purposes).
5. **Worker nodes joined using the kubeadm token**.
6. Confirmed all nodes ready: `kubectl get nodes`.

---

## 🧪 Jenkins Pipeline Overview (`Jenkinsfile`)

```groovy
pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = 'dockerhub-creds' // Jenkins credential ID
        IMAGE_NAME = 'sainathmitalakar/my-node-microservice'
        KUBECONFIG_PATH = '/var/lib/jenkins/.kube/config'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/sainathmitalakar/my-node-microservice.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "📦 Building Docker image..."
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:latest")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "☁️ Pushing Docker image to Docker Hub..."
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_HUB_CREDENTIALS}") {
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy Kafka (KRaft Mode)') {
            steps {
                echo "🟡 Deploying Kafka in KRaft mode..."
                script {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_PATH}
                        kubectl apply -f kafka/k8s/kafka-kraft.yaml
                    '''
                }
            }
        }

        stage('Install Loki Stack via Helm') {
            steps {
                echo "🔍 Installing Loki Stack..."
                script {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_PATH}
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
                echo "⏱️ Installing Tempo..."
                script {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_PATH}
                        helm upgrade --install tempo grafana/tempo \
                          -f observability/tempo/tempo-values.yaml \
                          -n monitoring
                    '''
                }
            }
        }

        stage('Apply Grafana Datasource Config') {
            steps {
                echo "📊 Applying Grafana datasources..."
                script {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_PATH}
                        kubectl apply -f observability/grafana/datasource.yaml -n monitoring
                    '''
                }
            }
        }

        stage('Deploy Node.js App to Kubernetes') {
            steps {
                echo "🚀 Deploying Node.js app..."
                script {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG_PATH}
                        kubectl apply --validate=false -f kubedeploy/node-deployment.yaml
                        kubectl apply --validate=false -f kubedeploy/node-service.yaml
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            echo '✅ Pipeline execution completed.'
        }
        failure {
            echo '❌ Build failed. Check logs.'
        }
    }
}
```

---

## 🔭 Observability Stack

| Tool    | Purpose         |
|---------|-----------------|
| Grafana | Visualization   |
| Loki    | Logs Aggregator |
| Tempo   | Traces Viewer   |

Deployed via Helm with custom values files, all in the `observability/` folder.

---

## 🧰 How to Run This Project

1. 🔧 Clone the repository.
2. ⚙️ Provision EC2 Jenkins and Worker Nodes using `terraform apply`.
3. 🔑 Ensure Jenkins has Docker, Helm, kubectl installed.
4. 👷‍♂️ Set up Jenkins credentials:
   - DockerHub: `dockerhub-creds`
5. ✅ Ensure `.kube/config` is properly copied to `/var/lib/jenkins/.kube/config`.
6. ▶️ Run the Jenkins pipeline.
7. 🕵️‍♂️ Monitor logs, deployments, and services via `kubectl` and Grafana.

---

## 📦 Docker Hub

Docker Image:  
🔗 [sainathmitalakar/my-node-microservice](https://hub.docker.com/r/sainathmitalakar/my-node-microservice)

---

## 🙌 Final Thoughts

This project demonstrates the **end-to-end DevOps lifecycle** — from provisioning to CI/CD automation to Kubernetes observability.

---

## ✍️ Author

**Sainath Shivaji Mitalakar**  
DevOps Engineer | India
[Topmate](https://topmate.io/sainathmitalakar) 
[LinkedIn](https://linkedin.com/in/sainathmitalakar) 
[GitHub](https://github.com/sainathmitalakar)
