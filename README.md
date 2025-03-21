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