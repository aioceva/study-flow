"use client";

import { NAV } from "@/types";

interface Props {
  name: string;
  onClose: () => void;
}

export function FirstLessonBadgeModal({ name, onClose }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.60)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="badge-modal-card"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
          padding: "36px 28px 28px",
          maxWidth: 360,
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* X close button */}
        <button
          onClick={onClose}
          className="btn-press"
          aria-label="Затвори"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#F0F2F5",
            color: "#5A6A7E",
            fontSize: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            border: "none",
          }}
        >
          ×
        </button>

        {/* Badge image */}
        <img
          src="/badges/urok_1_no_bgr.png"
          alt="Бадж за първи урок"
          style={{ width: 148, height: 148, objectFit: "contain" }}
          draggable={false}
        />

        {/* Message */}
        <p
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 700,
            color: "#2C1668",
            lineHeight: 1.45,
            margin: 0,
          }}
        >
          Браво, {name}!<br />Завърши урока!
        </p>

        {/* Primary action button */}
        <button
          onClick={onClose}
          className="btn-press w-full rounded-2xl text-white font-medium text-base"
          style={{ backgroundColor: NAV.btnSolid, height: 52, border: "none" }}
        >
          ✓ Супер!
        </button>
      </div>
    </div>
  );
}
