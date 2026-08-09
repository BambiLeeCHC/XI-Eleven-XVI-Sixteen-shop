import { useState } from "react";
import { getSessionId } from "../lib/session";

export function useSessionId(): string {
  const [sessionId] = useState(getSessionId);
  return sessionId;
}
