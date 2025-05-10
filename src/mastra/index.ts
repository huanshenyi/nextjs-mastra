import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";

import { CookingAgent } from "./agents";
import {FarmAgent} from "./agents/farm"

export const mastra = new Mastra({
  agents: { CookingAgent, FarmAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
  telemetry: {
    serviceName: "ai",
    enabled: true,
  },
});
