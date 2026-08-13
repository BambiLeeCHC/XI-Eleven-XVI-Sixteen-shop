/**
 * THE XI·XVI ARCANA — the real Major Arcana, 22 cards.
 *
 * Traditional cards, traditional names, traditional meanings — illustrated
 * fresh in-house on the brand's own plate (gold arch, house shield
 * keystone, XI monogram field) with the XI·XVI shield on every card back.
 * Every card carries a number, roman numeral, glyph, colorway, element,
 * numerology reduction, keywords, upright + reversed readings, a one-line
 * ritual, and a fabric/care note that ties the card to the brand's
 * made-to-order model — the same data shape the house deck used, now
 * carrying the real deck's meanings instead of an invented one.
 *
 * Minor Arcana (56 cards) are a planned Phase 2, gated behind the paid tier.
 *
 * © XI Eleven XVI Sixteen L.L.C. — illustration and brand-voiced card text.
 */

export interface ArcanaCard {
  number: number;
  roman: string;
  name: string;
  subtitle: string;
  glyph: string;
  element: "Air" | "Fire" | "Water" | "Earth" | "Aether";
  reduction: number; // numerology reduction of the card number
  keywords: string[];
  /** Plain-language read of the card: what it is actually telling you. */
  meaning: string;
  /** Concrete steps that implement the message, doable the same day. */
  actions: string[];
  upright: string;
  reversed: string;
  ritual: string;
  material: string; // the licensable "fabric note" on the card back
  colorway: [string, string]; // gradient pair used on the card face
}

