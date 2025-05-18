# Architecture Overview

This document provides an overview of the architecture for the Nextjs & Mastra AI Application.

## 📋 Table of Contents

- [System Architecture](#system-architecture)
- [Component Overview](#component-overview)
- [Data Flow](#data-flow)
- [AWS Infrastructure](#aws-infrastructure)
- [Security Considerations](#security-considerations)

## 🏗️ System Architecture

The application follows a modern architecture pattern with the following key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Browser │────▶│  Next.js App    │────▶│  Mastra Agents  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                               ┌─────────────────┐
                                               │                 │
                                               │ Amazon Bedrock  │
                                               │                 │
                                               └─────────────────┘
```

## 🧩 Component Overview

### Frontend (Next.js)

- **Pages**: React components that define the UI
- **API Routes**: Serverless functions for backend logic
- **Client Components**: Interactive UI elements

### Mastra AI Framework

- **Agents**: Specialized AI agents for different use cases
- **Tools**: Utilities that agents can use to perform tasks
- **Prompts**: Templates for generating AI responses

### AWS Services

- **ECS**: Container orchestration for running the application
- **ECR**: Storage for Docker images
- **ALB**: Load balancing for the application
- **Secrets Manager**: Secure storage for environment variables
- **IAM**: Access management for AWS resources

## 🔄 Data Flow

1. User sends a request through the browser
2. Next.js server receives the request
3. If AI functionality is needed, the request is forwarded to the appropriate Mastra agent
4. The agent processes the request, potentially using Amazon Bedrock for AI capabilities
5. The response flows back through the same path to the user
6. Interactions are logged to Langfuse for monitoring and analytics

## ☁️ AWS Infrastructure

The application is deployed on AWS with the following architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                           AWS Cloud                             │
│                                                                 │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐             │
│  │           │     │           │     │           │             │
│  │    ALB    │────▶│    ECS    │────▶│    ECR    │             │
│  │           │     │           │     │           │             │
│  └───────────┘     └───────────┘     └───────────┘             │
│        │                 │                                     │
│        │                 │                                     │
│        │                 ▼                                     │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐             │
│  │           │     │           │     │           │             │
│  │    VPC    │     │  Secrets  │────▶│  Bedrock  │             │
│  │           │     │  Manager  │     │           │             │
│  └───────────┘     └───────────┘     └───────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔒 Security Considerations

- **Authentication**: Not implemented in the current version
- **Authorization**: AWS IAM roles control access to AWS resources
- **Secrets Management**: Environment variables stored in AWS Secrets Manager
- **Network Security**: VPC configuration with security groups
- **Data Privacy**: Consider data retention policies when using AI services

## 🔄 Deployment Process

The deployment process follows these steps:

1. Code is committed to the repository
2. Docker image is built and pushed to ECR
3. CDK deploys the infrastructure
4. ECS pulls the latest image and runs the containers
5. ALB routes traffic to the containers

For detailed deployment instructions, see the [Infrastructure Documentation](./iac/README.md).