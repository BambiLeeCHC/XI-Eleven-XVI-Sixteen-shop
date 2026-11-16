import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GroupReadRoom } from "../components/north/GroupReadRoom";
import { CompassRose } from "../components/north/CompassRose";
import { SkyAvatar } from "../components/north/SkyAvatar";
import { AvatarStudio } from "../components/north/AvatarStudio";
import { TarotCardArt } from "../components/north/TarotCardArt";
import { HeirloomBacksCarousel } from "../components/north/HeirloomBacksCarousel";
import { TrueNorthAtmosphere } from "../components/journal/TrueNorthAtmosphere";
import { SEO } from "../components/SEO";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { PAGE_SEO } from "../data/seoMeta";
import { api, useAuthActions, useQuery } from "../lib/backend";
import { celestialPortraitSvg } from "../lib/celestialAvatar";
import {
  activeAvatarUrl,
  addComment,
  createPost,
  moveTop,
  MY_CONSTELLATION_LABEL,
  MY_SKY_LABEL,
  NORTH_SOCIAL_SKY_TAB,
  NORTH_SOCIAL_STORAGE_KEY,
  promoteTop,
  rankedEight,
  REACTION_LABEL,
  resolveTrueNorthView,
  syncNorthAvatar,
  toggleReaction,
  upgradeSocialState,
  upsertFriend,
  type ReactionKey,
  type ReadingMode,
  type SkyPanel,
  type SocialPost,
  type SocialState,
  type SpaceProfile,
  type TopFriend,
} from "../lib/northSocial";
import { supabase } from "../lib/supabase";
import { ChartHomePage } from "./chart/ChartHomePage";
import DeepReadingPage from "./DeepReadingPage";
import { NumbersPage } from "./chart/NumbersPage";
import { ProfileEditor } from "./chart/ProfileEditor";
import { TrueNorthNav, type NatalChartResult, type NumerologyResult } from "./chart/shared";

const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

function atHandle(handle: string) {
  return `@${handle.trim().replace(/^@+/, "")}`;
}

function portraitFor(name: string, handle: string, sign: string, youHandle: string, youSrc: string) {
  if (youSrc && (handle === youHandle || name === "You")) return youSrc;
  return celestialPortraitSvg(name, sign);
}

/* NOTE: remainder of file preserved in repo — this push was truncated in tooling.
 * Use a follow-up commit with the full NorthSocialPage if this overwrote incompletely.
 */
export function NorthSocialPage() {
  return (
    <div className="journal-page journal-page--truenorth north-social">
      <TrueNorthAtmosphere />
      <div className="journal-stack tn-shell">
        <SEO title={PAGE_SEO.chart.title} description={PAGE_SEO.chart.description} url="/chart" />
        <HeirloomBacksCarousel />
        <header className="tn-card north-social__head north-shell">
          <div className="north-social__brand">
            <CompassRose />
            <div>
              <p className="north-kicker">XI · XVI</p>
              <h1 className="clash north-social__title">True North</h1>
            </div>
          </div>
          <TrueNorthNav />
        </header>
      </div>
    </div>
  );
}
