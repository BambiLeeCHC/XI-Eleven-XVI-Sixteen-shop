/**
 * THE DAILY CODE — 33 brand-authored lines on sustainability and
 * self-empowerment, one surfaced per day (deterministic by date).
 *
 * All lines are written in-house and attributed to the house, so the set is
 * clean to license and print (cards, tags, hangtags, calendars, packaging).
 *
 * © XI Eleven XVI Sixteen L.L.C.
 */

export interface DailyCode {
  id: number;
  code: string; // display code, e.g. "XI·XVI / 007"
  quote: string;
  theme: "Sustainability" | "Self-Empowerment" | "Craft";
  practice: string; // one executable action
}

const raw: Array<[string, DailyCode["theme"], string]> = [
  ["The most sustainable garment on earth is the one nobody guessed you'd want.", "Sustainability", "Buy nothing on speculation today — including for yourself."],
  ["Waste is not a cost of doing business. It is a design failure with a receipt.", "Sustainability", "Find one wasteful step in your day and delete it."],
  ["You are allowed to take up the exact amount of space you occupy.", "Self-Empowerment", "Stop apologizing in one message before you send it."],
  ["Own less. Choose harder. Wear it out.", "Sustainability", "Wear the same favourite piece twice this week, unapologetically."],
  ["Restraint is the most advanced technology we have.", "Craft", "Remove one element instead of adding one."],
  ["Fit is a form of respect — for the body, and for the maker.", "Craft", "Get one thing tailored instead of buying its replacement."],
  ["Intuition is data you collected before you learned to write it down.", "Self-Empowerment", "Act on the first instinct you had this morning."],
  ["Nothing you make in a hurry will outlive you.", "Craft", "Give one task the time it actually needs."],
  ["A closet full of almosts is more expensive than a closet of nine certainties.", "Sustainability", "Remove one 'almost' from your closet and rehome it."],
  ["Self-expression is not vanity. It is a survival skill.", "Self-Empowerment", "Dress today for the person you're becoming."],
  ["Repair is the loudest possible statement about value.", "Sustainability", "Mend one thing tonight."],
  ["The fear of coming up short is what makes an industry overproduce. Same for people.", "Self-Empowerment", "Ask for the exact thing you want, once, plainly."],
  ["Trends are borrowed opinions. Precision is your own.", "Craft", "Choose by fit and feel today, not by feed."],
  ["Anything made for everyone was made for no one.", "Craft", "Pick the specific option over the safe one."],
  ["Zero unsold inventory is a moral position, not a logistics stat.", "Sustainability", "Ask one brand what happens to what they don't sell."],
  ["You do not need permission. You need a first cut.", "Self-Empowerment", "Start the thing badly, on purpose, in ten minutes."],
  ["Discount culture teaches you your taste is negotiable. It isn't.", "Self-Empowerment", "Skip one sale you don't need."],
  ["Every closed cycle ends at nine: nothing left over.", "Sustainability", "Finish something today rather than starting two things."],
  ["Confidence is just repetition that stopped being scary.", "Self-Empowerment", "Repeat yesterday's hard thing."],
  ["The garment remembers how you treated it. So does your body.", "Craft", "Wash cold. Sleep earlier."],
  ["Illumination arrives before proof. Move anyway.", "Self-Empowerment", "Send the message before you feel ready."],
  ["What falls apart cleanly can be rebuilt. What rots quietly cannot.", "Self-Empowerment", "Name one hollow thing you're propping up."],
  ["Made to order means someone waited for you. Be worth the wait.", "Craft", "Do one piece of work at full quality, slowly."],
  ["Ninety-two million tons a year is not fashion. It is a habit.", "Sustainability", "Break one automatic purchase habit this week."],
  ["Your standards are not too high. Your patience is too short.", "Self-Empowerment", "Wait for the right one instead of taking the near one."],
  ["Luxury without responsibility is just markup with better lighting.", "Sustainability", "Read one label all the way through today."],
  ["The body is not a problem to be solved by a size.", "Self-Empowerment", "Buy for the body you have today."],
  ["Craft is care, made visible at a distance.", "Craft", "Finish the edge nobody will inspect."],
  ["You cannot recycle your way out of buying too much.", "Sustainability", "Choose one fewer, one better."],
  ["Say the unpopular true thing while it's still early.", "Self-Empowerment", "Give one honest piece of feedback today."],
  ["Quality is a decision you make once and then defend a hundred times.", "Craft", "Defend one standard you were about to let slide."],
  ["Nothing is more sustainable than a thing you still love in year seven.", "Sustainability", "Pick something to keep for seven years."],
  ["The clock is not chasing you. It is checking in. 11:16.", "Self-Empowerment", "At 11:16, ask yourself if this is still the plan."],
];

export const DAILY_CODES: DailyCode[] = raw.map(([quote, theme, practice], i) => ({
  id: i + 1,
  code: `XI·XVI / ${String(i + 1).padStart(3, "0")}`,
  quote,
  theme,
  practice,
}));
