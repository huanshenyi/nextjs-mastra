// app/components/RecentTimestreamData.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchRecentTimestreamData, getFarmAdvice } from "./actions";

type DataPoint = {
  deviceid: string;
  time: Date;
  measure_name: string;
  "measure_value::double": string | null;
  "measure_value::bigint": string | null;
};

type FarmAdvice = {
  success: boolean;
  advice?: string;
  error?: string;
  timestamp?: string;
};

export default function RecentTimestreamData() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [measureName, setMeasureName] = useState("");
  const [limit, setLimit] = useState(20); // 少し多めに設定
  const [timeRange, setTimeRange] = useState<
    "5m" | "15m" | "1h" | "6h" | "24h"
  >("15m");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);
  const [showAIAdvisor, setShowAIAdvisor] = useState(true);
  const [farmAdvice, setFarmAdvice] = useState<FarmAdvice | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // データ取得関数
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchRecentTimestreamData(limit);

      if (result.success) {
        setData(result.data as DataPoint[]);
        setLastUpdated(result.queryTime);

        // データが取得できたらAIアドバイスも取得
        if (result.data.length > 0 && showAIAdvisor) {
          await loadFarmAdvice(result.data as DataPoint[]);
        }
      } else {
        setError(result.error as string);
      }
    } catch (err) {
      setError("データの取得中にエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // AIアドバイス取得関数
  const loadFarmAdvice = async (dataPoints: DataPoint[]) => {
    setLoadingAdvice(true);

    try {
      // 温度と湿度の最新データを探す
      const temperatureData = dataPoints.find(
        (item) => item.measure_name === "temperature"
      );
      const humidityData = dataPoints.find(
        (item) => item.measure_name === "humidity"
      );

      if (temperatureData && humidityData) {
        const temperature = getValue(temperatureData);
        const humidity = getValue(humidityData);
        const time = new Date(temperatureData.time).toLocaleString();

        const advice = await getFarmAdvice(temperature, humidity, time);
        setFarmAdvice(advice);
      } else {
        setFarmAdvice({
          success: false,
          error: "温度または湿度のデータが取得できませんでした",
        });
      }
    } catch (err) {
      setFarmAdvice({
        success: false,
        error: "AIアドバイスの取得中にエラーが発生しました",
      });
      console.error(err);
    } finally {
      setLoadingAdvice(false);
    }
  };

  // 自動更新
  useEffect(() => {
    loadData();

    // 30秒ごとに自動更新
    const intervalId = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [timeRange, measureName, limit, showAIAdvisor]);

  // データポイントから値を取得するヘルパー関数
  const getValue = (item: DataPoint): string => {
    if (item.measure_name === "temperature" && item["measure_value::double"]) {
      return parseFloat(item["measure_value::double"]).toFixed(1);
    } else if (
      item.measure_name === "humidity" &&
      item["measure_value::bigint"]
    ) {
      return item["measure_value::bigint"];
    } else if (item["measure_value::double"]) {
      return parseFloat(item["measure_value::double"]).toFixed(2);
    } else if (item["measure_value::bigint"]) {
      return item["measure_value::bigint"];
    }
    return "N/A";
  };

  // 最新の温度と湿度を取得
  const getLatestValues = () => {
    const temperature = data.find(
      (item) => item.measure_name === "temperature"
    );
    const humidity = data.find((item) => item.measure_name === "humidity");

    return {
      temperature: temperature ? getValue(temperature) : "N/A",
      humidity: humidity ? getValue(humidity) : "N/A",
      time: temperature ? new Date(temperature.time).toLocaleString() : "N/A",
    };
  };

  const latestValues = getLatestValues();

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-800">
        ESP32 トマト栽培モニタリングシステム
      </h1>

      {/* 現在の環境データサマリー */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-700">現在の温度</h3>
          <p className="text-3xl font-bold text-red-600">
            {latestValues.temperature} °C
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700">現在の湿度</h3>
          <p className="text-3xl font-bold text-blue-600">
            {latestValues.humidity} %
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
          <h3 className="text-lg font-semibold text-gray-700">最終更新</h3>
          <p className="text-lg text-gray-600">{latestValues.time}</p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">期間:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="5m">過去5分</option>
            <option value="15m">過去15分</option>
            <option value="1h">過去1時間</option>
            <option value="6h">過去6時間</option>
            <option value="24h">過去24時間</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            メジャー名 (オプション):
          </label>
          <input
            type="text"
            value={measureName}
            onChange={(e) => setMeasureName(e.target.value)}
            placeholder="例: temperature, humidity"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">表示件数:</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 20)}
            min="1"
            max="100"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "データ取得中..." : "更新"}
        </button>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              setShowAIAdvisor(!showAIAdvisor);
              if (!showAIAdvisor && data.length > 0) {
                loadFarmAdvice(data);
              }
            }}
            className={`px-3 py-1 rounded border transition ${
              showAIAdvisor
                ? "bg-green-100 border-green-500 text-green-700"
                : "bg-gray-100 border-gray-300 text-gray-700"
            }`}
          >
            {showAIAdvisor ? "AIアドバイス表示中" : "AIアドバイス表示"}
          </button>
          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-3 py-1 rounded border transition ${
              showTable
                ? "bg-indigo-100 border-indigo-500 text-indigo-700"
                : "bg-gray-100 border-gray-300 text-gray-700"
            }`}
          >
            {showTable ? "テーブル表示中" : "テーブル表示"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          エラー: {error}
        </div>
      )}

      {/* AIアドバイスセクション */}
      {showAIAdvisor && (
        <div className="mb-6 bg-green-50 p-6 rounded-lg shadow-md border border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-800">
              AIトマト栽培アドバイザー
            </h2>
            {loadingAdvice && (
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-green-500"></div>
            )}
          </div>

          {farmAdvice ? (
            farmAdvice.success ? (
              <div className="prose prose-green max-w-none">
                <p className="whitespace-pre-line text-gray-700">
                  {farmAdvice.advice}
                </p>
              </div>
            ) : (
              <div className="text-red-600">
                <p>{farmAdvice.error || "アドバイスを取得できませんでした"}</p>
              </div>
            )
          ) : loadingAdvice ? (
            <div className="text-center p-4">
              <p className="text-gray-600">AIアドバイスを分析中...</p>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-600">
                データを更新するとAIアドバイスが表示されます
              </p>
            </div>
          )}
        </div>
      )}

      {loading && data.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      ) : (
        <>
          {showTable && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">データテーブル</h2>
              {data.length === 0 ? (
                <div className="text-center p-4">
                  該当するデータがありません
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border">デバイスID</th>
                        <th className="py-2 px-4 border">時間</th>
                        <th className="py-2 px-4 border">メジャー名</th>
                        <th className="py-2 px-4 border">値</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, index) => (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? "bg-gray-50" : ""}
                        >
                          <td className="py-2 px-4 border">ベランダ</td>
                          <td className="py-2 px-4 border">
                            {new Date(item.time).toLocaleString()}
                          </td>
                          <td className="py-2 px-4 border">
                            {item.measure_name}
                          </td>
                          <td className="py-2 px-4 border text-right">
                            {getValue(item)}{" "}
                            {item.measure_name === "temperature"
                              ? "°C"
                              : item.measure_name === "humidity"
                              ? "%"
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-4 text-sm text-gray-500 flex justify-between">
        <span>取得データ数: {data.length}</span>
        {lastUpdated && (
          <span>最終更新: {new Date(lastUpdated).toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
