"use client";

import { useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
} from "vexflow";

type MelodyStaffProps = {
  notes: string[];
  onRemove: (index: number) => void;
};

const noteMap: Record<string, string> = {
  Do: "c/4",
  Re: "d/4",
  Mi: "e/4",
  Fa: "f/4",
  Sol: "g/4",
  La: "a/4",
  Si: "b/4",
};

export default function MelodyStaff({
  notes,
  onRemove,
}: MelodyStaffProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    // =========================
    // CANVAS
    // =========================

    const renderer = new Renderer(
      containerRef.current,
      Renderer.Backends.SVG
    );

    const isMobile = window.innerWidth < 640;

    const canvasWidth = isMobile ? 340 : 760;
    const staveWidth = isMobile ? 280 : 680;
    const staveX = isMobile ? 30 : 40;

    renderer.resize(
    canvasWidth,
    240
    );

    const context = renderer.getContext();

    // =========================
    // STAFF / TANGGA NADA
    // =========================

    const stave = new Stave(
    staveX,
    50,
    staveWidth
    );

    stave.addClef("treble");

    stave.setContext(context);
    stave.draw();

    // =========================
    // NOTES
    // =========================

    const staveNotes = notes
      .map((note, index) => {
        if (!note) return null;

        const staveNote = new StaveNote({
          keys: [noteMap[note] || "c/4"],
          duration: "q",
        });

        (
          staveNote as StaveNote & {
            noteIndex?: number;
          }
        ).noteIndex = index;

        return staveNote;
      })
      .filter(
        (note): note is StaveNote =>
          note !== null
      );

    if (staveNotes.length === 0) {
      return;
    }

    // =========================
    // VOICE
    // =========================

    const voice = new Voice({
      numBeats: staveNotes.length,
      beatValue: 4,
    });

    voice.addTickables(staveNotes);

    // =========================
    // FORMAT
    // =========================

    new Formatter()
    .joinVoices([voice])
    .format(
        [voice],
        isMobile ? 220 : 620
    );

    // =========================
    // DRAW
    // =========================

    voice.draw(context, stave);

    // =========================
    // CLICK NOT
    // =========================

    staveNotes.forEach((note) => {
  const svgElement = note.getSVGElement();

  if (!svgElement) return;

  const index = (
    note as StaveNote & {
      noteIndex?: number;
    }
  ).noteIndex;

  if (index === undefined) return;

  // Cursor desktop
  svgElement.style.cursor = "pointer";

  // Area visual note
  const bbox = svgElement.getBBox();

  // Buat lingkaran indikator
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );

  circle.setAttribute(
    "cx",
    String(bbox.x + bbox.width / 2)
  );

  circle.setAttribute(
    "cy",
    String(bbox.y + bbox.height / 2)
  );

  circle.setAttribute(
    "r",
    "20"
  );

  circle.setAttribute(
    "fill",
    "none"
  );

  circle.setAttribute(
    "stroke",
    "#76C457"
  );

  circle.setAttribute(
    "stroke-width",
    "2"
  );

  circle.setAttribute(
    "pointer-events",
    "none"
  );

  // Awalnya disembunyikan
  circle.style.display = "none";

  // Masukkan circle setelah note
  svgElement.parentNode?.appendChild(circle);

  // =========================
  // DESKTOP HOVER
  // =========================

  svgElement.addEventListener(
    "mouseenter",
    () => {
      circle.style.display = "block";
    }
  );

  svgElement.addEventListener(
    "mouseleave",
    () => {
      circle.style.display = "none";
    }
  );

  // =========================
  // CLICK / TAP
  // =========================

  svgElement.addEventListener(
    "click",
    () => {
      onRemove(index);
    }
  );
});

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [notes, onRemove]);

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={containerRef}
        className="flex w-full justify-center overflow-hidden"
      />
    </div>
  );
}