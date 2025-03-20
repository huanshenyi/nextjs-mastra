import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { LangfuseExporter } from "langfuse-vercel";

import { weatherAgent } from "./agents";

export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    serviceName: "ai",
    enabled: true,
    export: {
      type: "custom",
      exporter: new LangfuseExporter({
        publicKey: process.env.PUBLICK_KEY,
        secretKey: process.env.SECRET_KEY,
        baseUrl: process.env.BASE_URL,
      }),
    },
  },
});
