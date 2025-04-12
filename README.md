## explanation

Nextjs & Mastra deploy to ECS

First Set you Env

```bash
cp .env.example .env.development
```

And, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## build image

```bash
docker buildx build --no-cache --platform=linux/x86_64 -t nextjs-mastra .

docker run -p 3000:3000 nextjs-mastra
```

## deploy infra

[ドキュメント](./iac/README.md)

## use case

### メインブランチ: 料理エージェント

メインブランチでは、「シェフAI」という料理レシピアシスタントを実装しています。このエージェントは以下の機能を提供します：

- ユーザーの好み、制約（アレルギー、食事制限など）に合わせたレシピ提案
- 季節の食材や旬の素材を活かしたレシピ提案
- 料理の基本テクニックの説明
- 食材の保存方法や活用法についてのアドバイス

使用例：
```
Q: 夏野菜を使った簡単な料理を教えてください
A: [シェフAIがレシピを提案]
```

### topic/iot-agentブランチ: トマト観察エージェント

topic/iot-agentブランチでは、IoTセンサーを活用したトマト栽培観察用のエージェントを実装しています。このエージェントは以下の機能を提供します：

- トマト栽培環境（温度、湿度など）のモニタリング
- 栽培状況に基づいた最適なケア方法の提案
- 異常値検出と対応策のアドバイス
- 成長記録の管理と分析

使用例：
```
Q: トマトの葉が黄色くなってきました。何が問題ですか？
A: [トマト観察エージェントが診断と対策を提案]
```

### use Langfuse

[Langfuse](https://langfuse.com/ )のアカウントを作って、キーを.envにセットしてください。

```bash
PUBLICK_KEY=your-value-here
SECRET_KEY=your-value-here
BASE_URL=https://cloud.langfuse.com
```