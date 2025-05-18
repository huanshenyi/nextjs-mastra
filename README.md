# Nextjs & Mastra AI Application

This project is a Next.js application that uses Mastra AI framework to create intelligent agents and deploys to AWS ECS.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Development Server](#development-server)
- [Docker Build](#docker-build)
- [Infrastructure Deployment](#infrastructure-deployment)
- [Use Cases](#use-cases)
  - [Main Branch: Chef AI Agent](#main-branch-chef-ai-agent)
  - [IoT Agent Branch: Tomato Observation Agent](#iot-agent-branch-tomato-observation-agent)
- [Monitoring with Langfuse](#monitoring-with-langfuse)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Project Overview

This application combines Next.js with Mastra AI framework to create intelligent agents that can assist users with various tasks. The application is containerized with Docker and can be deployed to AWS ECS using the provided infrastructure as code (IaC).

## 🚀 Getting Started

### Prerequisites

- Node.js (version compatible with Next.js 15.2.3)
- npm or yarn or pnpm or bun
- Docker (for containerization)
- AWS CLI (for deployment)

### Environment Setup

First, create your environment file:

```bash
cp .env.example .env.development
```

Make sure to update the environment variables in the `.env.development` file with your specific values.

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🐳 Docker Build

To build and run the Docker image:

```bash
# Build the Docker image
docker buildx build --no-cache --platform=linux/x86_64 -t nextjs-mastra .

# Run the container locally
docker run -p 3000:3000 nextjs-mastra
```

This will make the application available at [http://localhost:3000](http://localhost:3000).

## 🏗️ Infrastructure Deployment

For detailed instructions on deploying the infrastructure to AWS, please refer to the [Infrastructure Documentation](./iac/README.md).

## 💡 Use Cases

### Main Branch: Chef AI Agent

The main branch implements "Chef AI", a cooking recipe assistant that provides the following features:

- Recipe suggestions based on user preferences and constraints (allergies, dietary restrictions, etc.)
- Seasonal ingredient recommendations
- Explanation of basic cooking techniques
- Advice on food storage and usage

Example usage:
```
Q: 夏野菜を使った簡単な料理を教えてください (Please suggest an easy recipe using summer vegetables)
A: [Chef AI provides recipe suggestions]
```

### IoT Agent Branch: Tomato Observation Agent

The `topic/iot-agent` branch implements an agent for tomato cultivation observation using IoT sensors. This agent provides:

- Monitoring of tomato growing environment (temperature, humidity, etc.)
- Optimal care recommendations based on growing conditions
- Anomaly detection and countermeasures
- Growth record management and analysis

Example usage:
```
Q: トマトの葉が黄色くなってきました。何が問題ですか？ (My tomato leaves are turning yellow. What's the problem?)
A: [Tomato observation agent provides diagnosis and countermeasures]
```

## 📊 Monitoring with Langfuse

This project uses [Langfuse](https://langfuse.com/) for monitoring AI interactions. To set it up:

1. Create a Langfuse account
2. Add your Langfuse keys to your `.env` file:

```bash
PUBLICK_KEY=your-value-here
SECRET_KEY=your-value-here
BASE_URL=https://cloud.langfuse.com
```

## 📁 Project Structure

- `/src/app`: Next.js application pages and components
- `/src/lib`: Utility functions and API clients
- `/src/mastra`: Mastra AI agents and tools
- `/iac`: Infrastructure as Code for AWS deployment
- `/public`: Static assets

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md): System architecture and component details
- [Infrastructure Documentation](./iac/README.md): AWS deployment instructions
- [Contributing Guidelines](./CONTRIBUTING.md): How to contribute to this project
- [Environment Variables](./.env.example): Example environment configuration
- [Troubleshooting Guide](./TROUBLESHOOTING.md): Solutions to common issues

## 👥 Contributing

Contributions are welcome! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more information on how to get involved.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.