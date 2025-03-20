"use client";

import { useState, useEffect, useActionState, startTransition } from "react";
import { getWeatherInfo } from "./actions";

export function WeatherForm() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState("");

  const [state, action, isPending] = useActionState(getWeatherInfo, null);
  useEffect(() => {
    if (state?.text) {
      setResult(state.text);
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    const formData = new FormData();
    formData.set("city", JSON.stringify(city));
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="都市名を入力"
            className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "読み込み中..." : "天気を調べる"}
          </button>
        </div>
      </form>

      <div className="w-full flex flex-col md:flex-row gap-6">

        {result && (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {city || "指定した都市"}の天気情報
            </h2>
            <div className="whitespace-pre-wrap">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
