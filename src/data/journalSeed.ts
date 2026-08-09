// Seed content for the XI·XVI Journal, so the feed is never empty on a fresh
// deployment. Moved out of the backend during the Supabase migration — it is
// plain content, and the admin "seed posts" button now inserts it directly.

export const WELCOME_POST = {
  title: "Welcome to 11:16",
  slug: "welcome-to-11-16",
  excerpt:
    "Eleven is the signal. Sixteen is the reckoning. Together they are a house of clothing that refuses to waste anything — including you.",
  category: "Manifesto",
  tags: ["manifesto", "numerology", "sustainability", "self-empowerment"],
  author: "XI · XVI",
  readMinutes: 6,
  featured: true,
  content: `
<p class="lede">You did not find this number by accident. Nobody ever does.</p>

<p>11:16 is the moment you glance up and the clock is looking back at you. It is the receipt total, the flight gate, the seat number, the hour your kid was born, the mile marker on the drive you took to get away from something. Twice a day, every day, the same two numbers line up and ask you a quiet question: <em>are you still building the life you said you would?</em></p>

<p><strong>XI Eleven XVI Sixteen</strong> is our answer. A house of clothing built on two numbers, one promise, and zero waste.</p>

<h2>XI — the signal</h2>

<p>Eleven is the master number of illumination. It is the moment of knowing that arrives before the proof does. Eleven is intuition with a spine: the friend who tells you the truth, the idea that will not let you sleep, the decision you make before you can explain it.</p>

<figure class="journal-figure journal-figure--right">
  <img src="/journal/sky-bust.jpg" alt="The house mannequin, skinned in a clouded sky, wearing the Sherbet Rainbow Icon tee with the XI·XVI shield at the chest." loading="lazy" />
</figure>

<p>Everything we design begins at eleven. Not with a trend report — with a signal. A silhouette that makes someone stand up straighter. A fabric weight that feels like being held. We design the feeling first and the garment second.</p>

<h2>XVI — the reckoning</h2>

<p>Sixteen is the tower. It is the number of the necessary collapse — the shattering of what was hollow so something structurally honest can be built on the site. 1 + 6 = 7: the seeker. The one who goes looking after the fall.</p>

<p>Fashion needed its sixteen. The industry produces roughly <strong>92 million tons of textile waste a year</strong>, and it produces it on purpose: guess the demand, overproduce to be safe, discount what is left, bury the rest. That is not a supply chain. That is a landfill with a marketing budget.</p>

<h2>XI + XVI = XXVII → IX</h2>

<figure class="journal-swatches journal-figure journal-figure--left">
  <img src="/journal/swatch-sherbet.jpg" alt="Sherbet Rainbow tie-dye swatch." loading="lazy" />
  <img src="/journal/swatch-whisper.jpg" alt="Whisper monogram jacquard swatch, gold XI·XVI repeat." loading="lazy" />
  <img src="/journal/swatch-volt.jpg" alt="Volt glitch-print swatch showing the doubled 11." loading="lazy" />
</figure>

<p>Eleven plus sixteen is twenty-seven. Two plus seven is nine — the number of completion, of a cycle closing cleanly with nothing left over. That is not a slogan for us. It is the operating model:</p>

<ul>
  <li><strong>Nothing exists until it is yours.</strong> Every piece is made to order, after you order it. No warehouse, no overrun, no dead stock, no markdown graveyard.</li>
  <li><strong>One piece, one owner.</strong> The couture idea — something made specifically for you — without the couture gatekeeping.</li>
  <li><strong>Zero unsold inventory.</strong> The most sustainable garment on earth is the one that was never speculatively produced.</li>
</ul>

<blockquote>We are not a sustainable brand because we offset. We are a sustainable brand because we do not overproduce. Restraint is the technology.</blockquote>

<h2>What this Journal is for</h2>

<p>This is the room where the brand thinks out loud. Three things live here, and they run on the same clock you do:</p>

<p><strong>The Almanac.</strong> A calendar built around 11:16 — your two daily checkpoints, the moon overhead, and the number that governs each date. Time, treated as a design material instead of a countdown to a sale.</p>

<p><strong>The Daily Code.</strong> One line, every day, on sustainability and self-possession. Not a platitude. A directive small enough to actually execute before noon.</p>

<p><strong>The Draw.</strong> A house deck of twenty-two plates, written and drawn in-house as a language of self-empowerment and material honesty. XVI is The Tower for a reason. Three cards a day — The Signal, The Work, The Tower — read as prompts, not prophecy.</p>

<figure class="journal-figure journal-figure--cutout journal-figure--right">
  <img src="/mannequin-women-v37.png" alt="The house sky mannequin in the gold XI·XVI monogram slip dress." loading="lazy" />
</figure>

<h2>The manifesto, in nine lines</h2>

<ol>
  <li>Make nothing that is not wanted.</li>
  <li>Waste is a design failure, never a cost of doing business.</li>
  <li>Luxury is precision, not scarcity theater.</li>
  <li>Fit is a form of respect.</li>
  <li>A garment should make its wearer more themselves, not more current.</li>
  <li>Meaning is not decoration. Every mark we make carries a number behind it.</li>
  <li>Own less. Choose harder. Wear it out.</li>
  <li>Self-expression is a survival skill, and we are in the business of it.</li>
  <li>Close every cycle at nine — nothing left over.</li>
</ol>

<p>So: welcome to 11:16. Set an intention at 11:16 AM. Check your work at 11:16 PM. Wear something that was made for exactly one person.</p>

<p class="signoff">— XI · XVI</p>
`.trim(),
};

