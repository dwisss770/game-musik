"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MelodyStaff from "@/components/MelodyStaff";


const NOTES = [
  { name: "Do" },
  { name: "Re" },
  { name: "Mi" },
  { name: "Fa" },
  { name: "Sol" },
  { name: "La" },
  { name: "Si" },
];

const STAGE_CONFIG = [
  {
    totalNotes: 2,
    notes: ["Do", "Re"],
  },
  {
    totalNotes: 3,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
  },
  {
    totalNotes: 4,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
  },
  {
    totalNotes: 5,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
  },
  {
    totalNotes: 6,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
  },
];

// =========================
// GENERATE MELODI ACAK
// =========================

const generateMelody = (
  notes: string[],
  totalNotes: number
) => {
  return Array.from({ length: totalNotes }, () => {
    const randomIndex = Math.floor(
      Math.random() * notes.length
    );

    return notes[randomIndex];
  });
};

const frequencies: Record<string, number> = {
  Do: 261.63,
  Re: 293.66,
  Mi: 329.63,
  Fa: 349.23,
  Sol: 392.0,
  La: 440.0,
  Si: 493.88,
};

export default function GamePage() {
  const router = useRouter();

  const [playerName, setPlayerName] = useState("");
  const [stage, setStage] = useState(0);
//   const [question, setQuestion] = useState(0);
  const [lives, setLives] = useState(4);
  const [score, setScore] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  
  const [currentMelody, setCurrentMelody] = useState<string[]>([]);

  const [answer, setAnswer] = useState<string[]>([]);

  const [message, setMessage] = useState("");

    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorsRef = useRef<OscillatorNode[]>([]);

    // const currentMelody = STAGES[stage].melody;

  useEffect(() => {
    const name = localStorage.getItem("playerName");

    if (!name) {
      router.push("/");
      return;
    }

    setPlayerName(name);
  }, [router]);
  
    useEffect(() => {
        const config = STAGE_CONFIG[stage];

        const newMelody = generateMelody(
        config.notes,
        config.totalNotes
        );

        setCurrentMelody(newMelody);
        setAnswer(
        Array(config.totalNotes).fill("")
        );
        setMessage("");
    }, [stage]);


  // =========================
  // AUDIO
  // =========================

  const playNote = (
  audioContext: AudioContext,
  note: string,
  startTime: number
) => {
  const frequency = frequencies[note];

  if (!frequency) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "triangle";

  oscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );

  gain.gain.setValueAtTime(0, startTime);

  gain.gain.linearRampToValueAtTime(
    0.3,
    startTime + 0.03
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    startTime + 0.6
  );

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + 0.6);

  oscillatorsRef.current.push(oscillator);

  oscillator.onended = () => {
    oscillatorsRef.current =
      oscillatorsRef.current.filter(
        (item) => item !== oscillator
      );
  };
};

