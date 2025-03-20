import { CookingForm } from "./page.client";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-6">レシピ作るアプリ</h1>
      <CookingForm />
    </div>
  );
}
