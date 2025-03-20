import {
  NodeSDK,
  ATTR_SERVICE_NAME,
  Resource,
} from "@mastra/core/telemetry/otel-vendor";
import { LangfuseExporter } from "langfuse-vercel";

export function register() {
  const exporter = new LangfuseExporter({
    enabled: true,
    publicKey: process.env.PUBLICK_KEY,
    secretKey: process.env.SECRET_KEY,
    baseUrl: process.env.BASE_URL,
  });

  const sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: "ai",
    }),
    traceExporter: exporter,
  });

  sdk.start();
}
