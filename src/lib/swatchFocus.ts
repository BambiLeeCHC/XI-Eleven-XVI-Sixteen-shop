/** Zoom into the printed area of a flat mockup. */
export function swatchFocus(name: string) {
  const value = name.toLowerCase();
  if (value.includes("b-lift")) return { x: 0.5, y: 0.58, zoom: 3.2 };
  if (value.includes("d-slip")) return { x: 0.5, y: 0.64, zoom: 4.6 };
  if (value.includes("j-glitch")) return { x: 0.5, y: 0.5, zoom: 3.05 };
  if (value.includes("l-flow")) {
    // Dash and Onyx swatches are already cropped to the print.
    if (value.includes("dash") || value.includes("onyx"))
      return { x: 0.5, y: 0.5, zoom: 1.15 };
    return { x: 0.586, y: 0.314, zoom: 5.56 };
  }
  if (value.includes("t-icon")) return { x: 0.5, y: 0.4, zoom: 3.3 };
  if (value.includes("s-glitch 2.5") || value.includes("s-glitch 2"))
    return { x: 0.5, y: 0.5, zoom: 4.6 };
  if (
    value.includes("s-glitch") &&
    value.includes("6.3") &&
    (value.includes("black") || value.includes("ice"))
  ) {
    return { x: 0.5, y: 0.5, zoom: 1.15 };
  }
  if (value.includes("s-glitch")) return { x: 0.5, y: 0.48, zoom: 3.1 };
  return { x: 0.5, y: 0.5, zoom: 3.2 };
}
