/** Full 78-card deck bridge. */
import { ARCANA, type ArcanaCard } from "./arcana";
import { MINOR_ARCANA } from "./minorArcana";

export const FULL_DECK: ArcanaCard[] = [...ARCANA, ...MINOR_ARCANA];
export const FULL_DECK_COUNT = FULL_DECK.length;
