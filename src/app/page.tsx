import { WeatherForm } from "./page.client";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">天気情報アプリ</h1>
      <WeatherForm />
    </div>
  );
}
