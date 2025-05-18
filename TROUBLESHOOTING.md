# Troubleshooting Guide

This document provides solutions to common issues you might encounter when working with the Nextjs & Mastra AI Application.

## 📋 Table of Contents

- [Development Issues](#development-issues)
- [Docker Issues](#docker-issues)
- [Deployment Issues](#deployment-issues)
- [AI Agent Issues](#ai-agent-issues)
- [Langfuse Integration Issues](#langfuse-integration-issues)

## 💻 Development Issues

### Next.js Development Server Won't Start

**Issue**: `npm run dev` fails to start the development server.

**Solutions**:

1. Check Node.js version compatibility:
   ```bash
   node -v
   ```
   Ensure you're using a version compatible with Next.js 15.2.3.

2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

3. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### TypeScript Errors

**Issue**: TypeScript compilation errors when building or running the application.

**Solutions**:

1. Check for type errors:
   ```bash
   npx tsc --noEmit
   ```

2. Update TypeScript dependencies:
   ```bash
   npm update typescript @types/react @types/node @types/react-dom
   ```

## 🐳 Docker Issues

### Docker Build Fails

**Issue**: `docker build` command fails with errors.

**Solutions**:

1. Check Docker installation:
   ```bash
   docker --version
   ```

2. Ensure Docker daemon is running:
   ```bash
   docker info
   ```

3. Check for disk space issues:
   ```bash
   df -h
   ```

4. Try building with no cache:
   ```bash
   docker buildx build --no-cache --platform=linux/x86_64 -t nextjs-mastra .
   ```

### Container Exits Immediately

**Issue**: Docker container stops running immediately after starting.

**Solutions**:

1. Check container logs:
   ```bash
   docker logs <container_id>
   ```

2. Run with interactive shell to debug:
   ```bash
   docker run -it --entrypoint /bin/sh nextjs-mastra
   ```

## ☁️ Deployment Issues

### CDK Deployment Fails

**Issue**: `cdk deploy` command fails with errors.

**Solutions**:

1. Check AWS credentials:
   ```bash
   aws sts get-caller-identity
   ```

2. Ensure CDK is bootstrapped:
   ```bash
   npx cdk bootstrap
   ```

3. Check CloudFormation console for detailed error messages.

4. Try deploying with verbose logging:
   ```bash
   cdk deploy --verbose
   ```

### ECS Service Not Running

**Issue**: ECS service is not running after deployment.

**Solutions**:

1. Check ECS service events in AWS console.

2. Check CloudWatch logs for container errors.

3. Verify task definition is correct.

4. Check security groups and network configuration.

## 🤖 AI Agent Issues

### Agent Not Responding Correctly

**Issue**: Mastra AI agent doesn't provide expected responses.

**Solutions**:

1. Check environment variables for Amazon Bedrock:
   ```
   REGION
   ```

2. Verify IAM permissions for Bedrock access.

3. Check agent configuration in `/src/mastra/agents`.

4. Test with simpler prompts to isolate the issue.

### Rate Limiting or Quota Issues

**Issue**: Receiving errors related to rate limits or quotas.

**Solutions**:

1. Check AWS Bedrock service quotas in AWS console.

2. Implement retry logic with exponential backoff.

3. Request quota increase if needed.

## 📊 Langfuse Integration Issues

### Langfuse Not Recording Data

**Issue**: Interactions are not being recorded in Langfuse.

**Solutions**:

1. Verify environment variables:
   ```
   PUBLICK_KEY
   SECRET_KEY
   BASE_URL
   ```

2. Check network connectivity to Langfuse servers.

3. Look for errors in application logs.

4. Ensure Langfuse integration is properly configured in the code.

## 🔄 Common Error Messages

### "Cannot find module..."

**Solution**: Install the missing dependency:
```bash
npm install <missing_module>
```

### "Port 3000 is already in use"

**Solution**: Kill the process using the port or use a different port:
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
# Or start on different port
PORT=3001 npm run dev
```

### "AccessDenied" in AWS operations

**Solution**: Check IAM permissions and ensure your AWS credentials have the necessary permissions.

## 🆘 Getting Additional Help

If you're still experiencing issues after trying these solutions:

1. Check the [GitHub Issues](https://github.com/your-username/repository-name/issues) to see if others have encountered the same problem.

2. Create a new issue with detailed information about your problem, including:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Node.js version, etc.)
   - Logs (with sensitive information removed)

3. Reach out to the project maintainers for assistance.