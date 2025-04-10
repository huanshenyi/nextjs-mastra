"use server";

import {
  TimestreamQueryClient,
  QueryCommand,
} from "@aws-sdk/client-timestream-query";
import { mastra } from "@/mastra";

// 環境変数から認証情報と設定を取得
const REGION = process.env.AWS_REGION || "ap-northeast-1";
const DATABASE_NAME = process.env.DATABASE_NAME;
const TABLE_NAME = process.env.TABLE_NAME;

// Timestreamクライアントの初期化
const getTimestreamClient = () => {
  return new TimestreamQueryClient({
    region: REGION,
    // AWS SDKは自動的に環境変数から認証情報を取得します
  });
};

// 過去15分のデータを取得するサーバーアクション
export async function fetchRecentTimestreamData(limit: number = 10) {
  const client = getTimestreamClient();

  // measureName が指定されている場合はフィルタを追加

  // 過去15分から現在までのデータを取得するクエリ
  const query = `
    SELECT 
      deviceid,
      time,
      measure_name,
      measure_value::double,
      measure_value::bigint
    FROM "${DATABASE_NAME}"."${TABLE_NAME}"
    WHERE time BETWEEN ago(15m) AND now()
    ORDER BY time DESC
    LIMIT ${limit}
  `;

  try {
    const command = new QueryCommand({ QueryString: query });
    const response = await client.send(command);

    // 結果をより扱いやすい形式に変換
    const formattedData =
      response.Rows?.map((row) => {
        const data: Record<string, unknown> = {};

        if (row.Data && response.ColumnInfo) {
          row.Data.forEach((datum, index) => {
            const columnName = response.ColumnInfo?.[index].Name;
            if (columnName) {
              if (columnName === "time") {
                data[columnName] = new Date(datum.ScalarValue || "");
              } else {
                data[columnName] = datum.ScalarValue;
              }
            }
          });
        }

        return data;
      }) || [];

    return {
      success: true,
      data: formattedData,
      queryTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error querying recent Timestream data:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      queryTime: new Date().toISOString(),
    };
  }
}

// 異なる時間範囲で最新データを取得
export async function fetchDataWithTimeRange(
  timeRange: "5m" | "15m" | "1h" | "6h" | "24h" = "15m",
  measureName?: string,
  limit: number = 10
) {
  const client = getTimestreamClient();

  const measureFilter = measureName
    ? `AND measure_name = '${measureName}'`
    : "";

  const query = `
    SELECT 
      time, 
      measure_name, 
      CAST(measure_value AS double) AS value
    FROM "${DATABASE_NAME}"."${TABLE_NAME}"
    WHERE time BETWEEN ago(${timeRange}) AND now()
    ${measureFilter}
    ORDER BY time DESC
    LIMIT ${limit}
  `;

  try {
    const command = new QueryCommand({ QueryString: query });
    const response = await client.send(command);

    const formattedData =
      response.Rows?.map((row) => {
        const data: Record<string, unknown> = {};

        if (row.Data && response.ColumnInfo) {
          row.Data.forEach((datum, index) => {
            const columnName = response.ColumnInfo?.[index].Name;
            if (columnName) {
              if (columnName === "time") {
                data[columnName] = new Date(datum.ScalarValue || "");
              } else {
                data[columnName] = datum.ScalarValue;
              }
            }
          });
        }

        return data;
      }) || [];

    return {
      success: true,
      data: formattedData,
      timeRange,
      queryTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Error querying Timestream data for last ${timeRange}:`,
      error
    );
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "不明なエラーが発生しました",
      timeRange,
      queryTime: new Date().toISOString(),
    };
  }
}

export async function getFarmAdvice(
  temperature: string | number,
  humidity: string | number,
  time: string
) {
  try {
    // FarmAgentを取得
    const agent = mastra.getAgent("FarmAgent");

    // 環境データを準備
    const prompt = `トマト栽培の環境データを分析してください:
      温度: ${temperature}°C
      湿度: ${humidity}%
      計測時間: ${time}
      
      トマトの最適な生育条件と現在の環境を比較し、改善点や注意点を教えてください。`;

    // エージェントに環境データを送信して分析結果を取得
    const result = await agent.generate(prompt);

    return {
      success: true,
      advice: result.text,
      timestamp: new Date().toISOString(),
      totalTokens: result.usage?.totalTokens,
      finishReason: result.finishReason,
    };
  } catch (error) {
    console.error("FarmAgent APIエラー:", error);
    return {
      success: false,
      error: "分析中にエラーが発生しました",
    };
  }
}
