"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(prevState: unknown, formData: FormData) {
  const recipe = JSON.parse(formData.get("recipe") as string);
  const agent = mastra.getAgent("CookingAgent");

  const result = await agent.generate(`Please come up with a ${recipe} using this ingredient`);

  return {
    text: result.text,
    finishReason: result.finishReason,
    timestamp: new Date().toISOString(),
    totalTokens: result.usage?.totalTokens
  };
}
