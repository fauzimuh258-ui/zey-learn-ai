"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  durationMs?: number;
}

const TYPE_STYLES: Record<ToastType, string> = {
  success: "bg-emerald-600 border-emerald-500",
  error: "bg-red-600 border-red-500",
  info: "bg-indigo-600 border-indigo-500",
};

export default function Toast({
  message,
  type = "success",
  isVisible,
  onClose,
  durationMs = 3000,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [isVisible, durationMs, onClose]);

  if (!isVisible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 animate-toast-in sm:w-auto"
    >
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-xs font-medium text-white shadow-lg ${TYPE_STYLES[type]}`}
      >
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
