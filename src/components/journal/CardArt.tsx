import type { ArcanaCard } from "../../data/arcana";

/* restored - see local for full; temporary short to fix placeholder */
export function sceneOf(card: ArcanaCard): Scene {
  if (SCENE_BY_NUMBER[card.number] !== undefined) {
    return SCENE_BY_NUMBER[card.number];
  }
  switch (card.element) {
    case "Fire": return "tower";
    case "Water": return "moon";
    case "Earth": return "scales";
    case "Air": return "stars";
    default: return "wheel";
  }
}