export const ARCANA: ArcanaCard[] = [
  {
    number: 0,
    roman: "0",
    name: "The Fool",
    subtitle: "The leap before the map exists",
    glyph: "○",
    element: "Air",
    reduction: 9,
    keywords: ["beginnings", "risk", "faith"],
    meaning:
      "You're being asked to start before it's justified — the evidence arrives after the leap, not before it.",
    actions: [
      "Take the one step you keep waiting for permission to take.",
      "Tell someone your plan before it's polished.",
      "Do the beginner version today instead of the perfect version someday.",
    ],
    upright:
      "You are standing at the edge with nothing proven yet, and that is the entire point. The Fool doesn't have a plan — he has trust, and trust moves faster than planning ever will. Jump; the ground shows up.",
    reversed:
      "Recklessness without readiness, or the opposite — so much caution the leap never happens. Either way you are avoiding the actual risk in front of you by performing a different one.",
    ritual: "Do one thing today with no guarantee it works.",
    material: "Unhemmed raw edge — the cut before it's finished.",
    colorway: ["#f5ede6", "#e8d5d0"],
  },
  {
    number: 1,
    roman: "I",
    name: "The Magician",
    subtitle: "Will, made material",
    glyph: "✦",
    element: "Fire",
    reduction: 1,
    keywords: ["manifestation", "skill", "focus"],
    meaning:
      "You already have every tool this requires. The only thing missing is the decision to use them today.",
    actions: [
      "Pick up the tool you've been circling and use it for ten real minutes.",
      "Say the intention out loud, specifically, not as a vibe.",
      "Combine two things you already have instead of waiting on a third.",
    ],
    upright:
      "Everything on the table is already yours — skill, timing, resource, will. The Magician doesn't wait for the missing piece; he starts with what's in his hands. Point your focus and matter follows it.",
    reversed:
      "Talent with no follow-through, or manipulation standing in for real skill. Check whether you're producing something or just performing the appearance of producing something.",
    ritual: "Use the tool you own instead of shopping for a better one.",
    material: "Pressed satin — a surface that holds the mark of the hand.",
    colorway: ["#c48dff", "#7a4bd0"],
  },
  {
    number: 2,
    roman: "II",
    name: "The High Priestess",
    subtitle: "What you know before you can prove it",
    glyph: "◐",
    element: "Water",
    reduction: 2,
    keywords: ["intuition", "the unseen", "patience"],
    meaning:
      "The answer already arrived quietly. You're waiting for it to arrive loudly instead, and it won't.",
    actions: [
      "Spend ten screen-free minutes and write the first sentence that surfaces.",
      "Don't explain the decision yet — just notice what you already believe.",
      "Protect one piece of information; not everything needs to be said now.",
    ],
    upright:
      "Behind the veil is knowledge you can feel but not yet fully articulate — trust it anyway. The High Priestess keeps her own counsel; not every truth is ready to be spoken aloud, and that's not the same as being unsure.",
    reversed:
      "Disconnected from your own instinct, drowning it in other people's opinions. Or secrets kept for the wrong reason — out of fear, not discernment.",
    ritual: "Sit with the quiet answer before you go looking for a louder one.",
    material: "Liquid jersey — takes the shape of the body, then releases it.",
    colorway: ["#b1e1ff", "#5c9bcd"],
  },
  {
    number: 3,
    roman: "III",
    name: "The Empress",
    subtitle: "Abundance that doesn't apologize",
    glyph: "✤",
    element: "Earth",
    reduction: 3,
    keywords: ["abundance", "nurture", "creation"],
    meaning:
      "Something you're growing is ready to be fed, not managed. Give it resource, not another spreadsheet.",
    actions: [
      "Put real time or money behind the thing that's already working.",
      "Take care of your body today like it's the instrument doing the work.",
      "Let something be generous instead of efficient, just for today.",
    ],
    upright:
      "You are in a season of real growth — creative, physical, financial. The Empress doesn't ration; she tends. What you're building wants more warmth and attention, not more restriction.",
    reversed:
      "Creative block, or growth mistaken for excess. Something is being smothered by too much care, or starved by too little — check which.",
    ritual: "Feed the thing that's already growing.",
    material: "Botanical-dyed cotton — colour drawn from what already grew.",
    colorway: ["#ff9eb8", "#f5c97a"],
  },
  {
    number: 4,
    roman: "IV",
    name: "The Emperor",
    subtitle: "Structure, held without apology",
    glyph: "▣",
    element: "Fire",
    reduction: 4,
    keywords: ["authority", "order", "discipline"],
    meaning:
      "You need to lead this, not consult on it. Someone has to set the terms today, and it's you.",
    actions: [
      "Make the call instead of gathering one more opinion.",
      "Write down the one rule that governs this decision, and hold it.",
      "Take responsibility for something out loud, publicly.",
    ],
    upright:
      "Order isn't the enemy of the work — it's what lets the work survive contact with the world. The Emperor builds the frame first. Lead from structure, not from mood.",
    reversed:
      "Control for its own sake, or a refusal to lead when leadership is exactly what's needed. Rigidity standing in for real authority.",
    ritual: "Set one rule today and actually hold the line on it.",
    material: "Structured twill — engineered to keep its line.",
    colorway: ["#998888", "#4a3f45"],
  },
  {
    number: 5,
    roman: "V",
    name: "The Hierophant",
    subtitle: "What's been taught, tested",
    glyph: "⌘",
    element: "Earth",
    reduction: 5,
    keywords: ["tradition", "teaching", "structure"],
    meaning:
      "There's an established way of doing this — the question today is whether it actually still fits, or whether you're following it out of habit.",
    actions: [
      "Ask someone with real experience how they'd approach this.",
      "Write down one inherited rule and decide, on purpose: keep it or retire it.",
      "Teach someone else one thing you know cold.",
    ],
    upright:
      "There's real value in the established path — a mentor, a method, a tradition worth learning properly before you improvise on it. The Hierophant hands down structure so you don't have to rebuild it from zero.",
    reversed:
      "Following the rule because it's the rule, not because it works. Or rejecting all structure on principle, which is its own kind of rigidity.",
    ritual: "Learn the actual technique before you skip it.",
    material: "Hand-finished hem — the oldest step we still refuse to automate.",
    colorway: ["#f5c97a", "#a67c2e"],
  },
  {
    number: 6,
    roman: "VI",
    name: "The Lovers",
    subtitle: "The choice that reveals your values",
    glyph: "⧖",
    element: "Air",
    reduction: 6,
    keywords: ["alignment", "union", "choice"],
    meaning:
      "This isn't really about which option is better — it's about which one is actually true to what you want.",
    actions: [
      "Name what you actually value in this, out loud, before you compare options.",
      "Have the direct conversation instead of the implied one.",
      "Choose the option that costs you something real — that's usually the honest one.",
    ],
    upright:
      "A real choice, and a real connection, are both in front of you — not a transaction, an alignment. The Lovers card is about values meeting each other honestly, not about compromise for its own sake.",
    reversed:
      "Misalignment dressed up as harmony, or a decision made to please someone instead of to be true. Check who you're actually choosing for.",
    ritual: "Say what you actually want, plainly, to the person involved.",
    material: "Double-faced weave — two surfaces, one cloth.",
    colorway: ["#c48dff", "#ff9eb8"],
  },
  {
    number: 7,
    roman: "VII",
    name: "The Chariot",
    subtitle: "Two forces, one direction",
    glyph: "➤",
    element: "Water",
    reduction: 7,
    keywords: ["willpower", "momentum", "control"],
    meaning:
      "You have real drive right now, pulling in more than one direction. The work today is steering, not stopping.",
    actions: [
      "Choose the single outcome that makes today a win; put it first.",
      "Cut or delegate one commitment to protect that outcome.",
      "Work one uninterrupted block with notifications off.",
    ],
    upright:
      "Two horses, one chariot, one hand on the reins — that's you right now, holding competing forces together by sheer will and pointing them somewhere on purpose. Victory is available through focus, not through force.",
    reversed:
      "Motion without direction, or willpower burning out because nothing is actually steering. Slow down, check the heading, restart.",
    ritual: "Choose one direction and give everything else a smaller lane.",
    material: "Four-way stretch — engineered to move first, recover fast.",
    colorway: ["#67e8f9", "#0e7490"],
  },
  {
    number: 8,
    roman: "VIII",
    name: "Strength",
    subtitle: "Force that doesn't need to raise its voice",
    glyph: "✧",
    element: "Fire",
    reduction: 8,
    keywords: ["courage", "patience", "quiet power"],
    meaning:
      "You don't need to dominate this situation — you need to stay steady inside it, which takes more real strength than force does.",
    actions: [
      "Respond to the hard thing calmly instead of matching its heat.",
      "Hold your position without needing to win the argument.",
      "Do the difficult task gently, at your own pace, instead of gritting through it.",
    ],
    upright:
      "The lion is calm because the hand on it is calm. Real strength here looks like patience, not conquest — the ability to stay soft and steady with something that could otherwise run you over.",
    reversed:
      "Self-doubt where confidence should be, or forcing an issue that only ever needed patience. Check whether you're fighting something that would have settled on its own.",
    ritual: "Meet one hard thing today with calm instead of force.",
    material: "Single-piece cut — one owner, one run of one.",
    colorway: ["#f5c97a", "#c48dff"],
  },
  {
    number: 9,
    roman: "IX",
    name: "The Hermit",
    subtitle: "The lantern you carry alone",
    glyph: "‖",
    element: "Earth",
    reduction: 9,
    keywords: ["solitude", "introspection", "guidance"],
    meaning:
      "You're between certainties, and withdrawing to think is the correct move today — not avoidance, just necessary distance.",
    actions: [
      "Take real time alone with the actual question, not the noise around it.",
      "Turn down one invitation today in favor of finishing your own thought.",
      "Write the question down plainly before you go looking for an answer.",
    ],
    upright:
      "The Hermit doesn't withdraw out of fear — he withdraws because the answer he's looking for only shows up in quiet. Carry your own light for a while; you don't need company to find your way through this.",
    reversed:
      "Isolation instead of solitude — pulling away so far that no one can reach you when you actually need them.",
    ritual: "Take one hour completely alone with the real question.",
    material: "Low-light iridescent finish — reads differently after dark.",
    colorway: ["#1e1624", "#c48dff"],
  },
  {
    number: 10,
    roman: "X",
    name: "The Wheel of Fortune",
    subtitle: "What returns, returns changed",
    glyph: "◍",
    element: "Fire",
    reduction: 1,
    keywords: ["cycles", "fate", "change"],
    meaning:
      "The pattern repeating isn't fate closing in on you — it's a loop you can still change one input on.",
    actions: [
      "Name the loop in one sentence: 'every time X, I do Y.'",
      "Change one input today, however small, and note what shifts.",
      "Close one open cycle: finish, cancel, or hand it off.",
    ],
    upright:
      "You've been here before, at a different altitude. The Wheel turns regardless of whether you fight it — the actual skill is reusing what worked last time and not repeating what only worked once.",
    reversed:
      "A loop, not a spiral — the same year on repeat because the same input keeps getting fed back in. Change the variable or the wheel just keeps turning in place.",
    ritual: "Change one variable in the pattern you keep repeating.",
    material: "Closed-loop fibre — recovered, respun, reworn.",
    colorway: ["#6ee7b7", "#0f766e"],
  },
  {
    number: 11,
    roman: "XI",
    name: "Justice",
    subtitle: "The account, settled honestly",
    glyph: "⚖",
    element: "Air",
    reduction: 2,
    keywords: ["truth", "fairness", "consequence"],
    meaning:
      "An honest accounting is overdue — of money, time, or a decision. It will be lighter than you think, once it's actually looked at.",
    actions: [
      "Open the number you've been avoiding and write it down.",
      "Admit one thing that isn't working, out loud, to someone.",
      "Fix the smallest piece of it today; schedule the rest.",
    ],
    upright:
      "The scales aren't punishment — they're clarity. Whatever gets weighed honestly today gets resolved. What you refuse to look at will bill you twice; what you look at straight, you can actually settle.",
    reversed:
      "Avoidance, or a double standard you're applying to yourself versus everyone else. Self-punishment dressed as fairness isn't fairness.",
    ritual: "Total one real cost you've been rounding down.",
    material: "Full traceability label — origin, mill, maker.",
    colorway: ["#f5ede6", "#998888"],
  },
  {
    number: 12,
    roman: "XII",
    name: "The Hanged Man",
    subtitle: "Held, not stuck",
    glyph: "⌇",
    element: "Water",
    reduction: 3,
    keywords: ["surrender", "new perspective", "pause"],
    meaning:
      "Nothing productive happens by pushing harder right now — the move is to change your vantage point, not your effort level.",
    actions: [
      "Change your literal position: walk, sleep on it, explain it to a stranger.",
      "Set the date you'll revisit this, then actually stop touching it.",
      "Let something take longer than you want, on purpose.",
    ],
    upright:
      "Hanging upside down changes what you can see. This isn't defeat — it's a deliberate pause that shows you the thing from an angle effort alone never would have.",
    reversed:
      "Waiting has become hiding, and the pause has outlived its usefulness. The perspective shift already happened — time to come back down and act on it.",
    ritual: "See the situation from a completely different angle before deciding anything.",
    material: "Drape-tested silhouette — hung 72 hours before approval.",
    colorway: ["#b1e1ff", "#1e1624"],
  },
  {
    number: 13,
    roman: "XIII",
    name: "Death",
    subtitle: "The ending that makes room",
    glyph: "✂",
    element: "Water",
    reduction: 4,
    keywords: ["ending", "transformation", "release"],
    meaning:
      "Something needs to end cleanly, on purpose, before whatever comes next can actually start.",
    actions: [
      "Undo the one thing you know is wrong — the process, the plan, the sentence.",
      "Remove one thing today instead of adding one.",
      "Tell whoever's affected before you cut, not after.",
    ],
    upright:
      "This isn't destruction for its own sake — it's the necessary ending that clears the site for the next real thing. Nothing new gets built on top of something that hasn't actually finished yet.",
    reversed:
      "Clinging to a version of something — a role, a relationship, a plan — that no longer fits anyone, including you.",
    ritual: "End one obligation this week, kindly and completely.",
    material: "Deconstructable seams — designed to come apart for remaking.",
    colorway: ["#4a3f45", "#f5ede6"],
  },
  {
    number: 14,
    roman: "XIV",
    name: "Temperance",
    subtitle: "The blend that actually holds",
    glyph: "⊢",
    element: "Fire",
    reduction: 5,
    keywords: ["balance", "moderation", "integration"],
    meaning:
      "Two things that feel opposed can actually work together today, if you stop treating it as a choice between them.",
    actions: [
      "Combine the two options instead of picking one.",
      "Cut one estimate in half and see if the plan still holds.",
      "Do the moderate version of the thing instead of the extreme one, on purpose.",
    ],
    upright:
      "This is patient alchemy, not compromise — finding the exact mixture where two things that seemed incompatible turn out to complete each other. Blend deliberately; don't rush the pour.",
    reversed:
      "Excess or extremity where balance was actually called for. Overcorrecting in one direction because the middle felt too slow.",
    ritual: "Blend two things today instead of choosing between them.",
    material: "Zero-waste marker layout — pattern nested to the millimetre.",
    colorway: ["#f5c97a", "#c48dff"],
  },
  {
    number: 15,
    roman: "XV",
    name: "The Devil",
    subtitle: "The comfortable trap",
    glyph: "⛓",
    element: "Earth",
    reduction: 6,
    keywords: ["habit", "compulsion", "release"],
    meaning:
      "Something has you tied — a habit, an obligation, an agreement you keep calling a preference. Name it and loosen one knot today.",
    actions: [
      "Write down what you're actually bound to, and by whom.",
      "Cancel, renegotiate, or set an end date on one of them today.",
      "Replace the trigger, not the habit — change the cue.",
    ],
    upright:
      "The chains in this card are loose enough to walk out of — that's the part people miss. What's binding you isn't as fixed as it feels; it's just familiar, and familiar gets mistaken for permanent.",
    reversed:
      "The chain is loosening, and you can feel it. Name what you're walking away from clearly, so it stays named and doesn't creep back.",
    ritual: "Skip one automatic habit today and notice what's actually underneath it.",
    material: "Anti-fast-fashion clause — no piece produced on speculation.",
    colorway: ["#1e1624", "#ef4444"],
  },
  {
    number: 16,
    roman: "XVI",
    name: "The Tower",
    subtitle: "Collapse that clears the site",
    glyph: "⌁",
    element: "Fire",
    reduction: 7,
    keywords: ["rupture", "honesty", "rebuild"],
    meaning:
      "What just fell was hollow, and its falling is useful information. Build on the site, not on the rubble.",
    actions: [
      "Admit one thing that is not working, out loud, to someone.",
      "Salvage the one part worth keeping and write down why.",
      "Rebuild the smallest honest version today — one page, one call, one piece.",
    ],
    upright:
      "The house card. What just fell was hollow, and its falling is information, not just damage. Sixteen reduces to seven: the person who walks out of the rubble starts looking, on purpose, for what's actually true.",
    reversed:
      "Propping up a structure you already know is empty, delaying a collapse that would actually be a relief.",
    ritual: "Admit one thing that is not working. Out loud, to someone.",
    material: "Reinforced stress points — built for the day it all pulls.",
    colorway: ["#ff9eb8", "#7a1030"],
  },
  {
    number: 17,
    roman: "XVII",
    name: "The Star",
    subtitle: "Hope with coordinates",
    glyph: "✵",
    element: "Air",
    reduction: 8,
    keywords: ["hope", "healing", "direction"],
    meaning:
      "After whatever just broke, there's real clarity available — not a rescue, a direction you can actually steer by.",
    actions: [
      "Put every open thread on one page and draw the lines between them.",
      "Find the single item that unblocks three others and do that one.",
      "Tell one person the whole picture so it stops living only in your head.",
    ],
    upright:
      "After the tower, the sky clears. The Star isn't naive optimism — it's a fixed point far enough away to navigate by for years, not weeks. Pour the water out; refill what's actually worth refilling.",
    reversed:
      "Wishing without navigating — hope with no coordinates attached to it. Convert the dream into the next three concrete moves.",
    ritual: "Write the five-year sentence. One sentence.",
    material: "Sky-dyed gradient — no two panels identical.",
    colorway: ["#b1e1ff", "#c48dff"],
  },
  {
    number: 18,
    roman: "XVIII",
    name: "The Moon",
    subtitle: "Working in low light",
    glyph: "☾",
    element: "Water",
    reduction: 9,
    keywords: ["uncertainty", "instinct", "the unconscious"],
    meaning:
      "You can't see the whole path right now, and you don't need to. Move by feel; verify once you're actually in daylight.",
    actions: [
      "Make the choice on feel, then verify it once against a fact.",
      "Protect your first two hours for the work only you can do.",
      "Write down the hunch and the date; check back in a week.",
    ],
    upright:
      "Between the two pillars, in reflected light, things look different than they will in the morning — that doesn't make them false. Trust the instinct that's forming; the facts will catch up.",
    reversed:
      "Anxiety impersonating intuition. Get one hard fact before you decide anything on feel alone.",
    ritual: "Record the thought that keeps you up. Judge it tomorrow, not tonight.",
    material: "Low-light iridescent finish — reads differently after dark.",
    colorway: ["#0e0a0f", "#b1e1ff"],
  },
  {
    number: 19,
    roman: "XIX",
    name: "The Sun",
    subtitle: "Seen, and fine with it",
    glyph: "☀",
    element: "Fire",
    reduction: 1,
    keywords: ["vitality", "clarity", "confidence"],
    meaning:
      "Visibility is on your side today. Be seen doing the thing, rather than preparing to be seen doing it.",
    actions: [
      "Publish, send, or show one piece of work today.",
      "Ask directly for the thing you want — one clear sentence.",
      "Credit someone publicly.",
    ],
    upright:
      "Full light, no filter needed. Whatever was uncertain under the Moon gets confirmed here — stop editing yourself down to a comfortable size for other people.",
    reversed:
      "Performing brightness while running on empty. Rest is also a power move; you don't owe anyone your best face today.",
    ritual: "Wear the piece you've been 'saving.' Today counts.",
    material: "UV-stable pigment — colour that does not flinch.",
    colorway: ["#f5c97a", "#ff9eb8"],
  },
  {
    number: 20,
    roman: "XX",
    name: "Judgement",
    subtitle: "The call you actually hear",
    glyph: "⧉",
    element: "Fire",
    reduction: 2,
    keywords: ["awakening", "reckoning", "renewal"],
    meaning:
      "Something is calling you to account and to a new chapter at the same time — answer both honestly.",
    actions: [
      "Ask the direct question you've been asking sideways.",
      "Reread the thing you skimmed — the contract, the message, the data.",
      "Change one plan today to match what you now actually know.",
    ],
    upright:
      "Everything from every cycle before this one is on the table, and it's a relief, not a threat. The version of you who answers the call now is the one who sets the next decade.",
    reversed:
      "Avoiding a summons that's already been made — a truth that's already been said out loud once, waiting for you to actually respond to it.",
    ritual: "Open the message, the invoice, or the file you've been avoiding.",
    material: "Full-disclosure spec sheet — every input listed.",
    colorway: ["#ffffff", "#f5c97a"],
  },
  {
    number: 21,
    roman: "XXI",
    name: "The World",
    subtitle: "Completion, nothing left over",
    glyph: "◉",
    element: "Earth",
    reduction: 3,
    keywords: ["completion", "integration", "arrival"],
    meaning:
      "A cycle is closing cleanly, with nothing left over. Finish it and actually let it be finished before starting the next one.",
    actions: [
      "Complete the last 5% of one thing and call it done, publicly.",
      "Archive, invoice, or hand off what remains.",
      "Write one line on what you'd do differently, then start the next thing.",
    ],
    upright:
      "The cycle closes and the piece is whole — every card that came before this one led here. Take the full measure of what you finished before you reach for what's next.",
    reversed:
      "Rushing past your own finish line without marking it, already halfway into the next thing before this one is actually done.",
    ritual: "Celebrate something you completed and told no one about.",
    material: "Signed final piece — one owner, cycle closed.",
    colorway: ["#c48dff", "#6ee7b7"],
  },
];

export const ARCANA_COUNT = ARCANA.length;
