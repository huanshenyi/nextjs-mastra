import { TimestreamQueryClient } from "@aws-sdk/client-timestream-query";

export function initializeTimestreamClient() {
  const region = process.env.REGION || "ap-northeast-1";
  if (process.env.NODE_ENV === "production") {
    return new TimestreamQueryClient({
      region: region,
    });
  }

  return new TimestreamQueryClient({
    region: region, 
  });
}