const playMelody = async () => {
  // Hentikan melodi yang sedang berjalan
  oscillatorsRef.current.forEach((oscillator) => {
    try {
      oscillator.stop();
    } catch {}
  });

  oscillatorsRef.current = [];

  // Tutup AudioContext sebelumnya
  if (audioContextRef.current) {
    try {
      await audioContextRef.current.close();
    } catch {}
  }

  const audioContext = new AudioContext();

  audioContextRef.current = audioContext;

  await audioContext.resume();

  const startTime =
    audioContext.currentTime + 0.1;

  currentMelody.forEach((note, index) => {
    playNote(
      audioContext,
      note,
      startTime + index * 0.65
    );
  });
};

  const playSingleNote = async (note: string) => {
    const audioContext = new AudioContext();

    await audioContext.resume();

    playNote(
      audioContext,
      note,
      audioContext.currentTime + 0.05
    );

    setTimeout(() => {
      audioContext.close();
    }, 1000);
  };

  // =========================
  // PILIH NADA
  // =========================

  const selectNote = (note: string) => {
    const emptyIndex = answer.findIndex(
      (item) => item === ""
    );

    if (emptyIndex === -1) return;

    const newAnswer = [...answer];

    newAnswer[emptyIndex] = note;

    setAnswer(newAnswer);
    setMessage("");
  };

  // =========================
  // HAPUS NADA
  // =========================

  const removeNote = (index: number) => {
    const newAnswer = [...answer];

    newAnswer[index] = "";

    setAnswer(newAnswer);
    setMessage("");
  };

  // =========================
  // SUBMIT
  // =========================
    const [modal, setModal] = useState<{
    type: "success" | "error" | "gameover" | null;
    title: string;
    description: string;
    }>({
    type: null,
    title: "",
    description: "",
    });

  const submitAnswer = () => {
  if (answer.includes("")) {
    setModal({
      type: "error",
      title: "Jawaban Belum Lengkap",
      description: `Isi semua ${currentMelody.length} posisi nada terlebih dahulu.`,
    });

    return;
  }

  const isCorrect = answer.every(
    (note, index) =>
      note === currentMelody[index]
  );

  if (isCorrect) {
    const newScore = score + 100;

    setScore(newScore);

    setModal({
      type: "success",
      title: "Kamu Berhasil! 🎉",
      description: "Susunan nada kamu benar.",
    });

    return;
  }

  const newLives = lives - 1;

  setLives(newLives);

  setAnswer(
    Array(
      STAGE_CONFIG[stage].totalNotes
    ).fill("")
  );

  if (newLives <= 0) {
    localStorage.setItem(
      "finalScore",
      score.toString()
    );

    setModal({
      type: "gameover",
      title: "Game Over",
      description: "Nyawa kamu sudah habis.",
    });

    return;
  }

  setModal({
    type: "error",
    title: "Busett, Salah woyy",
    description: "Coba dengarkan melodi sekali lagi.",
  });
};

const endGame = () => {
  localStorage.setItem(
    "finalScore",
    score.toString()
  );

  router.push("/result");
};

