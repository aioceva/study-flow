"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV } from "@/types";

export function FeedbackButton({ user, white }: { user: string; white?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const iconColor = white ? "#FFFFFF" : NAV.text;

  async function handleSubmit() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, message: message.trim(), screen: pathname }),
      });
      setSent(true);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setMessage("");
        setSending(false);
      }, 1500);
    } catch {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-press w-8 h-8 flex items-center justify-center"
        style={{ opacity: 0.55 }}
        aria-label="Обратна връзка"
      >
        {/* Speech bubble / feedback icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: NAV.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <p className="text-base text-center py-4" style={{ color: NAV.text }}>
                Благодаря! 🙏
              </p>
            ) : (
              <>
                <h2 className="text-base font-bold" style={{ color: NAV.text }}>
                  Кажи ни какво мислиш
                </h2>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напиши тук..."
                  rows={4}
                  className="w-full rounded-xl p-3 text-base resize-none"
                  style={{
                    backgroundColor: NAV.surface,
                    color: NAV.text,
                    border: `1px solid ${NAV.border}`,
                    outline: "none",
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={sending || !message.trim()}
                    className="btn-press flex-1 rounded-xl py-3 text-white text-base"
                    style={{
                      backgroundColor: NAV.btnSolid,
                      opacity: !message.trim() || sending ? 0.5 : 1,
                    }}
                  >
                    {sending ? "..." : "Изпрати"}
                  </button>
                  <button
                    onClick={() => { setOpen(false); setMessage(""); }}
                    className="btn-press flex-1 rounded-xl py-3 text-base"
                    style={{ backgroundColor: NAV.surface, color: NAV.text }}
                  >
                    Затвори
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
