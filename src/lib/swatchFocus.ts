/** Zoom into the printed area of a flat mockup. */
export function swatchFocus(name: string) {
  const value = name.toLowerCase();
  if (value.includes("b-lift")) return { x: 0.5, y: 0.58, zoom: 3.2 };
  if (value.includes("d-slip")) return { x: 0.5, y: 0.55, zoom: 2.6 };
  if (value.includes("j-glitch")) return { x: 0.5, y: 0.5, zoom: 2.3 };
  if (value.includes("l-flow")) return { x: 0.5, y: 0.5, zoom: 2.6 };
  if (value.includes("t-icon")) return { x: 0.5, y: 0.42, zoom: 2.5 };
  if (value.includes("s-glitch")) return { x: 0.5, y: 0.48, zoom: 2.6 };
  return { x: 0.5, y: 0.5, zoom: 2.8 };
}
