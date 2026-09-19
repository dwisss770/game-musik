"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const playerName = localStorage.getItem("playerName");
    const finalScore = localStorage.getItem("finalScore");

    if (!playerName) {
      router.push("/");
      return;
    }

    setName(playerName);
    setScore(Number(finalScore) || 0);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F2F2F2] px-6">

      <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#76C457]/20 text-4xl">
          🎵
        </div>

        <p className="mt-6 text-sm font-semibold text-gray-400">
          PERMAINAN SELESAI
        </p>

        <h1 className="mt-2 text-3xl font-extrabold text-[#2A7C13]">
          {name}
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Ini hasil permainanmu
        </p>

        <div className="mt-8 rounded-3xl bg-[#F2F2F2] p-6">

          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Total Skor
          </p>

          <p className="mt-2 text-5xl font-extrabold text-[#2A7C13]">
            {score}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            / 300 poin
          </p>

        </div>

        <button
          onClick={() => {
            localStorage.removeItem("finalScore");
            router.push("/");
          }}
          className="mt-6 w-full rounded-2xl bg-[#2A7C13] py-4 text-sm font-bold text-white transition hover:bg-[#236910]"
        >
          Main Lagi
        </button>

      </div>

    </main>
  );
}