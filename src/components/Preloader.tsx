"use client";

import { useEffect, useState } from "react";

type PreloaderProps = {
  onComplete: () => void;
};

export default function Preloader({
  onComplete,
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500;
    const intervalTime = 25;
    const increment = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;

        if (next >= 100) {
          clearInterval(interval);

          setTimeout(() => {
            onComplete();
          }, 500);

          return 100;
        }

        return next;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

  const getText = () => {
    if (progress < 20) return "Menyiapkan panggung...";
    if (progress < 40) return "Menyusun nada...";
    if (progress < 60) return "Menyiapkan melodi...";
    if (progress < 80) return "Menyetel suara...";
    if (progress < 100) return "Hampir siap...";

    return "Game siap dimainkan!";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center overflow-hidden bg-[#F2F2F2]">
      
      {/* Decorative notes */}
      <span className="absolute left-[12%] top-[18%] text-4xl text-[#76C457]/30">
        ♪
      </span>

      <span className="absolute right-[14%] top-[25%] text-3xl text-[#2A7C13]/20">
        ♫
      </span>

      <span className="absolute bottom-[20%] left-[16%] text-3xl text-[#2A7C13]/20">
        ♬
      </span>

      <span className="absolute bottom-[16%] right-[18%] text-4xl text-[#76C457]/30">
        ♪
      </span>

      <div className="w-full max-w-md px-6 text-center">

        {/* Mascot */}
        <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          
          <div className="absolute inset-3 animate-pulse rounded-full bg-[#76C457]/10" />

          {/* <img
            src="/images/tes.png"
            alt="Maskot"
            className="relative h-38 w-38 object-contain"
          /> */}
        </div>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-black tracking-tight text-[#2A7C13]">
          SUSUN MELODI
        </h1>

        <p className="mt-2 text-sm font-medium text-gray-400">
          {getText()}
        </p>

        {/* Progress */}
        <div className="mt-7">
          <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-[#76C457] transition-all duration-75"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Memuat permainan
            </span>

            <span className="text-sm font-extrabold text-[#2A7C13]">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>

        {/* Equalizer */}
        <div className="mt-7 flex h-8 items-end justify-center gap-1.5">
          {[3, 6, 4, 7, 4, 6, 3].map(
            (height, index) => (
              <div
                key={index}
                className="w-1.5 animate-pulse rounded-full bg-[#76C457]"
                style={{
                  height: `${height * 4}px`,
                  animationDelay: `${index * 100}ms`,
                }}
              />
            )
          )}
        </div>

      </div>
    </div>
  );
}