export const SECOND_POST = {
  title: "Made to Order Is Not a Feature. It Is the Whole Argument.",
  slug: "made-to-order-is-the-argument",
  excerpt:
    "Overproduction is the industry's default setting. Here is the math on what changes when a garment does not exist until someone wants it.",
  category: "Sustainability",
  tags: ["sustainability", "made-to-order", "zero-waste"],
  author: "XI · XVI",
  readMinutes: 4,
  featured: false,
  content: `
<p class="lede">The fashion industry's biggest emission is not a factory. It is a guess.</p>

<p>Conventional production begins with a forecast: how many will we sell? Because being short looks like failure and being long looks like ambition, the guess is always high. Somewhere between 10% and 40% of what gets made never sells at full price, and a meaningful slice of it is never worn at all.</p>

<h2>What we do instead</h2>

<p>You choose the piece. The order triggers the production. The garment is made — once, for you — and shipped. There is no shelf in this story, so there is nothing on the shelf to write off.</p>

<ul>
  <li><strong>Zero unsold units</strong>, so zero deadstock destruction.</li>
  <li><strong>No markdown cycle</strong>, so the price is honest the first time.</li>
  <li><strong>Fewer, better pieces</strong>, because we are not incentivized to move volume.</li>
</ul>

<blockquote>Ask any brand this one question: what happens to what you don't sell? The answer tells you everything.</blockquote>

<p>The trade-off is patience — your piece takes a few days longer because it is being made rather than picked. We think that is the correct trade. Nine closes the cycle with nothing left over.</p>

<p class="signoff">— XI · XVI</p>
`.trim(),
};

