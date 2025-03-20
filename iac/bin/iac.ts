#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { IacStack } from '../lib/iac-stack';
import { EcrStack } from '../lib/ecr-stack';

const app = new cdk.App();

// 環境設定
const env = { 
  account: process.env.CDK_DEFAULT_ACCOUNT, 
  region: process.env.CDK_DEFAULT_REGION 
};

// ECRスタックを先に作成
const ecrStack = new EcrStack(app, 'NextjsEcrStack', { env });

// メインスタックを作成し、ECRリポジトリを渡す
// imageTagはデプロイ時に指定できるようにCDKコンテキストから取得
const imageTag = app.node.tryGetContext('imageTag') || 'latest';

new IacStack(app, 'NextjsAppStack', {
  env,
  repository: ecrStack.repository,
  imageTag: imageTag,
});