const nextStage = () => {
  setModal({
    type: null,
    title: "",
    description: "",
  });

  if (stage < STAGE_CONFIG.length - 1) {
    setStage(stage + 1);
    // setLives(4);

    setAnswer(
      Array(
        STAGE_CONFIG[stage + 1].totalNotes
      ).fill("")
    );

    return;
  }

  localStorage.setItem(
    "finalScore",
    score.toString()
  );

  router.push("/result");
};

  return (
    <main className="min-h-screen bg-[#F2F2F2] px-4 py-6 md:px-8 md:py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400">
              Pemain
            </p>

            <h1 className="text-2xl font-bold text-[#2A7C13] border px-3 rounded-xl">
              {playerName}
            </h1>
          </div>

          <div className="flex items-center gap-3">

            {/* SCORE */}
            <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400">
                SKOR
              </p>

              <p className="text-lg font-extrabold text-[#2A7C13]">
                {score}
              </p>
            </div>

            {/* LIVES */}
            <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400">
                NYAWA
              </p>

              <p className="text-lg tracking-wide">
                {"❤️".repeat(lives)}
              </p>
            </div>

          </div>

        </header>

        {/* STAGE */}
        <div className="mb-5 flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold text-gray-400">
              LEVEL
            </p>

            <h2 className="text-2xl font-extrabold text-gray-800">
              Tahap {stage + 1}

              <span className="ml-2 text-sm font-medium text-gray-400">
                / 5
              </span>
            </h2>

          </div>

          <div className="h-2 w-32 overflow-hidden rounded-full bg-white">

            <div
              className="h-full rounded-full bg-[#76C457] transition-all"
              style={{
                width: `${((stage + 1) / STAGE_CONFIG.length) * 100}%`,
              }}
            />

          </div>

        </div>

        {/* GAME CARD */}
        <div className="rounded-[28px] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.07)] md:py-8">

          {/* TITLE */}
          <div className="text-center">

            <span className="inline-flex rounded-full bg-[#76C457]/15 px-4 py-2 text-xs font-bold text-[#2A7C13]">
              SUSUN MELODI
            </span>

            <h3 className="mt-4 text-xl font-extrabold text-gray-800 md:text-2xl">
              Dengarkan lalu susun nada
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
              Dengarkan melodi terlebih dahulu.
              Kemudian susun nada sesuai
                melodi yang kamu dengar.
            </p>

          </div>

          {/* LISTEN */}
          <div className="mt-7 flex justify-center">

            <button
              onClick={playMelody}
              className="flex items-center gap-3 rounded-2xl bg-[#2A7C13] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-95"
            >

              <span className="text-lg">
                ▶
              </span>

              Dengarkan Melodi

            </button>

          </div>

          {/* ANSWER AREA */}
        <div className="mx-auto mt-8 max-w-3xl">

        <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-gray-400">
            Susunan Nada
        </p>

        {/* MELODY BOARD */}
        <div className="relative overflow-hidden rounded-3xl bg-[#F7FAF6] px-4 py-6 sm:px-6">

        <MelodyStaff
        notes={answer}
        onRemove={removeNote}
        />

        </div>

        <p className="mt-3 text-center text-[15px] text-gray-600 underline">
            Klik nada untuk menghapusnya
        </p>

        </div>

          {/* NOTE CARDS */}
          <div className="mx-auto mt-8 max-w-3xl">

            <div className="mb-4 flex items-center justify-between">

              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Pilih Nada
              </p>

              <p className="text-[13px] text-gray-400">
                Klik 🎵 untuk mendengar
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">

              {NOTES.map((note) => (

                <div
                  key={note.name}
                  className="group relative"
                >

                  <button
                    onClick={() =>
                      selectNote(note.name)
                    }
                    className="w-full rounded-2xl border-2 border-gray-100 bg-white p-4 transition hover:-translate-y-1 hover:border-[#76C457] hover:bg-[#76C457]/10 active:scale-95"
                  >

                    <div className="flex h-16 items-center justify-center">
                    <span className="text-4xl font-black text-[#2A7C13]">
                        ♪
                    </span>
                    </div>

                    <p className="mt-2 text-sm font-extrabold text-gray-700">
                      {note.name}
                    </p>

                  </button>

                  {/* AUDIO */}
                  {/* AUDIO */}
                    <button
                    onClick={() => playSingleNote(note.name)}
                    className="absolute right-2 top-2 flex h-10 w-10 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-[#2A7C13] text-lg text-white shadow-sm transition hover:bg-[#236910] active:scale-95"
                    title={`Dengar nada ${note.name}`}
                    >
                    🔊
                    </button>

                </div>

              ))}

            </div>

          </div>

          {/* MESSAGE */}
          {message && (

            <div className="mt-6 rounded-2xl bg-[#F2F2F2] px-4 py-4 text-center text-sm font-semibold text-gray-700">
              {message}
            </div>

          )}

          {/* SUBMIT */}
          <button
            onClick={submitAnswer}
            className="mx-auto mt-6 block w-full max-w-3xl rounded-2xl bg-[#2A7C13] py-4 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-[0.99]"
          >
            Submit Jawaban
          </button>

        </div>

      </div>

      {/* PETUNJUK GAME */}
      {showGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#10220d]/45 px-4 py-8 backdrop-blur-md">

          <div className="relative my-auto w-full max-w-xl overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.2)]">

            {/* Decorative background */}
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#76C457]/15" />
            <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#76C457]/10" />

            <div className="relative p-6 sm:p-7">

              {/* Header */}
              <div className="flex items-start justify-between">

                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#76C457]/10 px-3 py-1.5 text-xs font-bold text-[#2A7C13]">
                    <span>🎵</span>
                    PETUNJUK PERMAINAN
                  </div>

                  <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-[#17330f] sm:text-3xl">
                    Siap Menyusun Melodi?
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                    Dengarkan melodi dengan baik, lalu susun nada sesuai
                    urutan yang kamu dengar.
                  </p>
                </div>

                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#76C457]/10 text-3xl sm:flex">
                  🎼
                </div>

              </div>

              {/* How to play */}
              <div className="mt-7">

                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Cara bermain
                </p>

                <div className="space-y-2.5">

                  {/* Step 1 */}
                  <div className="group flex gap-4 rounded-2xl border border-gray-100 bg-[#FAFCF9] p-3.5 transition hover:border-[#76C457]/30 hover:bg-[#F7FBF5]">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2A7C13] text-sm font-extrabold text-white shadow-sm">
                      1
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-800">
                        Dengarkan Melodi
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Tekan tombol <b className="text-gray-700">
                          “Dengarkan Melodi”
                        </b> untuk mendengar urutan nada.
                      </p>
                    </div>

                  </div>

                  {/* Step 2 */}
                  <div className="group flex gap-4 rounded-2xl border border-gray-100 bg-[#FAFCF9] p-3.5 transition hover:border-[#76C457]/30 hover:bg-[#F7FBF5]">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2A7C13] text-sm font-extrabold text-white shadow-sm">
                      2
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-800">
                        Susun Nada
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Pilih <b className="text-gray-700">
                          Do, Re, Mi, Fa, Sol, La, Si
                        </b> sesuai melodi yang kamu dengar.
                      </p>
                    </div>

                  </div>

                  {/* Step 3 */}
                  <div className="group flex gap-4 rounded-2xl border border-gray-100 bg-[#FAFCF9] p-3.5 transition hover:border-[#76C457]/30 hover:bg-[#F7FBF5]">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2A7C13] text-sm font-extrabold text-white shadow-sm">
                      3
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-gray-800">
                        Perhatikan Nyawa
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Kamu memiliki <b className="text-gray-700">4 nyawa</b>
                        {" "}untuk menyelesaikan seluruh permainan.
                      </p>
                    </div>

                  </div>

                </div>
              </div>

              {/* Info */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#F3F8F0] px-4 py-3.5">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  🏆
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold text-[#2A7C13]">
                    Sistem Skor
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Jawaban benar mendapatkan <b>+100 poin</b>.
                  </p>
                </div>

              </div>

              {/* Button */}
              <button
                onClick={() => setShowGuide(false)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2A7C13] py-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(42,124,19,0.2)] transition duration-200 hover:bg-[#236910] hover:shadow-[0_10px_25px_rgba(42,124,19,0.28)] active:scale-[0.98]"
              >
                Mulai Bermain
                <span className="text-lg">→</span>
              </button>

              <p className="mt-3 text-center text-[11px] text-gray-400">
                Dengarkan dengan teliti dan susun nada dengan tepat 🎶
              </p>

            </div>
          </div>
        </div>
      )}


      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[30px] bg-white p-7 shadow-2xl md:p-8">

            {/* Icon */}
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
                modal.type === "success"
                  ? "bg-[#76C457]/15"
                  : modal.type === "error"
                  ? "bg-red-50"
                  : "bg-gray-100"
              }`}
            >
              {modal.type === "success"
                ? "✓"
                : modal.type === "error"
                ? "✕"
                : "🎵"}
            </div>

            {/* Title */}
            <h3
              className={`mt-5 text-center text-2xl font-extrabold ${
                modal.type === "success"
                  ? "text-[#2A7C13]"
                  : modal.type === "error"
                  ? "text-red-500"
                  : "text-gray-700"
              }`}
            >
              {modal.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-center text-sm leading-6 text-gray-500">
              {modal.description}
            </p>

            {/* Sisa Nyawa */}
            <div className="mt-6 rounded-2xl bg-[#F7FAF6] px-5 py-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Sisa Nyawa
              </p>

              <p className="mt-1 text-2xl tracking-wide">
                {"❤️".repeat(lives)}
                {lives === 0 && "💔"}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3">

              {/* Akhiri Game */}
              <button
                onClick={endGame}
                className="w-full rounded-2xl border-2 border-gray-200 bg-white py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50 active:scale-[0.98]"
              >
                Akhiri Game
              </button>

              {/* Lanjut Tahap */}
              {modal.type === "success" && (
                <button
                  onClick={nextStage}
                  className="w-full rounded-2xl bg-[#2A7C13] py-3.5 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-[0.98]"
                >
                  {stage < STAGE_CONFIG.length - 1
                    ? "Lanjutkan ke Tahap Berikutnya"
                    : "Lihat Hasil"}
                </button>
              )}

              {/* Coba Lagi */}
              {modal.type === "error" && (
                <button
                  onClick={() =>
                    setModal({
                      type: null,
                      title: "",
                      description: "",
                    })
                  }
                  className="w-full rounded-2xl bg-[#2A7C13] py-3.5 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-[0.98]"
                >
                  Coba Lagi
                </button>
              )}

              {/* Game Over */}
              {modal.type === "gameover" && (
                <button
                  onClick={endGame}
                  className="w-full rounded-2xl bg-[#2A7C13] py-3.5 text-sm font-bold text-white transition hover:bg-[#236910] active:scale-[0.98]"
                >
                  Lihat Hasil
                </button>
              )}

            </div>
          </div>
        </div>
      )}

    </main>
  );
}