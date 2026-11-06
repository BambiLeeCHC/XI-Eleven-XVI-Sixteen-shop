import { useCallback, useState } from "react";
import {
  NORTH_SOCIAL_STORAGE_KEY,
  readStoredSocial,
  type SocialState,
} from "./northSocial";

export function useNorthSocial() {
  const [state, setState] = useState<SocialState>(() => {
    if (typeof localStorage === "undefined") return readStoredSocial(null);
    return readStoredSocial(localStorage.getItem(NORTH_SOCIAL_STORAGE_KEY));
  });

  const update = useCallback((next: SocialState | ((current: SocialState) => SocialState)) => {
    setState(current => {
      const resolved = typeof next === "function" ? next(current) : next;
      try {
        localStorage.setItem(NORTH_SOCIAL_STORAGE_KEY, JSON.stringify(resolved));
      } catch {
        // Private mode can refuse the write. The screen still updates.
      }
      return resolved;
    });
  }, []);

  return { state, update };
}
