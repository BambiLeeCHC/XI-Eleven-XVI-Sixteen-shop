/* ═══════════════════════════════════════════════════════════════════════
   THE MASTHEAD — cut-and-paste collage.

   "The Journal" is set as a ransom note: every letter is its own scrap of
   paper with its own typeface, tilt and torn edge, pasted over strips of
   tape and hand-drawn scribbles. The standfirst is the same trick at a
   smaller size, word by word so it stays readable, and the sign-off is
   handwritten. Everything is hard-coded rather than randomised so the
   masthead is identical on every visit — it's a logo, not a lottery.
   ═══════════════════════════════════════════════════════════════════════ */

type Scrap = {
  ch: string;
  /** paper stock */
  paper: "newsprint" | "cream" | "kraft" | "ink" | "gold" | "lilac" | "blush";
  /** typeface family */
  face: "slab" | "display" | "type" | "grotesk" | "script";
  rot: number;
  dy: number;
  scale: number;
};

const TITLE: Scrap[] = [
  { ch: "T", paper: "ink", face: "grotesk", rot: -4.5, dy: 2, scale: 1.02 },
  { ch: "h", paper: "newsprint", face: "display", rot: 3, dy: -3, scale: 0.86 },
  { ch: "e", paper: "kraft", face: "type", rot: -2, dy: 4, scale: 0.8 },
  { ch: " ", paper: "newsprint", face: "type", rot: 0, dy: 0, scale: 0.5 },
  { ch: "J", paper: "gold", face: "display", rot: -3, dy: -2, scale: 1.12 },
  { ch: "O", paper: "newsprint", face: "grotesk", rot: 4, dy: 3, scale: 0.98 },
  { ch: "u", paper: "blush", face: "type", rot: -5, dy: -1, scale: 0.9 },
  { ch: "R", paper: "ink", face: "display", rot: 2.5, dy: 4, scale: 1.05 },
  { ch: "n", paper: "cream", face: "grotesk", rot: -3.5, dy: -3, scale: 0.92 },
  { ch: "a", paper: "lilac", face: "type", rot: 3.5, dy: 3, scale: 0.86 },
  { ch: "L", paper: "newsprint", face: "display", rot: -2.5, dy: -2, scale: 1.06 },
];

const STANDFIRST: Array<{ w: string; paper: Scrap["paper"]; face: Scrap["face"]; rot: number }> = [
  { w: "A", paper: "newsprint", face: "type", rot: -2 },
  { w: "house", paper: "ink", face: "grotesk", rot: 1.5 },
  { w: "record", paper: "cream", face: "display", rot: -1.5 },
  { w: "of", paper: "kraft", face: "type", rot: 2.5 },
  { w: "manifesto,", paper: "newsprint", face: "grotesk", rot: -1 },
  { w: "material", paper: "blush", face: "display", rot: 2 },
  { w: "and", paper: "newsprint", face: "type", rot: -2.5 },
  { w: "ritual.", paper: "gold", face: "grotesk", rot: 1 },
];

function Scribbles() {
  /* Two small pen marks only. A stretched full-width ellipse reads as a grey
     smear behind the letters, so the circle was cut: what stays is a margin
     arrow and an underline, both of which survive being stretched. */
  return (
    <>
      <svg className="jmast__pen jmast__pen--arrow" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M12 104 C36 92, 62 66, 84 30" fill="none" stroke="rgba(109,63,176,.45)" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 34 L86 26 L92 43" fill="none" stroke="rgba(109,63,176,.45)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg className="jmast__pen jmast__pen--rule" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M6 15 C60 6, 108 20, 164 12 C220 4, 268 19, 326 10 C356 6, 378 12, 394 9"
          fill="none"
          stroke="rgba(196,141,255,.55)"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

export function JournalMasthead() {
  return (
    <header className="jmast">
      {/* pasted-down backing scraps */}
      <span className="jmast__patch jmast__patch--a" aria-hidden="true" />
      <span className="jmast__patch jmast__patch--b" aria-hidden="true" />
      <span className="jmast__patch jmast__patch--c" aria-hidden="true" />
      <span className="jmast__tape jmast__tape--tl" aria-hidden="true" />
      <span className="jmast__tape jmast__tape--br" aria-hidden="true" />

      <Scribbles />

      <p className="jmast__slug">
        <span>XI · XVI</span>
        <i />
        <span>EST. 11:16</span>
        <i />
        <span>No. 01</span>
      </p>

      <h1 className="jmast__title" aria-label="The Journal">
        {[TITLE.slice(0, 3), TITLE.slice(4)].map((word, w) => (
          /* Letters are grouped per word so a narrow screen breaks between
             "The" and "Journal" instead of mid-word. */
          <span className="jmast__wordgroup" key={w}>
            {word.map((sc, i) => (
              <span
                key={i}
                className={`jmast__scrap jmast__scrap--${sc.paper} jmast__face--${sc.face}`}
                style={{
                  ["--rot" as string]: `${sc.rot}deg`,
                  ["--dy" as string]: `${sc.dy}px`,
                  ["--sc" as string]: String(sc.scale),
                }}
                aria-hidden="true"
              >
                {sc.ch}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <p className="jmast__stand" aria-label="A house record of manifesto, material and ritual.">
        {STANDFIRST.map((s, i) => (
          <span
            key={i}
            className={`jmast__word jmast__scrap--${s.paper} jmast__face--${s.face}`}
            style={{ ["--rot" as string]: `${s.rot}deg` }}
            aria-hidden="true"
          >
            {s.w}
          </span>
        ))}
      </p>

      <p className="jmast__sign">Time, kept at 11:16.</p>
    </header>
  );
}

export default JournalMasthead;
