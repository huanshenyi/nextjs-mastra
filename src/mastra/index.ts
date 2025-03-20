import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";

import { CookingAgent } from "./agents";

export const mastra = new Mastra({
  agents: { CookingAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    serviceName: "ai",
    enabled: true,
  },
});
