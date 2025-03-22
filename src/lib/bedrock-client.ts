import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

export function initializeBedrockClient() {
  const region = process.env.REGION || "ap-northeast-1";
  if (process.env.NODE_ENV === "production") {
    return createAmazonBedrock({
      region: region,
      credentialProvider: fromNodeProviderChain(),
    });
  }

  return createAmazonBedrock({
    region: region,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    sessionToken: process.env.SESSION_TOKEN,
  });
}