export const THIRD_POST = {
  title: "How We Print Without a Single Drop of Water",
  slug: "how-we-print-without-a-single-drop-of-water",
  excerpt:
    "Your piece begins as light, not liquid. Inside the sublimation process — why our color is fused into the fiber instead of floated on top of it, and why no dye bath means no discharge, ever.",
  coverImage: "https://xixvi.shop/journal/sublimation-transfer-negative.jpg",
  category: "Sustainability",
  tags: ["sublimation", "sustainability", "process", "made-to-order", "zero-waste"],
  author: "XI · XVI",
  readMinutes: 8,
  featured: false,
  content: `
<p class="lede">Your piece begins as light, not liquid — a digital file printed onto a photographic-grade transfer negative, then heat-fused into fiber until the color is not sitting on the fabric, but living inside it. Which is another way of saying: the piece you put on tonight will look exactly this rich the hundredth time you wear it.</p>

<p>That sentence describes almost no one else in fashion. The industry default is a dye bath: garments submerged in vats of water and chemical fixative, one shade at a time — an estimated 2,000 gallons of water per pair of jeans, by some counts. That water does not simply disappear. In July 2023, the UK's Environment Agency confirmed that a stretch of the River Trent below Stoke-on-Trent had turned bright orange and blue after clothing dye was released into it. In Tangail, Bangladesh, the Louhajang River has run red, yellow, and purple for years, traced to a nearby textile mill that was fined for illegal discharge once before — and simply kept discharging. In West Java, Indonesia, the Citarum, called "the most polluted river in the world" in a 2012 government-commissioned assessment, sits downstream of more than a thousand textile factories; in 2020, a Bandung court found one of them guilty of dumping hazardous waste into it and ordered over $300,000 in damages. A widely cited UN figure puts textile dyeing at up to a fifth of all global industrial water pollution. These are documented, dated, and in some cases litigated — not hypotheticals. We skip the bath entirely, which means we skip that discharge entirely, permanently, by design. We sublimate.</p>

<h2>From pixel to permanent</h2>

<p>Here is what that actually means, start to finish. Your colorway — the gold shield, the glitch "11 16," the monogram repeat — starts as a digital file. We print it, at full saturation, onto a calibrated transfer negative engineered to hold color with total precision. That negative is pressed against your fabric panel under controlled heat near 400°F. At that threshold the ink skips its liquid state entirely — it converts straight to gas and bonds at the molecular level with our four-way stretch fabric, the same way an image fixes permanently onto film stock. The color does not sit on the garment. It becomes the garment — the quiet reason a piece like this holds up to being worn on repeat, season after season, instead of retiring to the back of a closet after one good night out. No dye bath means no wastewater to treat or discharge: nothing enters a drain in the first place.</p>

<figure class="journal-figure journal-figure--right">
  <img src="https://xixvi.shop/journal/sublimation-heat-fusion.jpg" alt="Close-up of the heat press fusing gold pigment into a four-way stretch fabric panel, the ink converting to gas at the fiber." loading="lazy" />
</figure>

<p>Set side-by-side against screen printing — the industry's old-world default — the difference holds at every stage:</p>

<table style="width:100%; border-collapse:collapse; margin:28px 0; font-size:15px; line-height:1.5;">
  <thead>
    <tr>
      <th style="padding:12px 14px;"></th>
      <th style="padding:14px; text-align:left; color:#fff; background:#15243d; border-radius:8px 0 0 0;">Sublimation — Our Process</th>
      <th style="padding:14px; text-align:left; color:rgba(21,36,61,.55); background:rgba(21,36,61,.06); border-radius:0 8px 0 0;">Screen Printing — The Industry Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d; border-bottom:1px solid rgba(21,36,61,.08);">The ink</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-bottom:1px solid rgba(21,36,61,.08);">Converts to gas under heat and bonds directly into the fiber</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55); border-bottom:1px solid rgba(21,36,61,.08);">A plastisol paste, squeegeed across a mesh screen and left to sit on the surface</td>
    </tr>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d; border-bottom:1px solid rgba(21,36,61,.08);">The bond</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-bottom:1px solid rgba(21,36,61,.08);">Permanent — part of the yarn, not a coating on it</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55); border-bottom:1px solid rgba(21,36,61,.08);">Surface adhesion only — a layer resting on top, waiting to lift</td>
    </tr>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d; border-bottom:1px solid rgba(21,36,61,.08);">The hand-feel</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-bottom:1px solid rgba(21,36,61,.08);">Invisible — the fabric feels like fabric, because it still is</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55); border-bottom:1px solid rgba(21,36,61,.08);">A stiff, plasticky patch you can feel from the inside</td>
    </tr>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d; border-bottom:1px solid rgba(21,36,61,.08);">Over time</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-bottom:1px solid rgba(21,36,61,.08);">Unchanged — wash after wash, year after year</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55); border-bottom:1px solid rgba(21,36,61,.08);">Cracks, flakes, and fades — often within a season</td>
    </tr>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d; border-bottom:1px solid rgba(21,36,61,.08);">Per-color cost</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-bottom:1px solid rgba(21,36,61,.08);">Zero — one digital file, infinite colorways</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55); border-bottom:1px solid rgba(21,36,61,.08);">A new screen, and a new setup charge, for every single color</td>
    </tr>
    <tr>
      <td style="padding:12px 14px; font-weight:650; color:#15243d;">Water used</td>
      <td style="padding:12px 14px; background:rgba(196,141,255,.07); border-radius:0 0 0 8px;">None, at any stage</td>
      <td style="padding:12px 14px; color:rgba(21,36,61,.55);">A wash-out and cleanup cycle for every screen, every run</td>
    </tr>
  </tbody>
</table>

<figure class="journal-figure journal-figure--left">
  <img src="https://xixvi.shop/journal/sublimation-embroidery-crest.jpg" alt="Macro photograph of the gold shield crest being embroidered onto a genuinely hand tie-dyed fabric." loading="lazy" />
</figure>

<p>Our organic cotton T-Icon tees are the one exception. Cotton does not accept a sublimated dye the way our four-way stretch fabric does, so the gold shield crest is applied by direct-to-film print instead — a distinct process built for natural fiber. On the tie-dye styles, that same crest is embroidered — stitched thread laid over a spiral pattern that is itself genuinely hand-dyed, one piece at a time. The tie-dye underneath is real dye on real fabric, never a printed effect standing in for it — which is why no two tie-dye pieces we make are ever quite the same.</p>

<h3>The economics of clean</h3>

<p>Screen printing needs a physical screen and a full setup charge for every single color a brand offers — so a shirt in six colors usually costs six times as much to produce and creates six times the waste, which is exactly why most brands quietly round down to the two or three colors they can actually afford to stock. We skip all of that: changing color is just a different digital file, so every color we offer costs exactly the same to produce as the first, and we can offer all of them. We also only make a piece once it's actually been ordered, instead of guessing at a batch of five hundred "to be safe" and hoping they sell — so no color is ever mixed, printed, or wasted for a garment that doesn't yet have an owner. Because the color is fused into the fabric itself rather than sitting on top of it like a plastic sticker, it doesn't crack, peel, or fade the way that kind of printed layer eventually does — it simply outlasts the wash, year after year.</p>

<blockquote>The cleanest ink is the ink that never needed a bath to begin with.</blockquote>

<h2>Made because you asked for it</h2>

<p>"Made to order" is the literal sequence here, and it starts the second your order comes through. Your size, color, and quantity enter production instantly — nothing pulled from a shelf, because your piece doesn't exist yet. Your colorway is rendered onto its transfer negative, mapped to your exact cut, then converted to gas and bonded into the panel at the fiber level under controlled heat — permanently. The panels are cut and sewn to spec — tie-bow straps, built-in shelf, flat-seam stitching — quality-checked for print and finish, then tracked door to door, typically arriving within one to two weeks: a few days longer than a shelf pick, because it was never on a shelf. Nothing about it came from a pile of extras made just in case. It exists because you ordered it — and that is the whole of what we mean by sustainable: not a badge or a slogan, but a supply chain with nothing left over. No dye bath. No dead stock. No layer waiting to crack. Your size, your color, printed once, sent to one address, built to be worn for years, not one good night out.</p>

<p class="signoff">— XI · XVI</p>
`.trim(),
};


export const SEED_POSTS = [WELCOME_POST, SECOND_POST, THIRD_POST] as Array<{
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  readMinutes: number;
  featured: boolean;
  coverImage?: string;
  content: string;
}>;
