# Contributing to Nextjs & Mastra AI Application

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## 🤝 Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/repository-name.git`
3. Set up the development environment as described in the [README.md](./README.md)

## 💻 Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-you-are-fixing
   ```

2. Make your changes, following the [coding standards](#coding-standards)

3. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: description of the feature"
   ```

4. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request from your branch to the main repository

## 🔄 Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md or other documentation if necessary
3. Include tests for your changes if applicable
4. Make sure all tests pass
5. Your pull request will be reviewed by the maintainers, who may request changes

## 📝 Coding Standards

- Follow the existing code style in the project
- Use meaningful variable and function names
- Write comments for complex logic
- Follow TypeScript best practices
- Use ESLint to ensure code quality:
  ```bash
  npm run lint
  ```

## 🧪 Testing

- Write tests for new features or bug fixes
- Ensure all existing tests pass before submitting a pull request:
  ```bash
  npm test
  ```

## 📚 Documentation

- Update documentation when adding or changing features
- Document any new environment variables, dependencies, or configuration changes
- Use clear and concise language in documentation
- Include code examples where appropriate

## 🌟 Special Notes for AI Agent Development

When working on AI agents in the `src/mastra` directory:

1. Follow the Mastra framework guidelines
2. Test agent interactions thoroughly
3. Document the agent's capabilities and limitations
4. Consider edge cases in user inputs

Thank you for contributing to this project!