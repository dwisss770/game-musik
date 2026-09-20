"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleStart = () => {
    if (!name.trim()) {
      return;
    }

    localStorage.setItem("playerName", name.trim());

    router.push("/game");
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl text-4xl shadow-lg">
            🎵
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-[#2A7C13]">
            Hallo, ini Game Rhythm Maker
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Buat, ikuti, dan uji kemampuanmu
            <br />
            dalam pola ritme musik.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white p-7 shadow-[0_20px_50px_rgba(0,0,0,0.08)]">

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Siap bermain?
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Masukkan namamu sebelum memulai.
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Buat Nama
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleStart();
              }
            }}
            placeholder="Masukkan nama kamu"
            className="w-full rounded-2xl border border-gray-200 bg-[#F2F2F2] px-4 py-3.5 text-sm outline-none transition focus:border-[#76C457] focus:ring-4 focus:ring-[#76C457]/20"
          />

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className="mt-4 w-full rounded-2xl bg-[#2A7C13] py-3.5 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mulai Bermain →
          </button>

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Seni Musik • Rhythm & Creativity
        </p>

      </div>
    </main>
  );
}