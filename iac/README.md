# Nextjs ECS デプロイメントインフラストラクチャ

このプロジェクトは、Nextjs アプリケーションを AWS ECS にデプロイするための CDK インフラストラクチャコードです。

## 📋 目次

- [デプロイされるリソース](#デプロイされるリソース)
- [デプロイ手順](#デプロイ手順)
  - [前提条件](#前提条件)
  - [ステップバイステップガイド](#ステップバイステップガイド)
- [環境変数の設定](#環境変数の設定)
- [権限](#権限)
- [クリーンアップ](#クリーンアップ)
- [トラブルシューティング](#トラブルシューティング)

## 🏗️ デプロイされるリソース

このインフラストラクチャコードは、以下の AWS リソースをデプロイします：

- **ECR リポジトリ**: Docker イメージを保存するためのリポジトリ
- **Secrets Manager**: 環境変数やシークレット情報を安全に管理
- **VPC、サブネット、セキュリティグループ**: ネットワークインフラストラクチャ
- **ECS クラスター、タスク定義、サービス**: コンテナ実行環境
- **Application Load Balancer**: トラフィック分散とルーティング
- **IAM ロール**: 必要な権限（Amazon Bedrock へのフルアクセス権限を含む）

## 🚀 デプロイ手順

### 前提条件

デプロイを開始する前に、以下のツールがインストールされていることを確認してください：

- **AWS CLI**: 最新バージョンがインストールされ、適切な認証情報で設定されていること
- **Node.js**: バージョン 14.x 以上
- **npm**: Node.js パッケージマネージャー
- **Docker**: コンテナイメージのビルドとプッシュに必要

### ステップバイステップガイド

#### 1. 依存関係のインストール

プロジェクトのルートディレクトリで以下のコマンドを実行して、必要な依存関係をインストールします：

```bash
npm install
```

#### 2. CDK のブートストラップ（初回のみ）

AWS アカウントで CDK を初めて使用する場合は、ブートストラップが必要です：

```bash
npx cdk bootstrap
```

このコマンドは、CDK アプリケーションをデプロイするために必要なリソースを AWS アカウントに作成します。

#### 3. インフラストラクチャのデプロイ

まず、ECR リポジトリをデプロイします：

```bash
cdk deploy NextjsEcrStack
```

次に、アプリケーションスタックをデプロイします：

```bash
cdk deploy NextjsAppStack --context imageTag=v1.0.0
```

`imageTag` パラメータは、デプロイする Docker イメージのタグを指定します。

#### 4. Docker イメージのビルドとプッシュ

ECR リポジトリにイメージをプッシュするには：

```bash
# ECR リポジトリへのログイン
aws ecr get-login-password --region <リージョン> | docker login --username AWS --password-stdin <アカウントID>.dkr.ecr.<リージョン>.amazonaws.com

# イメージのビルド
docker build -t <ECRリポジトリURI>:latest ../

# イメージのプッシュ
docker push <ECRリポジトリURI>:latest
```

`<リージョン>`、`<アカウントID>`、`<ECRリポジトリURI>` は、実際の値に置き換えてください。これらの値は `NextjsEcrStack` のデプロイ後に出力されます。

#### 5. ECS サービスの更新

新しいイメージでサービスを更新するには：

```bash
aws ecs update-service --cluster nextjs-app-cluster --service NextjsAppService --force-new-deployment
```

このコマンドにより、ECS サービスが最新のイメージを使用して再デプロイされます。

## 🔐 環境変数の設定

アプリケーションに必要な環境変数は AWS Secrets Manager で管理されます。以下の環境変数を設定してください：

- **REGION**: 使用する AWS リージョン（例: `us-east-1`）
- **PUBLICK_KEY**: Langfuse の公開キー
- **SECRET_KEY**: Langfuse のシークレットキー
- **BASE_URL**: Langfuse のベース URL（例: `https://cloud.langfuse.com`）

Secrets Manager でシークレットを作成または更新する方法：

```bash
aws secretsmanager create-secret --name NextjsAppSecrets --secret-string '{"REGION":"us-east-1","PUBLICK_KEY":"your-key","SECRET_KEY":"your-secret","BASE_URL":"https://cloud.langfuse.com"}'
```

または既存のシークレットを更新：

```bash
aws secretsmanager update-secret --secret-id NextjsAppSecrets --secret-string '{"REGION":"us-east-1","PUBLICK_KEY":"your-key","SECRET_KEY":"your-secret","BASE_URL":"https://cloud.langfuse.com"}'
```

## 🔑 権限

このスタックでは、ECS タスクに以下の権限が付与されています：

- **Amazon Bedrock へのフルアクセス権限**: `AmazonBedrockFullAccess` ポリシー
- **Secrets Manager からのシークレット読み取り権限**: アプリケーションの環境変数取得用
- **ECR からのイメージ取得権限**: コンテナイメージのプル用

## 🧹 クリーンアップ

プロジェクトのリソースをすべて削除するには：

```bash
# アプリケーションスタックを削除
npx cdk destroy NextjsAppStack

# ECR スタックを削除
npx cdk destroy NextjsEcrStack
```

## 🔧 トラブルシューティング

### よくある問題と解決策

1. **デプロイエラー**: `cdk deploy` コマンドがエラーで失敗する場合は、AWS CloudFormation コンソールでスタックのステータスを確認してください。詳細なエラーメッセージが表示されます。

2. **コンテナ起動の問題**: コンテナが起動しない場合は、ECS コンソールでタスク定義とサービスのステータスを確認し、CloudWatch Logs でログを確認してください。

3. **接続の問題**: アプリケーションにアクセスできない場合は、セキュリティグループの設定を確認し、ロードバランサーのヘルスチェックが成功していることを確認してください。

サポートが必要な場合は、プロジェクトの管理者にお問い合わせください。
