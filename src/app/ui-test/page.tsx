"use client";

import { useState } from "react";

// ─── Slide demos ──────────────────────────────────────────────────────────────

const CARDS = ["Дислексия", "Фонология", "Работна памет", "Визуален стрес", "Флуентност"];

function SlideA() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");

  function go(d: "fwd" | "bwd") {
    setDir(d);
    setIdx((i) => (d === "fwd" ? Math.min(i + 1, CARDS.length - 1) : Math.max(i - 1, 0)));
  }

  return (
    <Demo label="А) Само вход — fade + slide up (CSS key)">
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .slide-up { animation: slideUp 0.22s ease-out; }
      `}</style>
      <Card title={CARDS[idx]} animClass="slide-up" idx={idx} />
      <Buttons onFwd={() => go("fwd")} onBwd={() => go("bwd")} idx={idx} max={CARDS.length - 1} />
    </Demo>
  );
}

function SlideB() {
  const [idx, setIdx] = useState(0);
  const [key, setKey] = useState(0);
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");

  function go(d: "fwd" | "bwd") {
    setDir(d);
    setIdx((i) => (d === "fwd" ? Math.min(i + 1, CARDS.length - 1) : Math.max(i - 1, 0)));
    setKey((k) => k + 1);
  }

  const enterClass = dir === "fwd" ? "slide-in-right" : "slide-in-left";

  return (
    <Demo label="Б) Вход отдясно / отляво (CSS key, без exit)">
      <style>{`
        @keyframes inRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes inLeft  { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        .slide-in-right { animation: inRight 0.22s ease-out; }
        .slide-in-left  { animation: inLeft  0.22s ease-out; }
      `}</style>
      <Card title={CARDS[idx]} animClass={enterClass} idx={idx} key={key} />
      <Buttons onFwd={() => go("fwd")} onBwd={() => go("bwd")} idx={idx} max={CARDS.length - 1} />
    </Demo>
  );
}

function SlideC() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [animState, setAnimState] = useState<"idle" | "exit" | "enter">("idle");
  const [dir, setDir] = useState<"fwd" | "bwd">("fwd");
  const [nextIdx, setNextIdx] = useState(0);

  function go(d: "fwd" | "bwd") {
    const next = d === "fwd" ? Math.min(idx + 1, CARDS.length - 1) : Math.max(idx - 1, 0);
    if (next === idx) return;
    setDir(d);
    setNextIdx(next);
    setAnimState("exit");
    setTimeout(() => {
      setDisplayed(next);
      setIdx(next);
      setAnimState("enter");
      setTimeout(() => setAnimState("idle"), 220);
    }, 180);
  }

  const exitClass = dir === "fwd" ? "exit-left" : "exit-right";
  const enterClass = dir === "fwd" ? "enter-right" : "enter-left";

  return (
    <Demo label="В) Пълен слайд — изход + вход едновременно">
      <style>{`
        @keyframes exitLeft  { from { opacity:1; transform:translateX(0); }    to { opacity:0; transform:translateX(-40px); } }
        @keyframes exitRight { from { opacity:1; transform:translateX(0); }    to { opacity:0; transform:translateX(40px); }  }
        @keyframes entRight  { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); }    }
        @keyframes entLeft   { from { opacity:0; transform:translateX(-40px);}  to { opacity:1; transform:translateX(0); }    }
        .exit-left   { animation: exitLeft  0.18s ease-in forwards; }
        .exit-right  { animation: exitRight 0.18s ease-in forwards; }
        .enter-right { animation: entRight  0.22s ease-out; }
        .enter-left  { animation: entLeft   0.22s ease-out; }
      `}</style>
      <Card
        title={CARDS[displayed]}
        animClass={animState === "exit" ? exitClass : animState === "enter" ? enterClass : ""}
        idx={displayed}
      />
      <Buttons onFwd={() => go("fwd")} onBwd={() => go("bwd")} idx={idx} max={CARDS.length - 1} />
    </Demo>
  );
}

// ─── Button demos ─────────────────────────────────────────────────────────────

function ButtonDemos() {
  return (
    <Demo label="Бутони — 3 варианта">
      <style>{`
        @keyframes ripple { 0%{transform:scale(0);opacity:.5} 100%{transform:scale(3);opacity:0} }
        .btn-scale:active  { transform:scale(0.93); transition:transform 0.1s ease; }
        .btn-flash:active  { background-color:#3a7ae0 !important; }
        .btn-ripple { position:relative; overflow:hidden; }
        .btn-ripple:active::after {
          content:''; position:absolute; inset:0; background:white;
          border-radius:inherit; animation:ripple 0.4s ease-out;
        }
      `}</style>
      <div className="space-y-3 w-full">
        <p className="text-xs text-gray-400 text-center">Натисни и задръж</p>
        <button className="btn-scale w-full h-12 rounded-2xl text-white font-bold text-base" style={{backgroundColor:"#4F8EF7"}}>
          А) Свиване (scale)
        </button>
        <button className="btn-flash w-full h-12 rounded-2xl text-white font-bold text-base" style={{backgroundColor:"#4F8EF7"}}>
          Б) Потъмняване (flash)
        </button>
        <button className="btn-ripple w-full h-12 rounded-2xl text-white font-bold text-base" style={{backgroundColor:"#4F8EF7"}}>
          В) Ripple ефект
        </button>
      </div>
    </Demo>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Card({ title, animClass, idx }: { title: string; animClass: string; idx: number; key?: number }) {
  return (
    <div className={`w-full rounded-2xl p-4 bg-white/80 shadow-sm ${animClass}`}>
      <p className="text-xs text-gray-400 mb-1">тема / подтема</p>
      <p className="text-base font-semibold text-gray-800 mb-3">{title}</p>
      <div className="space-y-2">
        {["Какво е", "Защо е важно", "Пример"].map((l) => (
          <div key={l} className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{l}</p>
            <p className="text-sm text-gray-600">Примерен текст за демото. Карта {idx + 1}/5.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Buttons({ onFwd, onBwd, idx, max }: { onFwd: () => void; onBwd: () => void; idx: number; max: number }) {
  return (
    <div className="flex gap-3 w-full mt-3">
      {idx > 0 && (
        <button onClick={onBwd} className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-xl font-bold text-gray-500">←</button>
      )}
      <button onClick={onFwd} disabled={idx >= max} className="flex-1 h-12 rounded-2xl text-white font-bold text-base disabled:opacity-40" style={{backgroundColor:"#4F8EF7"}}>
        Напред →
      </button>
    </div>
  );
}

function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">{label}</p>
      <div className="flex flex-col items-stretch gap-0" style={{backgroundColor:"#E8F4FD", borderRadius:20, padding:16}}>
        {children}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PreviewPage() {
  return (
    <main className="max-w-sm mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Preview</h1>
      <p className="text-sm text-gray-400 mb-6">Тествай анимациите и избери</p>
      <SlideA />
      <SlideB />
      <SlideC />
      <ButtonDemos />
      <p className="text-xs text-gray-300 text-center mt-4">Тази страница ще бъде изтрита след избора</p>
    </main>
  );
}
