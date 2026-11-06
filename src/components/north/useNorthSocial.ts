import { useEffect, useState } from "react";
import {
  blankState,
  NORTH_SOCIAL_STORAGE_KEY,
  rankedEight,
  type SocialState,
  starterSpace,
} from "../../lib/northSocial";

export function loadNorthSocial(): SocialState {
  try {
    const raw = localStorage.getItem(NORTH_SOCIAL_STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw) as SocialState;
    if (!parsed?.posts || !parsed.top || !parsed.space) return blankState();
    return {
      posts: parsed.posts,
      top: rankedEight(parsed.top),
      space: { ...starterSpace(), ...parsed.space },
    };
  } catch {
    return blankState();
  }
}

export function useNorthSocial() {
  const [state, setState] = useState<SocialState>(() => blankState());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadNorthSocial());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(NORTH_SOCIAL_STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  return { state, setState, ready };
}
