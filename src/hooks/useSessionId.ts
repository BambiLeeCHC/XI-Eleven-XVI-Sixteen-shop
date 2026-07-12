import { useState } from "react";

function generateId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useSessionId(): string {
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("xi-xvi-session-id");
    if (stored) return stored;
    const id = generateId();
    localStorage.setItem("xi-xvi-session-id", id);
    return id;
  });
  return sessionId;
}
