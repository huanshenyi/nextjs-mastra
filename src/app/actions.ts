"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(prevState: unknown, formData: FormData) {
  const city = JSON.parse(formData.get("city") as string);
  const agent = mastra.getAgent("weatherAgent");

  const result = await agent.generate(`What's the weather like in ${city}?`);

  return {
    text: result.text,
    finishReason: result.finishReason,
    timestamp: new Date().toISOString(),
    totalTokens: result.usage?.totalTokens
  };
}
