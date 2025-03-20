# Nextjs ECS Deployment Infrastructure

このプロジェクトは、Nextjs アプリケーションを AWS ECS にデプロイするための CDK インフラストラクチャコードです。

## デプロイされるリソース

- ECR リポジトリ (Docker イメージ保存用)
- Secrets Manager (環境変数やシークレット管理用)
- VPC、サブネット、セキュリティグループ
- ECS クラスター、タスク定義、サービス
- Application Load Balancer
- IAM ロール (Amazon Bedrock へのフルアクセス権限を含む)

## デプロイ手順

### 前提条件

- AWS CLI がインストールされ、設定済み
- Node.js と npm がインストール済み
- Docker がインストール済み

### デプロイ手順

1. 依存関係をインストール:

```bash
npm install
```

2. CDK をブートストラップ (初回のみ):

```bash
npx cdk bootstrap
```

3. インフラをデプロイ:

```bash
cdk deploy NextjsEcrStack

cdk deploy NextjsAppStack --context imageTag=v1.0.0
```

4. Docker イメージをビルドしてプッシュ:

```
# ECRリポジトリURIを取得 (デプロイ後に表示される)
aws ecr get-login-password --region <リージョン> | docker login --username AWS --password-stdin <アカウントID>.dkr.ecr.<リージョン>.amazonaws.com
docker build -t <ECRリポジトリURI>:latest ../
docker push <ECRリポジトリURI>:latest
```

5. ECS サービスを更新:

```
aws ecs update-service --cluster nextjs-app-cluster --service NextjsAppService --force-new-deployment
```

## 環境変数の設定

Secrets Manager で以下の環境変数を設定:

- REGION: use region
- PUBLICK_KEY: Langfuse public key
- SECRET_KEY: Langfuse secret key
- BASE_URL: Langfuse base url

## 権限

このスタックでは、ECS タスクに以下の権限が付与されています:

- Amazon Bedrock へのフルアクセス権限 (AmazonBedrockFullAccess)
- Secrets Manager からのシークレット読み取り権限
- ECR からのイメージ取得権限

## クリーンアップ

```
npx cdk destroy
```
