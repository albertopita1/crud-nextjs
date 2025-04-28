pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker compose build app'
            }
        }

        stage('Run Tests') {
            steps {
                // Aquí podrías poner npm test si tuvieras
                echo 'No tests defined'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d app'
            }
        }
    }
}
