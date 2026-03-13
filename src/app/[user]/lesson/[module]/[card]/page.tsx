"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Adaptation, Card } from "@/types";
import { nextStep, prevStep } from "@/lib/navigation";

export default function CardPage() {
  const { user, module: moduleParam, card: cardParam } = useParams<{
    user: string; module: string; card: string;
  }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const moduleId = parseInt(moduleParam);
  const cardId = parseInt(cardParam);
  const params = searchParams.toString();

  const [adaptation, setAdaptation] = useState<Adaptation | null>(null);
  const [card, setCard] = useState<Card | null>(null);

  useEffect(() => {
    async function load() {
      let data: Adaptation | null = null;
      const raw = sessionStorage.getItem("adaptation");
      if (raw) {
        data = JSON.parse(raw);
      } else {
        const subject = searchParams.get("subject");
        const lesson = searchParams.get("lesson");
        if (!subject || !lesson) return;
        const res = await fetch(`/api/adaptation?user=${user}&subject=${subject}&lesson=${lesson}`);
        const json = await res.json();
        if (!json.exists) return;
        data = json.adaptation;
        sessionStorage.setItem("adaptation", JSON.stringify(data));
        if (json.quiz) sessionStorage.setItem("quiz", JSON.stringify(json.quiz));
      }
      if (!data) return;
      setAdaptation(data);
      const mod = data.modules.find((m) => m.id === moduleId);
      const c = mod?.cards.find((c) => c.id === cardId);
      if (c) setCard(c);
    }
    load();
  }, [moduleId, cardId, user, searchParams]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => router.push(nextStep(user, moduleId, cardId, params)),
    onSwipedRight: () => {
      if (!(moduleId === 1 && cardId === 1))
        router.push(prevStep(user, moduleId, cardId, params));
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  if (!adaptation || !card) {
    return <div className="flex-1 flex items-center justify-center p-6">
      <p className="text-gray-400">Зарежда...</p>
    </div>;
  }

  const moduleData = adaptation.modules.find((m) => m.id === moduleId);

  return (
    <div {...swipeHandlers} className="px-5 pt-4 pb-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
        Модул {moduleId} · {moduleData?.title}
      </p>
      <h1 className="text-lg font-bold mb-3">{card.title}</h1>
      <div className="space-y-2">
        <Section icon="📌" label="Какво е" text={card.what} />
        <Section icon="💡" label="Защо е важно" text={card.why} />
        <Section icon="✏️" label="Пример" text={card.example} />
      </div>
    </div>
  );
}

function Section({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div className="bg-white/70 rounded-xl p-3">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
        {icon} {label}
      </p>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}
